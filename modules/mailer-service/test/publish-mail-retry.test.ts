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
import { publishMailRetryEvent } from '../src/helpers/event/publish-mail-retry';

// Mocked payload for mail retry event
const mockedMail: IMailSubmitted = {
    id: '222',
    emailTransactionId: '12345',
    emailData: {},
    uploadTransactionId: '54321',
    creationDate: new Date(),
    undeliveredEmailAddresses: [],
    deliveredEmailAddresses: ['john.doe@somemail.com'],
    successfulDelivery: true
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

// Test case for publishing mail retry event
describe('publishMailRetryEvent', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods
        jest.clearAllMocks();
    });

    it('should publish a mail retry event with correct parameters', async () => {
        // Call the function with mocked input and client
        const result = await publishMailRetryEvent(
            mockedMail,
            mockedEventBridgeClientOk
        );

        // Check if the mocked function was called with the expected parameters
        expect(result).toEqual('111');
    });

    it('should throw error if client throws error', async () => {
        // Call the function with mocked input and client
        const result = await publishMailRetryEvent(
            mockedMail,
            mockedEventBridgeClientErr
        );
        expect(result).toBe('');
    });
});
