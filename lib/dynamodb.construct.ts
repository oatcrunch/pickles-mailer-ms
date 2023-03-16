import * as dotEnv from 'dotenv';
import { RemovalPolicy } from 'aws-cdk-lib';
import {
    AttributeType,
    BillingMode,
    ITable,
    Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { MAIL_TRAIL_TABLE_NAME } from '../modules/mailer-service';

dotEnv.config();

export class PicklesDynamoDbConstruct extends Construct {
    public readonly mailTrailTable: ITable;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.mailTrailTable = this.createMailTrailTable();
    }

    private createMailTrailTable(): ITable {
        return new Table(this, MAIL_TRAIL_TABLE_NAME!, {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'emailTransactionId',
                type: AttributeType.STRING,
            },
            tableName: MAIL_TRAIL_TABLE_NAME,
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
    }
}
