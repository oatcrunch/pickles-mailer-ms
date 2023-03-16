import express from 'express';
import dotEnv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { uploadS3 } from './helpers/upload/upload-utils';
import { validateEmailDto } from './helpers/mail/mail-utils';
import { publishMailSentSuccessfulEvent } from './helpers/event/publish-mail-sent-successful';
import { publishMailSentFailedEvent } from './helpers/event/publish-mail-sent-failed';
import { createAttachmentsObj } from './helpers/mail/attachment-utils';
import { IEmailDeliveryOAuth2Config } from './models/credentials';
import { sendEmail } from './helpers/mail/transport-utils';

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

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
    res.send(`Endpoint reachable from ${serverId}!`);
});

// HTTP POST with body payload test endpoint
app.post('/test', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        res.status(200).send(`You have just sent ${JSON.stringify(req.body)}`);
    } catch (err) {
        res.status(500).send(JSON.stringify(err));
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

            const parsedJson = JSON.parse(req.body.json);

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
                        emailTransactionId: emailReceipt.transactionId,
                        uploadTransactionId: uploadToS3Receipt.transactionId,
                        successfulDelivery: true,
                        creationDate: new Date(),
                        emailData: parsedJson,
                    });

                res.status(201).send(publishMailSuccessfulReceipt);
                return;
            }

            // 3b. If email delivery failure, publish mail sent failure event
            const publishMailFailedReceipt = await publishMailSentFailedEvent({
                emailTransactionId: emailReceipt.transactionId,
                uploadTransactionId: uploadToS3Receipt.transactionId,
                successfulDelivery: false,
                creationDate: new Date(),
                emailData: parsedJson,
            });

            res.status(200).send(publishMailFailedReceipt);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err?.message);
        }
    }
);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
