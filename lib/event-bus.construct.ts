import * as dotEnv from 'dotenv';
// import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IQueue } from 'aws-cdk-lib/aws-sqs';

dotEnv.config();

interface PicklesEventBusProps {
    // publisherFunction: IFunction;
    targetQueue: IQueue;
}

export class PicklesEventBusConstruct extends Construct {
    constructor(scope: Construct, id: string, props: PicklesEventBusProps) {
        super(scope, id);

        const bus = new EventBus(this, process.env.EVENT_BUS_NAME!, {
            eventBusName: process.env.EVENT_BUS_NAME,
        });

        const publishMailSentRule = new Rule(this, 'PublishMailSentRule', {
            eventBus: bus,
            enabled: true,
            description: 'When Mail is being sent to recipient',
            eventPattern: {
                source: [process.env.EVENT_SOURCE_NAME!],
                detailType: [process.env.EVENT_DETAIL_TYPE!],
            },
            ruleName: 'PublishMailSentRule',
        });

        publishMailSentRule.addTarget(new SqsQueue(props.targetQueue));

        // grant publisher to PUT events to event bus
        // bus.grantPutEventsTo(props.publisherFunction); // prevent AccessDeniedException
    }
}
