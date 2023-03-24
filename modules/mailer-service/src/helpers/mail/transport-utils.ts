import Nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { v4 as uuidv4 } from 'uuid';
import { google } from 'googleapis';
import { IEmailDeliveryOAuth2Config } from '../../models/credentials';
import { IEmailTransaction } from '../../models/transaction';

const OAuth2 = google.auth.OAuth2;

// Create Nodemailer transporter using specified credentials
export const createTransporter = async (config: IEmailDeliveryOAuth2Config) => {
    const oauth2Client = new OAuth2(
        config.clientId,
        config.clientSecret,
        'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({
        refresh_token: config.refreshToken,
    });
    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
    const transporter = Nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: config.email,
            accessToken: <string>accessToken,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken,
        },
    });
    return transporter;
};

// Function to send email using Nodemailer transporter
export const sendEmail = async (
    config: IEmailDeliveryOAuth2Config,
    options: Mail.Options
): Promise<IEmailTransaction> => {
    try {
        const emailTransporter = await createTransporter(config);
        const ret = await emailTransporter.sendMail(options);
        console.log('Response from sending email:', ret); // important for troubleshooting
        const messageId = ret.messageId;
        const envelopTo = ret.envelope?.to || [];

        const result: IEmailTransaction = {
            transactionId: messageId,
            transactionDateTime: new Date(),
            success: true, // defaults to be successful, validate in the next line
        };

        // Find out if any email address that is not getting the email
        const recipientsArr = options.to.toString().split(',');
        let emailsNotInEnv = [];
        let emailsInEnv = [];

        // Split results into 2 buckets ie delivered and undelivered
        for (const recipient of recipientsArr) {
            const trimmedRecipient = recipient.trim();
            if (!trimmedRecipient.length) {
                // Skip if found empty or white space(s)
                continue;
            }
            if (envelopTo.some((q) => trimmedRecipient === q.trim())) {
                emailsInEnv.push(trimmedRecipient);
            } else {
                emailsNotInEnv.push(trimmedRecipient);
            }
        }

        result.deliveredEmailAddresses = emailsInEnv;
        result.undeliveredEmailAddresses = emailsNotInEnv;
        result.success = !emailsNotInEnv.length; // failed if we have undelivered email addresses

        return result;
    } catch (error) {
        console.error(error);
    }
    return {
        transactionId: uuidv4(),
        success: false,
        // In the case of all unsuccessful event, re-assign "to" to undeliveredEmailAddresses
        undeliveredEmailAddresses: options.to.toString().split(','),
        deliveredEmailAddresses: [],
    };
};
