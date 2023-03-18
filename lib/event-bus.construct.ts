import * as dotEnv from 'dotenv';
import { Construct } from 'constructs';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
    EMAIL_EVENT_SOURCE_NAME,
    EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE,
    EVENT_BUS_NAME,
    EVENT_SENT_FAILED_EVENT_DETAIL_TYPE,
    EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE,
} from '../modules/mailer-service';

dotEnv.config();

interface PicklesEventBusProps {
    emailRetryPublisher: IFunction;
    emailSentFailedPublisher: IFunction;
    emailSentSuccessQueue: IQueue;
    emailSentFailedQueue: IQueue;
    emailRetriesQueue: IQueue;
}

export class PicklesEventBusConstruct extends Construct {
    constructor(scope: Construct, id: string, props: PicklesEventBusProps) {
        super(scope, id);

        const bus = new EventBus(this, EVENT_BUS_NAME!, {
            eventBusName: EVENT_BUS_NAME,
        });

        const publishMailSentSuccessRule = new Rule(
            this,
            'PublishMailSentSuccessRule',
            {
                eventBus: bus,
                enabled: true,
                description: 'When Mail is being sent to recipient',
                eventPattern: {
                    source: [EMAIL_EVENT_SOURCE_NAME!],
                    detailType: [EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE!],
                },
                ruleName: 'PublishMailSentSuccessRule',
            }
        );
        const publishMailSentFailedRule = new Rule(
            this,
            'PublishMailSentFailedRule',
            {
                eventBus: bus,
                enabled: true,
                description: 'When Mail is not sent successfully to recipient',
                eventPattern: {
                    source: [EMAIL_EVENT_SOURCE_NAME!],
                    detailType: [EVENT_SENT_FAILED_EVENT_DETAIL_TYPE!],
                },
                ruleName: 'PublishMailSentFailedRule',
            }
        );
        const publishMailRetriesRule = new Rule(
            this,
            'PublishMailRetriesRule',
            {
                eventBus: bus,
                enabled: true,
                description: 'When Failed Mail needs to be retried',
                eventPattern: {
                    source: [EMAIL_EVENT_SOURCE_NAME!],
                    detailType: [EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE!],
                },
                ruleName: 'PublishMailRetriesRule',
            }
        );

        publishMailSentSuccessRule.addTarget(
            new SqsQueue(props.emailSentSuccessQueue)
        );
        publishMailSentFailedRule.addTarget(
            new SqsQueue(props.emailSentFailedQueue)
        );
        publishMailRetriesRule.addTarget(new SqsQueue(props.emailRetriesQueue));

        // grant publisher to PUT events to event bus
        bus.grantPutEventsTo(props.emailRetryPublisher); // prevent AccessDeniedException
        bus.grantPutEventsTo(props.emailSentFailedPublisher); // prevent AccessDeniedException
    }
}
