import * as dotEnv from 'dotenv';
import {
    EventBridgeClient,
    PutEventsCommand,
    PutEventsCommandInput,
} from '@aws-sdk/client-eventbridge';
import { ebClient } from './event-publisher';
import { IMailSubmitted } from '../../entities/mail';
import { EMAIL_EVENT_SOURCE_NAME, EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE, EVENT_BUS_NAME } from '../generic/constants';

dotEnv.config();

// To trigger event for successful email delivery
export const publishMailSentSuccessfulEvent = async (
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
                    DetailType:
                        EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE,
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
        throw e;
    }
};
