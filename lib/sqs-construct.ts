import * as dotEnv from 'dotenv';
import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

dotEnv.config();

interface SqsQueueProps {
    emailSentSuccessConsumer: IFunction;
    emailSentFailedConsumer: IFunction;
}

export class PicklesSqsConstruct extends Construct {
    public readonly emailSentSuccessQueue: IQueue;
    public readonly emailSentFailedQueue: IQueue;

    constructor(scope: Construct, id: string, props: SqsQueueProps) {
        super(scope, id);

        this.emailSentSuccessQueue = new Queue(
            this,
            process.env.EMAIL_SENT_SUCCCESS_QUEUE_NAME!,
            {
                queueName: process.env.EMAIL_SENT_SUCCCESS_QUEUE_NAME,
                visibilityTimeout: Duration.seconds(180),
            }
        );

        this.emailSentFailedQueue = new Queue(
            this,
            process.env.EVENT_SENT_FAILED_QUEUE_NAME!,
            {
                queueName: process.env.EVENT_SENT_FAILED_QUEUE_NAME,
                visibilityTimeout: Duration.seconds(180),
            }
        );

        props.emailSentSuccessConsumer.addEventSource(
            new SqsEventSource(this.emailSentSuccessQueue, {
                batchSize: 1,
            })
        );

        props.emailSentFailedConsumer.addEventSource(
            new SqsEventSource(this.emailSentFailedQueue, { batchSize: 1 })
        );
    }
}
