import * as dotEnv from "dotenv";
import * as mime from 'mime-types';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export interface IUploadResult { transactId: string, etag: string }

dotEnv.config();

// AWS S3 config
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export const uploadS3 = async (files: any[]): Promise<IUploadResult> => {
  try {
    let  res: IUploadResult = { transactId: '', etag: '' };

    if (files) {
      const transactId = uuidv4();
      res.transactId = transactId;

      for (const f of files) {
        const objId = uuidv4();
        const mimeType = f.mimetype;
        const ext = mime.extension(mimeType);

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: `${transactId}/${objId}.${ext}`,
          Body: f.buffer,
        });
        const ret = await client.send(command);
        res.etag = ret.ETag;
        // console.log(`Upload result for ${f.originalname} with etag=${res.etag} and transactId=${transactId}`);
      }
    }
    return res;
  } catch (err) {
    console.error("Exception caught in uploadS3", err);
    throw err;
  }
};
