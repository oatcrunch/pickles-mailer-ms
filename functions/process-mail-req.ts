import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

export interface IEnquiry {
  id?: string;
  senderEmail: string;
  enquiryDate?: string;
  title: string;
  text: string;
}

export const main = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('event 👉', event);
  try {
    const apiGatewayEvent = <APIGatewayEvent>event;
    if (apiGatewayEvent && apiGatewayEvent.httpMethod === 'POST') {
      if (apiGatewayEvent.path.startsWith('/email')) {
        return await processBody(<string>apiGatewayEvent.body);
      }
    }
    throw new Error(`Error sending enquiry with event: ${event}`);
  } catch (err: any) {
    console.error(`Exception thrown at function enquiry/index.main: ${err}`);
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
      message: `Process mail function triggered with body: ${JSON.stringify(
        body
      )}`,
    }),
  };
};
