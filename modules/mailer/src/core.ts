import * as Nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { v4 as uuidv4 } from 'uuid';
import { google } from 'googleapis';
import { IEmailDeliveryOAuth2Config, IEmailTransaction, IUploadTransaction } from './models';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async (config: IEmailDeliveryOAuth2Config) => {
    const oauth2Client = new OAuth2(
        // process.env.CLIENT_ID,
        // process.env.CLIENT_SECRET,
        config.clientId,
        config.clientSecret,
        'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({
        // refresh_token: process.env.REFRESH_TOKEN,
        refresh_token: config.refreshToken
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
            user: config.email, // process.env.EMAIL_ADDRESS,
            accessToken: <string>accessToken,
            clientId: config.clientId, //process.env.CLIENT_ID,
            clientSecret: config.clientSecret, // process.env.CLIENT_SECRET,
            refreshToken: config.refreshToken // process.env.REFRESH_TOKEN,
        },
    });
    return transporter;
};

export const sendEmail = async (
    config: IEmailDeliveryOAuth2Config,
    options: Mail.Options
): Promise<IEmailTransaction> => {
    try {
        const emailTransporter = await createTransporter(config);
        const ret = await emailTransporter.sendMail(options);
        const messageId = ret.messageId;
        console.log('sendEmail - result: ', ret);
        console.log(`sendEmail - messageId: ${messageId}`);
        const result : IEmailTransaction = {
            transactionId: messageId,
            transactionDateTime: new Date(),
            success: false
        };

        if (messageId.includes('@localhost')) {
            return {
                ...result,
                success: true
            };
        }
    } catch (error) {
        console.error(error);
        // throw error;
    }
    return {
        transactionId: uuidv4(),
        success: false
    };
};
