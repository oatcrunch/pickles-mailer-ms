import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import * as path from 'path';
import mime from 'mime-types';
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';
import {
    APIGatewayEvent,
    Context,
    APIGatewayProxyResult,
    SQSEvent,
} from 'aws-lambda';
import { ddbClient } from '../data-access/db-client';
import { IMailSubmitted, IMailTrailEntity } from '../entities/mail';
import {
    ALLOWABLE_RETRIES,
    AWS_BUCKET_NAME,
    MAIL_TRAIL_TABLE_NAME,
    RETRY_DELIVERY_DELAY_MS,
} from '../helpers/generic/constants';
import { IAttachmentInfo } from '../models/email';
import { sendEmail } from '../helpers/mail/transport-utils';
import { IEmailDeliveryOAuth2Config } from '../models/credentials';
import { delay } from '../helpers/generic/utils';
import { publishMailRetryEvent } from '../helpers/event/publish-mail-retry';

// Generate OAuth2 config for email transporter
const oAuth2Config: IEmailDeliveryOAuth2Config = {
    email: process.env.EMAIL_ADDRESS!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    refreshToken: process.env.REFRESH_TOKEN!,
};

const client = new S3Client({});

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
        throw new Error(`Error sending enquiry with event: ${event}`);
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-email-retries.main: ${err}`
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
    const detail = <IMailTrailEntity>parsedBody.detail;

    if (!detail) {
        throw Error('There is no required info in detail');
    }

    // 1. look for db rows based on email transaction id
    const id = detail.id;
    const emailTransactionId = detail.emailTransactionId;
    const undeliveredEmailAddresses = detail.undeliveredEmailAddresses;
    const params = {
        TableName: MAIL_TRAIL_TABLE_NAME,
        KeyConditionExpression:
            'id = :id AND emailTransactionId = :emailTransactionId',
        ExpressionAttributeValues: {
            ':id': { S: id },
            ':emailTransactionId': { S: emailTransactionId },
        },
        ScanIndexForward: false,
        Limit: 1,
    };

    const { Items } = await ddbClient.send(new QueryCommand(params));
    const umarshalledItems = Items?.map((item) => unmarshall(item));
    console.log('umarshalledItems', umarshalledItems);

    // 2. if count is more than 3 then return saying exceeded retries, else proceed with step 3
    if (!umarshalledItems || !umarshalledItems.length) {
        throw Error('Umarshalled queried items undefined');
    }

    const mailEntity = umarshalledItems[0] as IMailTrailEntity;
    const attemptNumber = mailEntity.attemptNumber || 0;
    const emailData = mailEntity.emailData;

    if (attemptNumber >= ALLOWABLE_RETRIES) {
        const message = `Exceeded number of retries (allowed retries = ${ALLOWABLE_RETRIES})`;
        console.log(message);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message,
            }),
        };
    }

    console.log(
        `Current attempt: ${attemptNumber} out of ${ALLOWABLE_RETRIES}`
    );

    // 3. if count is less than 3 and if upload transaction id is not empty, then list objects from s3 based on that id
    const listObjCmd = new ListObjectsV2Command({
        Bucket: AWS_BUCKET_NAME,
        Prefix: mailEntity.uploadTransactionId,
    });

    try {
        const { Contents } = await client.send(listObjCmd);
        const contents = Contents || [];
        const fileInfos: IAttachmentInfo[] = [];

        for (const c of contents) {
            const getObjCmd = new GetObjectCommand({
                Bucket: AWS_BUCKET_NAME,
                Key: c.Key,
            });
            const response = await client.send(getObjCmd);
            const body = response.Body;
            const fileInfo: IAttachmentInfo = {
                filename: c.Key || '',
                fileId: c.Key || '',
                ext: path.extname(c.Key || ''),
                mimetype: <string>mime.lookup(c.Key || ''),
                content: body,
            };
            console.log('fileinfo', fileInfo);
            fileInfos.push(fileInfo);
        }

        // 4. with the email content and optionally attachments from s3, retry sending email
        emailData.to = undeliveredEmailAddresses?.join(','); // Replace original recipients with undelivered recipients
        const receipt = await sendEmail(oAuth2Config, {
            ...emailData,
            fileInfos,
        });

        // 5. Persist data after retry regardless success or failed
        const newId = uuidv4();
        await persistData(
            {
                ...detail,
                deliveredEmailAddresses: receipt.deliveredEmailAddresses || [],
                undeliveredEmailAddresses:
                    receipt.undeliveredEmailAddresses || [],
                successfulDelivery: receipt.success,
            },
            newId,
            attemptNumber + 1
        );

        // 5a. if email sent successful then and return saying succeeded
        if (receipt.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Handle email retry function triggered with body: ${JSON.stringify(
                        receipt
                    )}`,
                }),
            };
        }
        // 5b. if email sent failed then and trigger event for retry after x seconds delay
        await delay(RETRY_DELIVERY_DELAY_MS);
        const mailRetryReceipt = await publishMailRetryEvent(
            {
                id: newId,
                emailTransactionId: detail.emailTransactionId,
                uploadTransactionId: detail.uploadTransactionId,
                emailData: detail.emailData,
                creationDate: new Date(),
                undeliveredEmailAddresses: detail.undeliveredEmailAddresses,
                deliveredEmailAddresses: detail.deliveredEmailAddresses,
                successfulDelivery: false,
            },
            new EventBridgeClient({}) // override with default
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Handle email retry function triggered with email receipt: ${JSON.stringify(
                    receipt
                )} and retry receipt ${mailRetryReceipt}`,
            }),
        };
    } catch (err) {
        console.error('Error reading S3 objects', err);
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

const persistData = async (
    data: IMailSubmitted,
    id: string,
    currentAttempt: number
): Promise<boolean> => {
    const rowData: IMailTrailEntity = {
        ...data,
        id,
        attemptNumber: currentAttempt,
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
