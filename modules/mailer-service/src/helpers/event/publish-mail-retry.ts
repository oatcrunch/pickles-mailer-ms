import * as dotEnv from 'dotenv';
import {
    EventBridgeClient,
    PutEventsCommand,
    PutEventsCommandInput,
} from '@aws-sdk/client-eventbridge';
import { ebClient } from './event-publisher';
import { IMail } from '../../entities/mail';

dotEnv.config();

// To publish event for triggering mail retries
export const publishMailRetryEvent = async (
    payload: IMail,
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
                        process.env.EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUS_NAME,
                },
            ],
        };

        if (!client) {
            client = ebClient;
        }

        const ret = await client.send(new PutEventsCommand(params));
        console.log('Success, event sent: ', ret);
        const requestId = ret['$metadata'].requestId;

        return <string>requestId;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
