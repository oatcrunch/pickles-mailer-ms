import * as dotEnv from 'dotenv';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { AWS_BUCKET_REGION } from '../generic/constants';

dotEnv.config();

// Event Bridge client with specified credentials
export const ebClient = new EventBridgeClient({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
