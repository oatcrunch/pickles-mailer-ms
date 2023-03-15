import * as dotEnv from 'dotenv';
// import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IQueue } from 'aws-cdk-lib/aws-sqs';

dotEnv.config();

interface PicklesEventBusProps {
    // publisherFunction: IFunction;
    emailSentSuccessQueue: IQueue;
    emailSentFailedQueue: IQueue;
}

export class PicklesEventBusConstruct extends Construct {
    constructor(scope: Construct, id: string, props: PicklesEventBusProps) {
        super(scope, id);

        const bus = new EventBus(this, process.env.EVENT_BUS_NAME!, {
            eventBusName: process.env.EVENT_BUS_NAME,
        });

        const publishMailSentSuccessRule = new Rule(this, 'PublishMailSentSuccessRule', {
            eventBus: bus,
            enabled: true,
            description: 'When Mail is being sent to recipient',
            eventPattern: {
                source: [process.env.EMAIL_EVENT_SOURCE_NAME!],
                detailType: [process.env.EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE!],
            },
            ruleName: 'PublishMailSentSuccessRule',
        });

        const publishMailSentFailedRule = new Rule(this, 'PublishMailSentFailedRule', {
            eventBus: bus,
            enabled: true,
            description: 'When Mail is not sent successfully to recipient',
            eventPattern: {
                source: [process.env.EMAIL_EVENT_SOURCE_NAME!],
                detailType: [process.env.EVENT_SENT_FAILED_EVENT_DETAIL_TYPE!]
            },
            ruleName: 'PublishMailSentFailedRule'
        })

        publishMailSentSuccessRule.addTarget(new SqsQueue(props.emailSentSuccessQueue));
        publishMailSentFailedRule.addTarget(new SqsQueue(props.emailSentFailedQueue));

        // grant publisher to PUT events to event bus
        // bus.grantPutEventsTo(props.publisherFunction); // prevent AccessDeniedException
    }
}
