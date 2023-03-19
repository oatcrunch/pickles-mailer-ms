import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { IAttachmentInfo } from '../../models/email';

// Convert file object to IAttachmentInfo
export const createAttachmentsObj = (files: any[]): IAttachmentInfo[] => {
    const results: IAttachmentInfo[] = [];
    try {
        if (files) {
            for (const f of files) {
                const mimetype = <string>f.mimetype;

                if (!mimetype) {
                    throw Error('Missing mimeType');
                }

                const content = f.buffer;
                if (!content) {
                    throw Error('Missing file content buffer');
                }

                const fileId = uuidv4();
                const ext = <string>mime.extension(mimetype);
                const filename = `${fileId}.${ext}`;

                results.push({
                    filename,
                    fileId,
                    ext,
                    content,
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
