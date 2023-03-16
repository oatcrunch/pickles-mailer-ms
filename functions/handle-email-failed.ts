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
import {
    IMailSubmitted,
    IMailTrailEntity,
} from '../modules/mailer-service/src/entities/mail';
import { MAIL_TRAIL_TABLE_NAME, publishMailRetryEvent } from '../modules/mailer-service';
import { delay } from '../modules/mailer-service/src/helpers/generic/utils';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

dotEnv.config();

// Saves email delivery failure to database and trigger event for retries
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
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-email-failed.main: ${err}`
        );
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to perform operation',
                errorMsg: err.message,
                errorStack: err.stack,
            }),
        };
    }
};

const processBody = async (body: string) => {
    const parsedBody = JSON.parse(body);
    const detail = parsedBody.detail;

    if (!(await persistData(detail))) {
        throw new Error('Process body operation failed');
    }

    await delay(5000); // arbitrary delay before retrying
    const mailRetryReceipt = await publishMailRetryEvent(
        {
            emailTransactionId: detail.emailTransactionId,
            uploadTransactionId: detail.uploadTransactionId,
            emailData: detail.emailData,
        },
        new EventBridgeClient({}) // override with default
    );

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Handle email failed function triggered with body: ${JSON.stringify(
                body
            )} with receipt ${mailRetryReceipt}`,
        }),
    };
};

const persistData = async (data: IMailSubmitted): Promise<boolean> => {
    const rowData: IMailTrailEntity = {
        ...data,
        id: uuidv4(),
        attemptNumber: 0,
    };

    try {
        const params = {
            TableName: MAIL_TRAIL_TABLE_NAME,
            Item: marshall(rowData || {}),
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));
        console.log(
            `persistData - createResult: "${JSON.stringify(createResult)}"`
        );
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};
