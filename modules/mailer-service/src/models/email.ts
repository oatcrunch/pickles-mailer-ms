export interface IEmail {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: IAttachmentInfo[];
}

export interface IAttachmentInfo {
    filename: string;
    fileId: string;
    ext: string;
    mimetype: string;
    content: any;
}
