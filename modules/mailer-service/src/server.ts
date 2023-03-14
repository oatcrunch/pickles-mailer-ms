import * as express from 'express';
import * as dotEnv from 'dotenv';
import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { IUploadResult, uploadS3 } from './upload';

dotEnv.config();
const port = process.env.ENQUIRY_PORT || 3000;
const upload = multer();

// Server instance unique ID
const serverId = uuidv4();

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send(`Endpoint reachable from ${serverId}!`);
});

app.post('/test', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        res.status(200).send(`You have just sent ${JSON.stringify(req.body)}`);
    } catch (err) {
        res.status(500).send(JSON.stringify(err));
    }
});

app.post(
    '/email',
    upload.fields([{ name: 'file', maxCount: 3 }, { name: 'json' }]),
    async (req: Request, res: Response) => {
        try {
            if (!req.body) {
                throw Error(
                    'Body is required with "json" and "file" (optional) fields'
                );
            }
            console.log('POST /email: body', req.body);
            console.log('POST /email: files', req.files['file']);

            if (!req.body.json) {
                throw Error(
                    'Body.json object is mandatory with "to", "subject", and "text" fields'
                );
            }

            const json = JSON.parse(req.body.json);
            console.log(json);
            let ret: IUploadResult = {
                transactId: '',
                etag: '',
            };

            if (req.files) {
                const file = req.files['file'];
                ret = await uploadS3(file);
            }
            res.status(201).send(
                `Uploaded with transaction id: "${ret.transactId}" and etag: ${ret.etag}`
            );
        } catch (err) {
            res.status(500).send(JSON.stringify(err));
        }
    }
);

app.listen(port, () => {
    // console.log('process.env', process.env); // enable only for debugging
    console.log(`Server listening on port ${port}`);
});
