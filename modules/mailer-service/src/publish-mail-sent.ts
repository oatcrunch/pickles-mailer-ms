import * as dotEnv from 'dotenv';
import { PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { ebClient } from './event-publisher';

dotEnv.config();

export const publishMailSentEvent = async (payload): Promise<string> => {
    console.log('publishMailSentEvent with payload :', payload);
    console.log('process.env', process.env);
    try {
        // eventbridge parameters for setting event to target system
        const params: PutEventsCommandInput = {
            Entries: [
                {
                    Source: process.env.EMAIL_EVENT_SOURCE_NAME,
                    Detail: JSON.stringify(payload),
                    DetailType: process.env.EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUS_NAME,
                }
            ]
        };

        const ret = await ebClient.send(new PutEventsCommand(params));
        console.log('Success, event sent: ', ret);
        const requestId = ret['$metadata'].requestId;

        return requestId;
    } catch (e) {
        console.error(e);
        throw e;
    }
};