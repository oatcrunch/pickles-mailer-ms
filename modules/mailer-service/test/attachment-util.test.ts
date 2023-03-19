import { createAttachmentsObj } from '../src/helpers/mail/attachment-utils';

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
});
