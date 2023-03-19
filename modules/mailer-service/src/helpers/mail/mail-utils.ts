import { IEmail } from '../../models/email';

// Validate email DTO to ensure integrity
export const validateEmailDto = (obj: any): boolean => {
    const parsedObj = obj as IEmail;
    if (parsedObj && parsedObj.to && parsedObj.subject && parsedObj.text) {
        return true;
    }
    return false;
};
