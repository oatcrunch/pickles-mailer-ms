import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { IAttachmentInfo } from '../../models/email';

// Convert file object to IAttachmentInfo
export const createAttachmentsObj = (files: any[]): IAttachmentInfo[] => {
    const results: IAttachmentInfo[] = [];
    try {
        if (files) {
            for (const f of files) {
                const fileId = uuidv4();
                const mimetype = <string>f.mimetype;
                const ext = <string>mime.extension(mimetype);
                const filename = `${fileId}.${ext}`;

                results.push({
                    filename,
                    fileId,
                    ext,
                    content: f.buffer,
                    mimetype,
                });
            }
        }
        return results;
    } catch (err) {
        console.error('Exception caught in uploadS3', err);
    }
    return results;
};
