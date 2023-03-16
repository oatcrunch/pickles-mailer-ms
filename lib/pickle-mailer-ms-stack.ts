import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PicklesDynamoDbConstruct } from './dynamodb.construct';
import { PicklesEventBusConstruct } from './event-bus.construct';
import { PicklesMicroservicesConstruct } from './microservices.construct';
import { PicklesS3Construct } from './s3.construct';
import { PicklesSqsConstruct } from './sqs-construct';

export class PickleMailerMsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create database infra to store audit trail of email sent
        const database = new PicklesDynamoDbConstruct(this, 'Database');

        // Create microservice functions infra
        const microservices = new PicklesMicroservicesConstruct(
            this,
            'Microservices',
            {
                mailTrailTbl: database.mailTrailTable
            }
        );

        // Create S3 infra to store email attachments
        const s3 = new PicklesS3Construct(this, 'S3', {});

        // Create queues attached to event hub to create fan-out pattern
        const queue = new PicklesSqsConstruct(this, 'Queue', {
            emailSentSuccessConsumer: microservices.handleEmailSentSuccessFn,
            emailSentFailedConsumer: microservices.handleEmailSentFailedFn,
            emailRetriesConsumer: microservices.handleEmailRetriesFn,
        });

        // Create event bus as central hub for all publish and subscribe events
        const eventBus = new PicklesEventBusConstruct(this, 'EventBus', {
            emailSentSuccessQueue: queue.emailSentSuccessQueue,
            emailSentFailedQueue: queue.emailSentFailedQueue,
            emailRetriesQueue: queue.emailRetriesQueue,
        });
    }
}
