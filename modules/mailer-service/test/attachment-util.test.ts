import { createAttachmentsObj } from '../src/helpers/mail/attachment-utils';
jest.mock('uuid', () => ({ v4: () => '123456789' }));

describe('createAttachmentsObj', () => {
    const testFile = {
        mimetype: 'text/plain',
        buffer: Buffer.from('Test file'),
    };

    it('should return an empty array if no files are provided', () => {
        const result = createAttachmentsObj([]);
        expect(result).toEqual([]);
    });

    it('should create an attachment object from a single file', () => {
        const result = createAttachmentsObj([testFile]);
        expect(result.length).toBe(1);
        expect(result[0]).toHaveProperty('filename');
        expect(result[0]).toHaveProperty('fileId');
        expect(result[0]).toHaveProperty('ext');
        expect(result[0]).toHaveProperty('content');
        expect(result[0]).toHaveProperty('mimetype');
    });

    it('should create multiple attachment objects from an array of files', () => {
        const result = createAttachmentsObj([testFile, testFile]);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty('filename');
        expect(result[0]).toHaveProperty('fileId');
        expect(result[0]).toHaveProperty('ext');
        expect(result[0]).toHaveProperty('content');
        expect(result[0]).toHaveProperty('mimetype');
        expect(result[1]).toHaveProperty('filename');
        expect(result[1]).toHaveProperty('fileId');
        expect(result[1]).toHaveProperty('ext');
        expect(result[1]).toHaveProperty('content');
        expect(result[1]).toHaveProperty('mimetype');
    });

    it('should convert file object correctly', () => {
        const content = Buffer.from('some data');
        const result = createAttachmentsObj([
            {
                fieldname: 'file',
                originalname: 'Some filename.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                buffer: content,
            },
        ]);
        expect(result.length).toBe(1);
        expect(result[0]).toEqual({
            filename: 'Some filename.pdf',
            fileId: '123456789',
            ext: 'pdf',
            content,
            mimetype: 'application/pdf',
        });
    });
});
