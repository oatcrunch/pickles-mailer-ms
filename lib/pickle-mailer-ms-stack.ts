import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway.construct';
import { MicroservicesConstruct } from './microservices.construct';

export class PickleMailerMsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const microservices = new MicroservicesConstruct(this, 'Microservices', {});

    const apigateway = new ApiGatewayConstruct(this, 'ApiGateway', {
      processMailSubmissionFn: microservices.processMailSubmissionFn,
    });
  }
}
