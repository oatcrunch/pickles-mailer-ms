import * as dotEnv from 'dotenv';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { IAttachmentInfo } from '../../models/email';
import { IUploadTransaction } from '../../models/transaction';

dotEnv.config();

// AWS S3 config
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_BUCKET_REGION;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
    },
});

export const uploadS3 = async (
    files: IAttachmentInfo[]
): Promise<IUploadTransaction> => {
    let uploadTransaction: IUploadTransaction = {
        transactionId: ''
    };
    try {
        if (files && files.length > 0) {
            const transactId = uuidv4();
            uploadTransaction.etags = [];
            for (const f of files) {
                const command = new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: `${transactId}/${f.fileId}.${f.ext}`,
                    Body: f.content,
                });
                const ret = await client.send(command);
                uploadTransaction.etags.push(ret.ETag);
            }
            uploadTransaction.transactionId = transactId;
            uploadTransaction.transactionDateTime = new Date();
        }
        return uploadTransaction;
    } catch (err) {
        console.error('Exception caught in uploadS3', err);
        // throw err;
    }
    return uploadTransaction;
};
