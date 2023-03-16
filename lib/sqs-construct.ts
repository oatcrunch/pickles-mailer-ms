import * as dotEnv from 'dotenv';
import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

dotEnv.config();

// Config constants
const EMAIL_SENT_SUCCESS_QUEUE_TIMEOUT = 180;
const EMAIL_SENT_FAILED_QUEUE_TIMEOUT = 180;
const EMAIL_RETRIES_QUEUE_TIMEOUT = 360;
const EMAIL_SENT_SUCCESS_QUEUE_BATCH_SIZE = 1;
const EMAIL_SENT_FAILED_QUEUE_BATCH_SIZE = 1;
const EMAIL_RETRIES_QUEUE_BATCH_SIZE = 1;

interface SqsQueueProps {
    emailSentSuccessConsumer: IFunction;
    emailSentFailedConsumer: IFunction;
    emailRetriesConsumer: IFunction;
}

export class PicklesSqsConstruct extends Construct {
    public readonly emailSentSuccessQueue: IQueue;
    public readonly emailSentFailedQueue: IQueue;
    public readonly emailRetriesQueue: IQueue;

    constructor(scope: Construct, id: string, props: SqsQueueProps) {
        super(scope, id);

        this.emailSentSuccessQueue = new Queue(
            this,
            process.env.EMAIL_SENT_SUCCCESS_QUEUE_NAME!,
            {
                queueName: process.env.EMAIL_SENT_SUCCCESS_QUEUE_NAME,
                visibilityTimeout: Duration.seconds(
                    EMAIL_SENT_SUCCESS_QUEUE_TIMEOUT
                ),
            }
        );
        this.emailSentFailedQueue = new Queue(
            this,
            process.env.EVENT_SENT_FAILED_QUEUE_NAME!,
            {
                queueName: process.env.EVENT_SENT_FAILED_QUEUE_NAME,
                visibilityTimeout: Duration.seconds(
                    EMAIL_SENT_FAILED_QUEUE_TIMEOUT
                ),
            }
        );
        this.emailRetriesQueue = new Queue(
            this,
            process.env.EVENT_SENT_RETRIES_QUEUE_NAME!,
            {
                queueName: process.env.EVENT_SENT_RETRIES_QUEUE_NAME,
                visibilityTimeout: Duration.seconds(
                    EMAIL_RETRIES_QUEUE_TIMEOUT
                ),
            }
        );

        props.emailSentSuccessConsumer.addEventSource(
            new SqsEventSource(this.emailSentSuccessQueue, {
                batchSize: EMAIL_SENT_SUCCESS_QUEUE_BATCH_SIZE,
            })
        );
        props.emailSentFailedConsumer.addEventSource(
            new SqsEventSource(this.emailSentFailedQueue, {
                batchSize: EMAIL_SENT_FAILED_QUEUE_BATCH_SIZE,
            })
        );
        props.emailRetriesConsumer.addEventSource(
            new SqsEventSource(this.emailRetriesQueue, {
                batchSize: EMAIL_RETRIES_QUEUE_BATCH_SIZE,
            })
        );
    }
}
