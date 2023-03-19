import * as dotEnv from 'dotenv';
import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AWS_BUCKET_NAME } from '../modules/mailer-service';

dotEnv.config();

export interface IS3Props {
    // TODO: if needed
}

export class PicklesS3Construct extends Construct {
    public readonly bucket: IBucket;

    constructor(scope: Construct, id: string, props: IS3Props) {
        super(scope, id);

        this.bucket = new Bucket(this, AWS_BUCKET_NAME!, {
            /**
             * The following properties ensure the bucket is properly
             * deleted when we run cdk destroy */
            bucketName: AWS_BUCKET_NAME!,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        }); 
    }
}
