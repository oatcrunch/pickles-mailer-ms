import * as dotEnv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

dotEnv.config();

export interface IMicroserviceProps {
    // TODO: if needed
}

export class PicklesMicroservicesConstruct extends Construct {
    public readonly processMailSubmissionFn: NodejsFunction;
    public readonly persistDataFn: NodejsFunction;

    constructor(scope: Construct, id: string, props: IMicroserviceProps) {
        super(scope, id);
        // this.processMailSubmissionFn = this.createEnquiryFn();
        this.persistDataFn = this.createPersistDataFn();
    }

    private createEnquiryFn(): NodejsFunction {
        const sendReqFn = new NodejsFunction(this, 'ProcessMailSubmissionFn', {
            memorySize: 256,
            timeout: cdk.Duration.seconds(180),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'main',
            entry: join(__dirname, '/../functions/process-mail-req.ts'),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
        });
        return sendReqFn;
    }

    private createPersistDataFn(): NodejsFunction {
        const persistDataFn = new NodejsFunction(
            this,
            process.env.PERSIST_DATA_FN!,
            {
                functionName: process.env.PERSIST_DATA_FN,
                memorySize: 256,
                timeout: cdk.Duration.seconds(180),
                runtime: lambda.Runtime.NODEJS_16_X,
                handler: 'main',
                entry: join(__dirname, '/../functions/persist-data.ts'),
                bundling: {
                    minify: true,
                    externalModules: ['aws-sdk'],
                },
            }
        );
        return persistDataFn;
    }
}
