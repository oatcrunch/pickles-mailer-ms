import { IEmail } from '../../../../mailer/src/models';

export const validateEmailDto = (obj: any): boolean => {
    const parsedObj = obj as IEmail;
    if (parsedObj && parsedObj.to && parsedObj.subject && parsedObj.text) {
        return true;
    }
    return false;
};
