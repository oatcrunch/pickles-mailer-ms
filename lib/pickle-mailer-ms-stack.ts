import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
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

        const s3 = new PicklesS3Construct(this, 'S3', {});

        const queue = new PicklesSqsConstruct(this, 'Queue', {
            emailSentSuccessConsumer: microservices.handleEmailSentSuccessFn,
            emailSentFailedConsumer: microservices.handleEmailSentFailedFn
        });

        const eventBus = new PicklesEventBusConstruct(this, 'EventBus', {
            emailSentSuccessQueue: queue.emailSentSuccessQueue,
            emailSentFailedQueue: queue.emailSentFailedQueue
        });
    }
}
