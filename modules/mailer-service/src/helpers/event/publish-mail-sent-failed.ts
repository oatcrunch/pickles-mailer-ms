import * as dotEnv from 'dotenv';
import { PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { IMailSubmitted } from '../../entities/mail';
import { ebClient } from './event-publisher';

dotEnv.config();

export const publishMailSentFailedEvent = async (payload: IMailSubmitted): Promise<string> => {
    console.log('publishMailSentFailedEvent with payload :', payload);
    try {
        // eventbridge parameters for setting event to target system
        const params: PutEventsCommandInput = {
            Entries: [
                {
                    Source: process.env.EMAIL_EVENT_SOURCE_NAME,
                    Detail: JSON.stringify(payload),
                    DetailType: process.env.EVENT_SENT_FAILED_EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUS_NAME,
                }
            ]
        };
        const ret = await ebClient.send(new PutEventsCommand(params));
        console.log('Success, event sent: ', ret);
        const requestId = ret['$metadata'].requestId;

        return <string>requestId;
    } catch (e) {
        console.error(e);
        throw e;
    }
};