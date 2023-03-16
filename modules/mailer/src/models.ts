export interface IEmailDeliveryOAuth2Config {
    email: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}
export interface IEmail {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: IAttachmentInfo[];
}

export interface ITransaction {
    transactionId: string;
    transactionDateTime?: Date;
}

export interface IEmailTransaction extends ITransaction {
    success: boolean;
    attachmentIds?: string[];
}

export interface IUploadTransaction extends ITransaction {
    etags?: string[];
}

export interface IAttachmentInfo {
    filename: string;
    fileId: string;
    ext: string;
    mimetype: string;
    content: any;
}

export interface IMailSubmitted {
    emailTransactionId: string;
    successfulDelivery: boolean;
    uploadTransactionId?: string;
    creationDate: Date;
}

export interface IMailTrailEntity extends IMailSubmitted {
    id: string;
    attemptNumber?: number;
    attemptTimeStamp?: string;  // compatibility issue
}
