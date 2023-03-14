import * as Nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
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
            user: process.env.EMAIL_ADDRESS,
            accessToken: <string>accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        },
    });
    return transporter;
};

export const sendEmail = async (
    options: Mail.Options
): Promise<string | Error> => {
    try {
        const emailTransporter = await createTransporter();
        const result = await emailTransporter.sendMail(options);
        const messageId = result.messageId;
        console.log(`sendEmail - messageId: ${messageId}`);
        return messageId;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
