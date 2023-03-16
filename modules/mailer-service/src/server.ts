import * as express from 'express';
import * as dotEnv from 'dotenv';
import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { uploadS3 } from './helpers/upload/upload-utils';
import { IEmailDeliveryOAuth2Config, sendEmail } from '../../mailer/src';
import { validateEmailDto } from './helpers/mail/mail-utils';
import { publishMailSentSuccessfulEvent } from './helpers/event/publish-mail-sent-successful';
import { publishMailSentFailedEvent } from './helpers/event/publish-mail-sent-failed';
import { createAttachmentsObj } from './helpers/mail/attachment-utils';

dotEnv.config();

// Populate env vars here
const PORT = process.env.ENQUIRY_PORT || 3000;
const EMAIL = process.env.EMAIL_ADDRESS;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Generate OAuth2 config for email transporter
const oAuth2Config: IEmailDeliveryOAuth2Config = {
    email: EMAIL,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
};

// Initializations
const upload = multer();
const app = express();
app.use(express.json());

// Server instance unique ID
const serverId = uuidv4();

app.get('/', (req: Request, res: Response) => {
    res.send(`Endpoint reachable from ${serverId}!`);
});

app.post('/test', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        res.status(200).send(`You have just sent ${JSON.stringify(req.body)}`);
    } catch (err) {
        res.status(500).send(JSON.stringify(err));
    }
});

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
            console.log('POST /email: files', req.files? req.files['file'] : undefined);

            if (!req.body.json) {
                throw Error('Body.json object is mandatory');
            }

            const parsedJson = JSON.parse(req.body.json);

            if (!validateEmailDto(parsedJson)) {
                throw Error(
                    'Body.json object required. See example: { to: "john.doe@email.com", subject: "Greetings", text: "Hello, how are you?" }.'
                );
            }

            // 0. Extracting email attachments if any
            const attachments = createAttachmentsObj(
                req.files ? req.files['file'] : []
            );

            // 1. Send email with attachments if any
            const emailReceipt = await sendEmail(oAuth2Config, {
                ...parsedJson,
                attachments,
            });
            console.log('emailReceipt', emailReceipt);

            // 2. Upload attachments to S3
            const uploadToS3Receipt = await uploadS3(attachments);
            console.log('uploadToS3Receipt', uploadToS3Receipt);

            // 3a. If email delivery successful, publish mail sent success event
            if (emailReceipt.success) {
                const publishMailSuccessfulReceipt = await publishMailSentSuccessfulEvent({
                    emailTransactionId: emailReceipt.transactionId,
                    uploadTransactionId: uploadToS3Receipt.transactionId,
                    successfulDelivery: true,
                    creationDate: new Date()
                });
                console.log('publishMailSuccessfulReceipt', publishMailSuccessfulReceipt);
                res.status(201).send(publishMailSuccessfulReceipt);
                return;
            }

            // 3b. If email delivery failure, publish mail sent failure event
            const publishMailFailedReceipt = await publishMailSentFailedEvent({
                emailTransactionId: emailReceipt.transactionId,
                uploadTransactionId: uploadToS3Receipt.transactionId,
                successfulDelivery: false,
                creationDate: new Date()
            });
            console.log('publishMailFailedReceipt', publishMailFailedReceipt);
            res.status(200).send(publishMailFailedReceipt);

            // 1. Upload attachments to S3
            // if (req.files) {
            //     const file = req.files['file'];
            //     ret = await uploadS3(file);
            // }

            // // 2. Send email
            // const receipt = await sendEmail(emailObj);
            // if (typeof receipt === 'string') {
            //     // 3.a Publish mail sent success
            //     if (ret.transactId) {
            //         eventId = await publishMailSentEvent(ret);
            //     }
            // } else {
            //     // 3.b Publish mail sent failure
            // }
        } catch (err) {
            console.error(err);
            res.status(500).send(err?.message);
        }
    }
);

app.listen(PORT, () => {
    // console.log('process.env', process.env); // enable only for debugging
    console.log(`Server listening on port ${PORT}`);
});
