import { IEmail } from '../../models/email';

// Validate email DTO to ensure integrity
export const validateEmailDto = (obj: any): boolean => {
    const parsedObj = obj as IEmail;
    if (parsedObj && parsedObj.to && parsedObj.subject && parsedObj.text) {
        return true;
    }
    return false;
};

export const getRecipientsNotReceivedList = (
    allRecipientsList: string[],
    receivedRecipientsList: string[]
) => {
    let recipientsNotReceivedList = [];
    for (const recipient of allRecipientsList) {
        const trimmedRecipient = recipient.trim();
        if (!trimmedRecipient.length) {
            // Skip if found empty or white space(s)
            continue;
        }
        if (
            !receivedRecipientsList.some((q) => trimmedRecipient === q.trim())
        ) {
            recipientsNotReceivedList.push(trimmedRecipient);
        }
    }
    return recipientsNotReceivedList;
};
