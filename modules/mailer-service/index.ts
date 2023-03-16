import { publishMailRetryEvent } from './src/helpers/event/publish-mail-retry';
import { publishMailSentFailedEvent } from './src/helpers/event/publish-mail-sent-failed';
import { publishMailSentSuccessfulEvent } from './src/helpers/event/publish-mail-sent-successful';
import {
    AWS_BUCKET_ARN,
    AWS_BUCKET_NAME,
    AWS_BUCKET_REGION,
    EMAIL_EVENT_SOURCE_NAME,
    EMAIL_SENT_SUCCCESS_QUEUE_NAME,
    EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE,
    EVENT_BUS_NAME,
    EVENT_SENT_FAILED_EVENT_DETAIL_TYPE,
    EVENT_SENT_FAILED_QUEUE_NAME,
    EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE,
    EVENT_SENT_RETRIES_QUEUE_NAME,
    HANDLE_EMAIL_RETRIES_FN,
    HANDLE_EMAIL_SENT_FAILED_FN,
    HANDLE_EMAIL_SENT_SUCCESS_FN,
    MAIL_TRAIL_TABLE_NAME,
} from './src/helpers/generic/constants';

// require('./src/server');

export {
    // Event related
    publishMailSentSuccessfulEvent,
    publishMailSentFailedEvent,
    publishMailRetryEvent,

    // Config related
    AWS_BUCKET_NAME,
    AWS_BUCKET_ARN,
    AWS_BUCKET_REGION,
    EVENT_BUS_NAME,
    EMAIL_EVENT_SOURCE_NAME,
    EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE,
    EVENT_SENT_FAILED_EVENT_DETAIL_TYPE,
    EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE,
    HANDLE_EMAIL_SENT_SUCCESS_FN,
    HANDLE_EMAIL_SENT_FAILED_FN,
    HANDLE_EMAIL_RETRIES_FN,
    EMAIL_SENT_SUCCCESS_QUEUE_NAME,
    EVENT_SENT_FAILED_QUEUE_NAME,
    EVENT_SENT_RETRIES_QUEUE_NAME,
    MAIL_TRAIL_TABLE_NAME,
};
