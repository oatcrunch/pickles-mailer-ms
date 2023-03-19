import { IEmail } from '../src/models/email';
import { validateEmailDto } from '../src/helpers/mail/mail-utils';

describe('validateEmailDto', () => {
    it('should return true for a valid email DTO', () => {
        const emailDto: IEmail = {
            to: 'test@example.com',
            subject: 'Test Email',
            text: 'This is a test email',
        };
        expect(validateEmailDto(emailDto)).toBe(true);
    });

    it('should return false if the email DTO is missing the "to" field', () => {
        const emailDto: IEmail = {
            to: '',
            subject: 'Test Email',
            text: 'This is a test email',
        };
        expect(validateEmailDto(emailDto)).toBe(false);
    });

    it('should return false if the email DTO is missing the "subject" field', () => {
        const emailDto: IEmail = {
            to: 'test@example.com',
            text: 'This is a test email',
            subject: '',
        };
        expect(validateEmailDto(emailDto)).toBe(false);
    });

    it('should return false if the email DTO is missing the "text" field', () => {
        const emailDto: IEmail = {
            to: 'test@example.com',
            subject: 'Test Email',
            text: '',
        };
        expect(validateEmailDto(emailDto)).toBe(false);
    });

    it('should return false if the email DTO is null', () => {
        const emailDto = null;
        expect(validateEmailDto(emailDto)).toBe(false);
    });
});
