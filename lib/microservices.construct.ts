import * as dotEnv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';

dotEnv.config();

// Config constants
const HANDLE_EMAIL_SUCCESS_TIMEOUT = 180;
const HANDLE_EMAIL_FAILED_TIMEOUT = 180;
const HANDLE_EMAIL_RETRIES_TIMEOUT = 360;
const HANDLE_EMAIL_SUCCESS_MEMORY_GB = 128;
const HANDLE_EMAIL_FAILED_MEMORY_GB = 128;
const HANDLE_EMAIL_RETRIES_MEMORY_GB = 256;

export interface IMicroserviceProps {
    mailTrailTbl: ITable;
}

export class PicklesMicroservicesConstruct extends Construct {
    public readonly handleEmailSentSuccessFn: NodejsFunction;
    public readonly handleEmailSentFailedFn: NodejsFunction;
    public readonly handleEmailRetriesFn: NodejsFunction;

    constructor(scope: Construct, id: string, props: IMicroserviceProps) {
        super(scope, id);
        this.handleEmailSentSuccessFn = this.createHandleEmailSentSuccessFn(
            props.mailTrailTbl
        );
        this.handleEmailSentFailedFn = this.createHandleEmailSentFailedFn(
            props.mailTrailTbl
        );
        this.handleEmailRetriesFn = this.createHandleEmailRetriesFn(
            props.mailTrailTbl
        );
    }

    private createHandleEmailSentSuccessFn(dbTable: ITable): NodejsFunction {
        const fn = new NodejsFunction(
            this,
            process.env.HANDLE_EMAIL_SENT_SUCCESS_FN!,
            {
                functionName: process.env.HANDLE_EMAIL_SENT_SUCCESS_FN,
                memorySize: HANDLE_EMAIL_SUCCESS_MEMORY_GB,
                timeout: cdk.Duration.seconds(HANDLE_EMAIL_SUCCESS_TIMEOUT),
                runtime: lambda.Runtime.NODEJS_16_X,
                handler: 'main',
                entry: join(__dirname, '/../functions/handle-email-success.ts'),
                bundling: {
                    minify: true,
                    externalModules: ['aws-sdk'],
                },
                environment: {
                    PRIMARY_KEY: 'id',
                    SORT_KEY: 'emailTransactionId',
                    MAIL_TRAIL_TABLE_NAME: dbTable.tableName,
                },
            }
        );
        dbTable.grantWriteData(fn);
        return fn;
    }

    private createHandleEmailSentFailedFn(dbTable: ITable): NodejsFunction {
        const fn = new NodejsFunction(
            this,
            process.env.HANDLE_EMAIL_SENT_FAILED_FN!,
            {
                functionName: process.env.HANDLE_EMAIL_SENT_FAILED_FN,
                memorySize: HANDLE_EMAIL_FAILED_MEMORY_GB,
                timeout: cdk.Duration.seconds(HANDLE_EMAIL_FAILED_TIMEOUT),
                runtime: lambda.Runtime.NODEJS_16_X,
                handler: 'main',
                entry: join(__dirname, '/../functions/handle-email-failed.ts'),
                bundling: {
                    minify: true,
                    externalModules: ['aws-sdk'],
                },
            }
        );
        dbTable.grantWriteData(fn);
        return fn;
    }

    private createHandleEmailRetriesFn(dbTable: ITable): NodejsFunction {
        const fn = new NodejsFunction(
            this,
            process.env.HANDLE_EMAIL_RETRIES_FN!,
            {
                functionName: process.env.HANDLE_EMAIL_RETRIES_FN,
                memorySize: HANDLE_EMAIL_RETRIES_MEMORY_GB,
                timeout: cdk.Duration.seconds(HANDLE_EMAIL_RETRIES_TIMEOUT),
                runtime: lambda.Runtime.NODEJS_16_X,
                handler: 'main',
                entry: join(__dirname, '/../functions/handle-email-retries.ts'),
                bundling: {
                    minify: true,
                    externalModules: ['aws-sdk'],
                },
            }
        );
        dbTable.grantWriteData(fn);
        return fn;
    }
}
