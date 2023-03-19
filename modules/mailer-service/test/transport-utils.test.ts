import {
    sendEmail,
    createTransporter,
} from '../src/helpers/mail/transport-utils';

jest.mock('uuid', () => ({ v4: () => '123456789' }));
jest.mock('../src/helpers/mail/transport-utils', () => {
    return {
        createTransporter: jest.fn().mockImplementation(async () => {
            return () => {
                {
                    sendEmail: () => {
                        messageId: '<12345@localhost>';
                    };
                }
            };
        }),
    };
});

describe.skip('sendEmail', () => {
    const config = {
        email: 'test@test.com',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        refreshToken: 'refreshToken',
    };

    const options = {
        from: 'test@test.com',
        to: 'recipient@test.com',
        subject: 'Test Subject',
        text: 'Test Email Content',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send email successfully', async () => {
        const result = await sendEmail(config, options);

        expect(createTransporter).toHaveBeenCalled();
        expect(result).toEqual({
            transactionId: '123456789',
            transactionDateTime: expect.any(Date),
            success: true,
        });
    });

    it('should handle error when sending email', async () => {
        const errorMessage = 'Error sending email';
        const error = new Error(errorMessage);

        const result = await sendEmail(config, options);

        expect(createTransporter).toHaveBeenCalled();
        expect(result).toEqual({
            transactionId: '123456789',
            success: false,
        });

        expect(console.error).toHaveBeenCalledWith(error);
    });
});
