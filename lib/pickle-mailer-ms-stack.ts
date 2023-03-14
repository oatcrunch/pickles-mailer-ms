import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway.construct';
import { MicroservicesConstruct } from './microservices.construct';
import { S3Construct } from './s3.construct';

export class PickleMailerMsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const microservices = new MicroservicesConstruct(this, 'Microservices', {});

    // const apigateway = new ApiGatewayConstruct(this, 'ApiGateway', {
    //   processMailSubmissionFn: microservices.processMailSubmissionFn,
    // });

    const s3 = new S3Construct(this, 'S3', {});
  }
}
