export interface IMail {
    emailTransactionId: string;
    emailData: any;
    uploadTransactionId?: string;
}

export interface IMailSubmitted extends IMail {
    // emailTransactionId: string;
    // emailData: any;
    successfulDelivery: boolean;
    // uploadTransactionId?: string;
    creationDate: Date;
}

export interface IMailTrailEntity extends IMailSubmitted {
    id: string;
    attemptNumber?: number;
    attemptTimeStamp?: Date;
}
