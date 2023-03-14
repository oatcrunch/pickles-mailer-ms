import * as dotEnv from 'dotenv';
import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

dotEnv.config();

interface SqsQueueProps {
    consumer: IFunction;
}

export class PicklesSqsConstruct extends Construct {
    public readonly dataPersistenceQueue: IQueue;

    constructor(scope: Construct, id: string, props: SqsQueueProps) {
        super(scope, id);

        this.dataPersistenceQueue = new Queue(
            this,
            process.env.DATA_PERSISTENCE_SQS_NAME!,
            {
                queueName: process.env.DATA_PERSISTENCE_SQS_NAME,
                visibilityTimeout: Duration.seconds(180),
            }
        );

        props.consumer.addEventSource(
            new SqsEventSource(this.dataPersistenceQueue, {
                batchSize: 1,
            })
        );
    }
}
