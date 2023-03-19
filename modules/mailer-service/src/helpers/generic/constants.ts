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
export const HANDLE_EMAIL_SUCCESS_TIMEOUT = 180;
export const HANDLE_EMAIL_FAILED_TIMEOUT = 180;
export const HANDLE_EMAIL_RETRIES_TIMEOUT = 360;
export const HANDLE_EMAIL_SUCCESS_MEMORY_GB = 128;
export const HANDLE_EMAIL_FAILED_MEMORY_GB = 128;
export const HANDLE_EMAIL_RETRIES_MEMORY_GB = 256;

// SQS queue related
export const EMAIL_SENT_SUCCCESS_QUEUE_NAME = 'EmailSentSuccessQueue';
export const EVENT_SENT_FAILED_QUEUE_NAME = 'EmailSentFailedQueue';
export const EVENT_SENT_RETRIES_QUEUE_NAME = 'EmailRetriesQueue';
export const EMAIL_SENT_SUCCESS_QUEUE_TIMEOUT = 180;
export const EMAIL_SENT_FAILED_QUEUE_TIMEOUT = 180;
export const EMAIL_RETRIES_QUEUE_TIMEOUT = 360;
export const EMAIL_SENT_SUCCESS_QUEUE_BATCH_SIZE = 1;
export const EMAIL_SENT_FAILED_QUEUE_BATCH_SIZE = 1;
export const EMAIL_RETRIES_QUEUE_BATCH_SIZE = 1;

// DynamoDB related
export const MAIL_TRAIL_TABLE_NAME = 'MailTrail';

// Others
export const ALLOWABLE_RETRIES = 3;
export const RETRY_DELIVERY_DELAY_MS = 5000;
