import * as dotEnv from 'dotenv';
import {
    EventBridgeClient,
    PutEventsCommand,
    PutEventsCommandInput,
} from '@aws-sdk/client-eventbridge';
import { IMailSubmitted } from '../../entities/mail';
import { ebClient } from './event-publisher';
import {
    EMAIL_EVENT_SOURCE_NAME,
    EVENT_BUS_NAME,
    EVENT_SENT_FAILED_EVENT_DETAIL_TYPE,
} from '../generic/constants';

dotEnv.config();

// To publish event for failed email delivery
export const publishMailSentFailedEvent = async (
    payload: IMailSubmitted,
    client?: EventBridgeClient
): Promise<string> => {
    try {
        // eventbridge parameters for setting event to target system
        const params: PutEventsCommandInput = {
            Entries: [
                {
                    Source: EMAIL_EVENT_SOURCE_NAME,
                    Detail: JSON.stringify(payload),
                    DetailType: EVENT_SENT_FAILED_EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: EVENT_BUS_NAME,
                },
            ],
        };

        if (!client) {
            client = ebClient;
        }

        const ret = await ebClient.send(new PutEventsCommand(params));
        console.log('Success, event sent: ', ret);
        const requestId = ret['$metadata'].requestId;

        return <string>requestId;
    } catch (e) {
        console.error(e);
    }
    return '';
};
