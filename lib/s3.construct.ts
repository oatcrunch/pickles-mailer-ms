import * as dotEnv from 'dotenv';
import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

dotEnv.config();
console.log('env', process.env);

export interface IS3Props {
    // TODO: if needed
}

export class S3Construct extends Construct {
    constructor(scope: Construct, id: string, props: IS3Props) {
      super(scope, id);
  
      const bucket = new Bucket(this, process.env.AWS_BUCKET_NAME!, {
        /**
         * The following properties ensure the bucket is properly 
         * deleted when we run cdk destroy */
        bucketName: process.env.AWS_BUCKET_NAME!,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL
      })
    }
  }