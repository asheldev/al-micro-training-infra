import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';

import { StackBasicProps } from '../interfaces';
import { getCdkPropsFromCustomProps, getResourceNameWithPrefix } from '../utils';

export class FundationsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackBasicProps) {
    super(scope, id, getCdkPropsFromCustomProps(props));
	
		const fundationsTable = new dynamo.Table(this, 'FundationsTable', {
			tableName: getResourceNameWithPrefix(`fundations-table-${props.env}`),
			partitionKey: {
				name: 'fundationId',
				type: dynamo.AttributeType.STRING,
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		new cdk.CfnOutput(this, 'FundationsTableNameOutput', {
			value: fundationsTable.tableName,
			exportName: getResourceNameWithPrefix(`fundations-table-name-${props.env}`),
		});
  }
}
