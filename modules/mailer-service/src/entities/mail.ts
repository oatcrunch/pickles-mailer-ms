export interface IMail {
    id: string;
    emailTransactionId: string;
    emailData: any;
    uploadTransactionId?: string;
    creationDate: Date;
}

export interface IMailSubmitted extends IMail {
    successfulDelivery: boolean;
    undeliveredEmailAddresses?: string[];
    deliveredEmailAddresses?: string[];
}

export interface IMailTrailEntity extends IMailSubmitted {
    attemptNumber?: number;
}
