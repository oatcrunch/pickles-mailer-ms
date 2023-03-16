import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

export const main = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        const apiGatewayEvent = <APIGatewayEvent>event;
        return await processBody(<string>apiGatewayEvent.body);
        throw new Error(`Error sending enquiry with event: ${event}`);
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-email-retries.main: ${err}`
        );
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to perform operation',
                errorMsg: err.message,
                errorStack: err.stack,
            }),
        };
    }
};

const processBody = async (body: string) => {
    // 1. look for db rows based on email transaction id
    // 2. if count is more than 3 then return saying exceeded retries, else proceed with step 3
    // 3. if count is less than 3 and if upload transaction id is not empty, then list objects from s3 based on that id
    // 4. with the email content and optionally attachments from s3, retry sending email
    // 5a. if email sent successful then return saying succeeded
    // 5b. if email sent failed then trigger event for retry after x seconds delay
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Handle email success function triggered with body: ${JSON.stringify(
                body
            )}`,
        }),
    };
};
