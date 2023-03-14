import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { PicklesApiGatewayConstruct } from './api-gateway.construct';
import { PicklesEventBusConstruct } from './event-bus.construct';
import { PicklesMicroservicesConstruct } from './microservices.construct';
import { PicklesS3Construct } from './s3.construct';
import { PicklesSqsConstruct } from './sqs-construct';

export class PickleMailerMsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const microservices = new PicklesMicroservicesConstruct(
            this,
            'Microservices',
            {}
        );

        // const apigateway = new ApiGatewayConstruct(this, 'ApiGateway', {
        //   processMailSubmissionFn: microservices.processMailSubmissionFn,
        // });

        const s3 = new PicklesS3Construct(this, 'S3', {});

        const queue = new PicklesSqsConstruct(this, 'Queue', {
            consumer: microservices.persistDataFn,
        });

        const eventBus = new PicklesEventBusConstruct(this, 'EventBus', {
            targetQueue: queue.dataPersistenceQueue,
        });
    }
}
