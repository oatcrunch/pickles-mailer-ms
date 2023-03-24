import { IEmail } from '../src/models/email';
import {
    getRecipientsNotReceivedList,
    validateEmailDto,
} from '../src/helpers/mail/mail-utils';

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

describe('getRecipientsNotReceivedList', () => {
    it('returns an empty array when given empty lists', () => {
        const allRecipientsList: string[] = [];
        const receivedRecipientsList: string[] = [];
        const result = getRecipientsNotReceivedList(
            allRecipientsList,
            receivedRecipientsList
        );
        expect(result).toEqual([]);
    });

    it('returns all recipients when none have been received', () => {
        const allRecipientsList = ['recipient1', 'recipient2', 'recipient3'];
        const receivedRecipientsList: string[] = [];
        const result = getRecipientsNotReceivedList(
            allRecipientsList,
            receivedRecipientsList
        );
        expect(result).toEqual(['recipient1', 'recipient2', 'recipient3']);
    });

    it('returns no recipients when all have been received', () => {
        const allRecipientsList = ['recipient1', 'recipient2', 'recipient3'];
        const receivedRecipientsList = [
            'recipient1',
            'recipient2',
            'recipient3',
        ];
        const result = getRecipientsNotReceivedList(
            allRecipientsList,
            receivedRecipientsList
        );
        expect(result).toEqual([]);
    });

    it('returns only unreceived recipients', () => {
        const allRecipientsList = ['recipient1', 'recipient2', 'recipient3'];
        const receivedRecipientsList = ['recipient2'];
        const result = getRecipientsNotReceivedList(
            allRecipientsList,
            receivedRecipientsList
        );
        expect(result).toEqual(['recipient1', 'recipient3']);
    });

    it('trims whitespace from input recipients', () => {
        const allRecipientsList = [
            'recipient1 ',
            ' recipient2',
            '  recipient3  ',
        ];
        const receivedRecipientsList: string[] = [];
        const result = getRecipientsNotReceivedList(
            allRecipientsList,
            receivedRecipientsList
        );
        expect(result).toEqual(['recipient1', 'recipient2', 'recipient3']);
    });

    it('skips recipients with empty or whitespace-only values', () => {
        const allRecipientsList = ['recipient1', '', ' ', 'recipient2', '  '];
        const receivedRecipientsList: string[] = [];
        const result = getRecipientsNotReceivedList(
            allRecipientsList,
            receivedRecipientsList
        );
        expect(result).toEqual(['recipient1', 'recipient2']);
    });
});
