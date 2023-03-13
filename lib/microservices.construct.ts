import { join } from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface IMicroserviceProps {
  // TODO: if needed
}

export class MicroservicesConstruct extends Construct {
  public readonly processMailSubmissionFn: NodejsFunction;

  constructor(scope: Construct, id: string, props: IMicroserviceProps) {
    super(scope, id);
    this.processMailSubmissionFn = this.createEnquiryFn();
  }

  private createEnquiryFn(): NodejsFunction {
    const sendReqFn = new NodejsFunction(this, 'ProcessMailSubmissionFn', {
      memorySize: 256,
      timeout: cdk.Duration.seconds(180),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'main',
      entry: join(__dirname, '/../functions/process-mail-req.ts'),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });
    return sendReqFn;
  }
}
