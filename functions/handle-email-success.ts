import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

export const main = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        const apiGatewayEvent = <APIGatewayEvent>event;
        await processBody(<string>apiGatewayEvent.body);
        throw new Error(`Error sending enquiry with event: ${event}`);
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-email-success.main: ${err}`
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
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Handle email success function triggered with body: ${JSON.stringify(
                body
            )}`,
        }),
    };
};
