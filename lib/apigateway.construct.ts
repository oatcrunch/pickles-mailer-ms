import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface IApiGatewayProps {
    processMailSubmissionFn: IFunction;
}

export class ApiGatewayConstruct extends Construct {
    public lambdaRestApi: LambdaRestApi;

    constructor(scope: Construct, id: string, props: IApiGatewayProps) {
        super(scope, id);
        this.lambdaRestApi = this.createApi(props);
    }

    private createApi(props: IApiGatewayProps): LambdaRestApi {
        this.lambdaRestApi = new LambdaRestApi(this, 'LambdaRestApi', {
            restApiName: 'Api',
            handler: props.processMailSubmissionFn,
            proxy: false,
        });

        const enquiryResource = this.lambdaRestApi.root.addResource('email');
        enquiryResource.addMethod('POST');

        return this.lambdaRestApi;
    }
}
