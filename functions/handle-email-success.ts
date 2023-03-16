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

dotEnv.config();

// Saves successful email delivery to database
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
        throw new Error(`Error handling email success with event: ${event}`);
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-email-success.main: ${err}`
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

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Handle email success function triggered with body: ${JSON.stringify(
                body
            )}`,
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
            TableName: process.env.MAIL_TRAIL_TABLE_NAME,
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
