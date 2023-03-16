import * as dotEnv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import {
    APIGatewayEvent,
    Context,
    APIGatewayProxyResult,
    SQSEvent,
} from 'aws-lambda';
import { ddbClient } from '../data-access/db-client';
import { IMail, IMailSubmitted, IMailTrailEntity } from '../modules/mailer-service/src/entities/mail';
// import { publishMailRetryEvent } from '../modules/mailer-service';
import { delay } from '../modules/mailer-service/src/helpers/generic/utils';
import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';

dotEnv.config();

export const main = async (
    event: APIGatewayEvent | SQSEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        const sqsEvent = <SQSEvent>event;
        if (sqsEvent && sqsEvent.Records && sqsEvent.Records.length) {
            return await processBody(<string>sqsEvent.Records[0].body);
        }
        throw new Error(`Error handling email failed with event: ${event}`);
    } catch (err) {
        console.error(
            `Exception thrown at function handle-email-failed.main: ${err}`
        );
        const error = err as Error;
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to perform operation',
                errorMsg: error.message,
                errorStack: error.stack,
            }),
        };
    }
};

const processBody = async (body: string) => {
    console.log('processBody - body', body);
    const parsedBody = JSON.parse(body);
    console.log('parsedBody', parsedBody);
    const detail = parsedBody.detail;
    console.log('detail', detail);
    if (!(await persistData(detail))) {
        throw new Error('Process body operation failed');
    }
    await delay(5000);  // arbitrary delay before retrying
    const mailRetryReceipt = await publishMailRetryEvent({
        emailTransactionId: detail.emailTransactionId,
        uploadTransactionId: detail.uploadTransactionId,
        emailData: detail.emailData
    });
    console.log('mailRetryReceipt', mailRetryReceipt);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Handle email failed function triggered with body: ${JSON.stringify(
                body
            )}`,
        }),
    };
};

const persistData = async (data: IMailSubmitted): Promise<boolean> => {
    console.log(`persistData - data: "${JSON.stringify(data)}"`);
    const rowData: IMailTrailEntity = {
        ...data,
        id: uuidv4(),
        attemptNumber: 0,
    };
    console.log('rowData', rowData);
    console.log('process.env.MAIL_TRAIL_TABLE_NAME', process.env.MAIL_TRAIL_TABLE_NAME);
    try {
        const params = {
            TableName: process.env.MAIL_TRAIL_TABLE_NAME,
            Item: marshall(rowData || {}),
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));
        console.log(`persistData - createResult: "${JSON.stringify(createResult)}"`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const publishMailRetryEvent = async (payload: IMail): Promise<string> => {
    console.log('publishMailRetryEvent with payload :', payload);
    console.log('process.env', process.env);
    try {
        // eventbridge parameters for setting event to target system
        const params: PutEventsCommandInput = {
            Entries: [
                {
                    Source: process.env.EMAIL_EVENT_SOURCE_NAME,
                    Detail: JSON.stringify(payload),
                    DetailType: process.env.EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUS_NAME,
                }
            ]
        };
        const ebClient = new EventBridgeClient({});
        const ret = await ebClient.send(new PutEventsCommand(params));
        console.log('Success, event sent: ', ret);
        const requestId = ret['$metadata'].requestId;

        return <string>requestId;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
