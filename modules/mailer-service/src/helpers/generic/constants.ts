// TODO: Below can be refactored into a config file

// S3 related
export const AWS_BUCKET_NAME = 'pickles-bucket';
export const AWS_BUCKET_ARN = 'arn:aws:s3:::pickles-bucket';
export const AWS_BUCKET_REGION = 'ap-southeast-1';

// Event Bridge related
export const EVENT_BUS_NAME = 'picklesEventBus';
export const EMAIL_EVENT_SOURCE_NAME = 'com.pickles.mail';
export const EMAIL_SENT_SUCCESS_EVENT_DETAIL_TYPE = 'MailSentPass';
export const EVENT_SENT_FAILED_EVENT_DETAIL_TYPE = 'MailSentFail';
export const EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE = 'MailRetries';

// Lambda functions related
export const HANDLE_EMAIL_SENT_SUCCESS_FN = 'handleEmailSentSuccessFn';
export const HANDLE_EMAIL_SENT_FAILED_FN = 'handleEmailSentFailedFn';
export const HANDLE_EMAIL_RETRIES_FN = 'handleEmailRetriesFn';

// SQS queue related
export const EMAIL_SENT_SUCCCESS_QUEUE_NAME = 'EmailSentSuccessQueue';
export const EVENT_SENT_FAILED_QUEUE_NAME = 'EmailSentFailedQueue';
export const EVENT_SENT_RETRIES_QUEUE_NAME = 'EmailRetriesQueue';

// DynamoDB related
export const MAIL_TRAIL_TABLE_NAME = 'MailTrail';
