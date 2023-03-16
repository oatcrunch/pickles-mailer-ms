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
import { IMailSubmitted, IMailTrailEntity } from '../modules/mailer/src/models';

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
    console.log('processBody - body', body);
    const parsedBody = JSON.parse(body);
    console.log('parsedBody', parsedBody);
    const detail = parsedBody.detail;
    console.log('detail', detail);
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
        console.log(`persistData - createResult: "${createResult}"`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};
