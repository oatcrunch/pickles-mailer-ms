import * as dotEnv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import {
    EMAIL_EVENT_SOURCE_NAME,
    EVENT_BUS_NAME,
    EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE,
    HANDLE_EMAIL_RETRIES_FN,
    HANDLE_EMAIL_SENT_FAILED_FN,
    HANDLE_EMAIL_SENT_SUCCESS_FN,
} from '../modules/mailer-service';
import { IBucket } from 'aws-cdk-lib/aws-s3';

dotEnv.config({
    path: join(__dirname, '/../modules/mailer-service/.env'),
});

// Config constants
const HANDLE_EMAIL_SUCCESS_TIMEOUT = 180;
const HANDLE_EMAIL_FAILED_TIMEOUT = 180;
const HANDLE_EMAIL_RETRIES_TIMEOUT = 360;
const HANDLE_EMAIL_SUCCESS_MEMORY_GB = 128;
const HANDLE_EMAIL_FAILED_MEMORY_GB = 128;
const HANDLE_EMAIL_RETRIES_MEMORY_GB = 256;

export interface IMicroserviceProps {
    mailTrailTbl: ITable;
    bucket: IBucket;
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
            props.mailTrailTbl,
            props.bucket
        );
    }

    private createHandleEmailSentSuccessFn(dbTable: ITable): NodejsFunction {
        const fn = new NodejsFunction(this, HANDLE_EMAIL_SENT_SUCCESS_FN!, {
            functionName: HANDLE_EMAIL_SENT_SUCCESS_FN,
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
        });
        dbTable.grantWriteData(fn); // to allow lambda function to write data to database
        return fn;
    }

    private createHandleEmailSentFailedFn(dbTable: ITable): NodejsFunction {
        const fn = new NodejsFunction(this, HANDLE_EMAIL_SENT_FAILED_FN!, {
            functionName: HANDLE_EMAIL_SENT_FAILED_FN,
            memorySize: HANDLE_EMAIL_FAILED_MEMORY_GB,
            timeout: cdk.Duration.seconds(HANDLE_EMAIL_FAILED_TIMEOUT),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'main',
            entry: join(__dirname, '/../functions/handle-email-failed.ts'),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
            environment: {
                PRIMARY_KEY: 'id',
                SORT_KEY: 'emailTransactionId',
                MAIL_TRAIL_TABLE_NAME: dbTable.tableName,
                EMAIL_EVENT_SOURCE_NAME,
                EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE:
                    EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE!,
                EVENT_BUS_NAME: EVENT_BUS_NAME!,
            },
        });
        dbTable.grantWriteData(fn); // to allow lambda function to write data to database
        return fn;
    }

    private createHandleEmailRetriesFn(
        dbTable: ITable,
        bucket: IBucket
    ): NodejsFunction {
        const fn = new NodejsFunction(this, HANDLE_EMAIL_RETRIES_FN!, {
            functionName: HANDLE_EMAIL_RETRIES_FN,
            memorySize: HANDLE_EMAIL_RETRIES_MEMORY_GB,
            timeout: cdk.Duration.seconds(HANDLE_EMAIL_RETRIES_TIMEOUT),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'main',
            entry: join(__dirname, '/../functions/handle-email-retries.ts'),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
            environment: {
                EMAIL_EVENT_SOURCE_NAME,
                EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE:
                    EVENT_SENT_RETRIES_EVENT_DETAIL_TYPE!,
                EVENT_BUS_NAME: EVENT_BUS_NAME!,
                EMAIL_ADDRESS: process.env.EMAIL_ADDRESS!,
                CLIENT_ID: process.env.CLIENT_ID!,
                CLIENT_SECRET: process.env.CLIENT_SECRET!,
                REFRESH_TOKEN: process.env.REFRESH_TOKEN!,
            },
        });
        dbTable.grantReadWriteData(fn); // to allow lambda function to read and write data to database
        bucket.grantRead(fn); // to allow lambda function to read from S3 bucket
        return fn;
    }
}
