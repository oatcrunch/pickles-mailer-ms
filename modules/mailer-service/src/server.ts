import express from 'express';
import dotEnv from 'dotenv';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { uploadS3 } from './helpers/upload/upload-utils';
import { validateEmailDto } from './helpers/mail/mail-utils';
import { publishMailSentSuccessfulEvent } from './helpers/event/publish-mail-sent-successful';
import { publishMailSentFailedEvent } from './helpers/event/publish-mail-sent-failed';
import { createAttachmentsObj } from './helpers/mail/attachment-utils';
import { IEmailDeliveryOAuth2Config } from './models/credentials';
import { sendEmail } from './helpers/mail/transport-utils';
import { IHttpResponse } from './models/http';

dotEnv.config();

// Populate env vars here
const PORT = process.env.EMAIL_PORT || 3000;
const EMAIL = process.env.EMAIL_ADDRESS;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Generate OAuth2 config for email transporter
const oAuth2Config: IEmailDeliveryOAuth2Config = {
    email: EMAIL!,
    clientId: CLIENT_ID!,
    clientSecret: CLIENT_SECRET!,
    refreshToken: REFRESH_TOKEN!,
};

// Initializations
const upload = multer();
const app = express();
app.use(express.json());

// Server instance unique ID
const serverId = uuidv4();

// Specs for Swagger
const file = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

// Swagger endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
    const response: IHttpResponse = {
        instanceId: serverId,
        message: `Health check endpoint reachable!`,
    };
    res.status(200).send(response);
});

// HTTP POST with body payload test endpoint
app.post('/test', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const response: IHttpResponse = {
            instanceId: serverId,
            message: `You have just sent a req.body with HTTP POST`,
            body: req.body,
        };
        res.status(200).send(response);
    } catch (err) {
        const response: IHttpResponse = {
            instanceId: serverId,
            message: 'Error sending POST with req.body',
            body: err.message,
        };
        res.status(500).send(response);
    }
});

// HTTP POST endpoint to send email (supports both json and file(s) as multipart)
app.post(
    '/email',
    upload.fields([{ name: 'file', maxCount: 3 }, { name: 'json' }]),
    async (req: Request, res: Response) => {
        try {
            if (!req.body) {
                throw Error(
                    'Body is required with "json" and "file" (optional) fields'
                );
            }
            console.log('POST /email: body', req.body);
            const files: any = req.files;
            console.log(
                'POST /email: files',
                files ? files['file'] : undefined
            );

            if (!req.body.json) {
                throw Error('Body.json object is mandatory');
            }

            let parsedJson = {};

            try {
                parsedJson = JSON.parse(req.body.json);
            } catch (err) {
                // Doing this to filter low level stack errors to client
                // Only allow low level stack errors to be logged internally
                console.log(
                    `Error thrown when parsing using JSON parser: ${err?.message}`
                );
                throw Error('req.body.json is not in the correct JSON format');
            }

            // Ensure integrity of the email data before processing happens
            if (!validateEmailDto(parsedJson)) {
                throw Error(
                    'Body.json object required. See example: { to: "john.doe@email.com", subject: "Greetings", text: "Hello, how are you?" }.'
                );
            }

            // 0. Extracting email attachments if any
            const attachments = createAttachmentsObj(
                files ? files['file'] : []
            );

            // 1. Send email with attachments if any
            const emailReceipt = await sendEmail(oAuth2Config, {
                ...parsedJson,
                attachments,
            });

            // 2. Upload attachments to S3
            const uploadToS3Receipt = await uploadS3(attachments);

            // 3a. If email delivery successful, publish mail sent success event
            if (emailReceipt.success) {
                const publishMailSuccessfulReceipt =
                    await publishMailSentSuccessfulEvent({
                        id: uuidv4(),
                        emailTransactionId: emailReceipt.transactionId,
                        uploadTransactionId: uploadToS3Receipt.transactionId,
                        successfulDelivery: true,
                        creationDate: new Date(),
                        emailData: parsedJson,
                    });

                const response: IHttpResponse = {
                    instanceId: serverId,
                    message: 'Received publish mail sent success event receipt',
                    body: publishMailSuccessfulReceipt,
                };
                // To indicate that email send request is created
                res.status(201).send(response);
                return;
            }

            // 3b. If email delivery failure, publish mail sent failure event
            const publishMailFailedReceipt = await publishMailSentFailedEvent({
                id: uuidv4(),
                emailTransactionId: emailReceipt.transactionId,
                uploadTransactionId: uploadToS3Receipt.transactionId,
                successfulDelivery: false,
                creationDate: new Date(),
                emailData: parsedJson,
            });
            const response: IHttpResponse = {
                instanceId: serverId,
                message: 'Received publish mail sent failed event receipt',
                body: publishMailFailedReceipt,
            };

            // To indicate a receipt even that the mail was not successfully delivered
            res.status(200).send(response);
        } catch (err) {
            console.error(err);
            const response: IHttpResponse = {
                instanceId: serverId,
                message: 'Exception thrown from server',
                body: err?.message,
            };
            // Catch up bucket, if anything goes wrong, just return the error message back to client
            res.status(500).send(response);
        }
    }
);

app.listen(PORT, () => {
    // The server instance ID is to allow easier tracking if there is a need to troubleshoot
    console.log(
        `Server of instance id "${serverId}" listening on port ${PORT}`
    );
});
