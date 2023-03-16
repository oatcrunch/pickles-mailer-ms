export interface IMail {
    emailTransactionId: string;
    emailData: any;
    uploadTransactionId?: string;
}

export interface IMailSubmitted extends IMail {
    successfulDelivery: boolean;
    creationDate: Date;
}

export interface IMailTrailEntity extends IMailSubmitted {
    id: string;
    attemptNumber?: number;
    attemptTimeStamp?: Date;
}
