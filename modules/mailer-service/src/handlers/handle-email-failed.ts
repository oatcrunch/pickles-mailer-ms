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
} from '../entities/mail';
import { delay } from '../helpers/generic/utils';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { MAIL_TRAIL_TABLE_NAME, RETRY_DELIVERY_DELAY_MS } from '../helpers/generic/constants';
import { publishMailRetryEvent } from '../helpers/event/publish-mail-retry';

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
    const id = uuidv4();

    if (!(await persistData(detail, id))) {
        throw new Error('Process body operation failed');
    }

    await delay(RETRY_DELIVERY_DELAY_MS); // arbitrary delay before retrying
    const mailRetryReceipt = await publishMailRetryEvent(
        {
            id,
            emailTransactionId: detail.emailTransactionId,
            uploadTransactionId: detail.uploadTransactionId,
            emailData: detail.emailData,
            creationDate: new Date(),
            undeliveredEmailAddresses: detail.undeliveredEmailAddresses,
            deliveredEmailAddresses: detail.deliveredEmailAddresses,
            successfulDelivery: false
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

const persistData = async (data: IMailSubmitted, id: string): Promise<boolean> => {
    const rowData: IMailTrailEntity = {
        ...data,
        id,
        attemptNumber: 1,
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
