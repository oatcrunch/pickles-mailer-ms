import {
    EventBridgeClient,
    EventBridgeClientResolvedConfig,
    PutEventsCommand,
    PutEventsCommandOutput,
    ServiceInputTypes,
    ServiceOutputTypes,
} from '@aws-sdk/client-eventbridge';
import { MiddlewareStack } from '@aws-sdk/types';
import { IMailSubmitted } from '../src/entities/mail';
import { publishMailSentFailedEvent } from '../src/helpers/event/publish-mail-sent-failed';

const date = new Date();

// Mocked payload for mail set failed event
const mockedMail: IMailSubmitted = {
    id: '333',
    emailTransactionId: '12345',
    emailData: {},
    uploadTransactionId: '54321',
    successfulDelivery: false,
    creationDate: date,
};

class EventBridgeClientMockOk implements EventBridgeClient {
    constructor() {}
    config: EventBridgeClientResolvedConfig;
    destroy(): void {
        throw new Error('Method not implemented.');
    }
    middlewareStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>;
    public async send(
        params: PutEventsCommand
    ): Promise<PutEventsCommandOutput> {
        return {
            $metadata: {
                requestId: '111',
            },
        };
    }
}

class EventBridgeClientMockError implements EventBridgeClient {
    constructor() {}
    config: EventBridgeClientResolvedConfig;
    destroy(): void {
        throw new Error('Method not implemented.');
    }
    middlewareStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>;
    public async send(
        params: PutEventsCommand
    ): Promise<PutEventsCommandOutput> {
        throw Error('Something went wrong');
    }
}

const mockedEventBridgeClientOk = new EventBridgeClientMockOk();
const mockedEventBridgeClientErr = new EventBridgeClientMockError();

// Test case for publishing mail sent failed event
describe('publishMailSentFailedEvent', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods
        jest.clearAllMocks();
    });

    it.skip('should publish a mail sent failed event with correct parameters', async () => {
        // Call the function with mocked input and client
        const result = await publishMailSentFailedEvent(
            mockedMail,
            mockedEventBridgeClientOk
        );

        // Check if the mocked function was called with the expected parameters
        expect(result).toEqual('111');
    });

    it('should throw error if client throws error', async () => {
        // Call the function with mocked input and client
        const result = await publishMailSentFailedEvent(
            mockedMail,
            mockedEventBridgeClientErr
        );
        expect(result).toBe('');
    });
});
