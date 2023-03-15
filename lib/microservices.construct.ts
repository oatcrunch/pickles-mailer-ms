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
    public readonly handleEmailSentSuccessFn: NodejsFunction;
    public readonly handleEmailSentFailedFn: NodejsFunction;

    constructor(scope: Construct, id: string, props: IMicroserviceProps) {
        super(scope, id);
        this.handleEmailSentSuccessFn = this.createHandleEmailSentSuccessFn();
        this.handleEmailSentFailedFn = this.createHandleEmailSentFailedFn();
    }

    private createHandleEmailSentSuccessFn(): NodejsFunction {
        const fn = new NodejsFunction(
            this,
            process.env.HANDLE_EMAIL_SENT_SUCCESS_FN!,
            {
                functionName: process.env.HANDLE_EMAIL_SENT_SUCCESS_FN,
                memorySize: 256,
                timeout: cdk.Duration.seconds(180),
                runtime: lambda.Runtime.NODEJS_16_X,
                handler: 'main',
                entry: join(__dirname, '/../functions/handle-email-success.ts'),
                bundling: {
                    minify: true,
                    externalModules: ['aws-sdk'],
                },
            }
        );
        return fn;
    }

    private createHandleEmailSentFailedFn(): NodejsFunction {
        const fn = new NodejsFunction(
            this,
            process.env.HANDLE_EMAIL_SENT_FAILED_FN!,
            {
                functionName: process.env.HANDLE_EMAIL_SENT_FAILED_FN,
                memorySize: 256,
                timeout: cdk.Duration.seconds(180),
                runtime: lambda.Runtime.NODEJS_16_X,
                handler: 'main',
                entry: join(__dirname, '/../functions/handle-email-failed.ts'),
                bundling: {
                    minify: true,
                    externalModules: ['aws-sdk'],
                },
            }
        );
        return fn;
    }
}
