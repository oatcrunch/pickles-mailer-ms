import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as PickleMailerMs from '../lib/pickle-mailer-ms-stack';

describe('PickleMAilerMsTest', () => {
    const app = new cdk.App();
    const stack = new PickleMailerMs.PickleMailerMsStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    test('DynamoDB Created', () => {
        template.hasResource('AWS::DynamoDB::Table', {});
    });

    test('SQS Queue Created', () => {
        template.hasResource('AWS::SQS::Queue', {});
    });

    test('AWS Lambda Created', () => {
        template.hasResource('AWS::Lambda::Function', {});
    });

    test('S3 Bucket Created', () => {
        template.hasResource('AWS::S3::Bucket', {});
    });

    test('Event Bud Created', () => {
        template.hasResource('AWS::Events::EventBus', {});
    });
});
