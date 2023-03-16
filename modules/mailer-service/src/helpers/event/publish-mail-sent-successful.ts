import * as dotEnv from 'dotenv';
import {
    EventBridgeClient,
    PutEventsCommand,
    PutEventsCommandInput,
} from '@aws-sdk/client-eventbridge';
import { ebClient } from './event-publisher';
import { IMailSubmitted } from '../../entities/mail';

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
                    Source: process.env.EMAIL_EVENT_SOURCE_NAME,
                    Detail: JSON.stringify(payload),
                    DetailType:
                        process.env.EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUS_NAME,
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
