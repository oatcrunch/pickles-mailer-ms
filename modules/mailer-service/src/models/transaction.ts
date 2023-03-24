export interface ITransaction {
    transactionId: string;
    transactionDateTime?: Date;
}

export interface IEmailTransaction extends ITransaction {
    success: boolean;
    attachmentIds?: string[];
    undeliveredEmailAddresses?: string[];
    deliveredEmailAddresses?: string[];
}

export interface IUploadTransaction extends ITransaction {
    etags?: string[];
}
