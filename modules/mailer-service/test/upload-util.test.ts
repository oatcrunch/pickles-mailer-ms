import { uploadS3, client } from '../src/helpers/upload/upload-utils';

const clientMock = jest.spyOn(client, 'send').mockImplementation(() => {
    return {
        ETag: 'etag123',
    };
});

jest.mock('uuid', () => ({ v4: () => '123456789' }));

describe('uploadS3', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should upload files to S3', async () => {
        const files = [
            {
                filename: 'test.txt',
                fileId: 'fileId123',
                ext: 'txt',
                content: Buffer.from('Hello, world!'),
                mimetype: 'text/plain',
            },
        ];

        const expectedTransaction = {
            transactionId: '123456789',
            transactionDateTime: expect.any(Date),
            etags: ['etag123'],
        };

        const result = await uploadS3(files);

        expect(result).toEqual(expectedTransaction);
        expect(clientMock).toHaveBeenCalledTimes(1);
    });

    test('should return empty transaction if no files provided', async () => {
        const result = await uploadS3([]);

        expect(result).toEqual({
            transactionId: '',
        });
    });
});
