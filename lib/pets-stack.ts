import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import { getCdkPropsFromCustomProps, getResourceNameWithPrefix } from '../utils';
import { StackBasicProps } from '../interfaces';

export class PetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackBasicProps) {
    super(scope, id, getCdkPropsFromCustomProps(props));

		// Creating Fundations table
		const petsTable = new dynamo.Table(this, 'PetsTable', {
			partitionKey: {
				name: 'petId',
				type: dynamo.AttributeType.STRING,
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			tableName: getResourceNameWithPrefix(`pets-table-${props.env}`),
		})

		// Adding GSI for 'joins'
		petsTable.addGlobalSecondaryIndex({
			partitionKey: {
				name: 'fundationId',
				type: dynamo.AttributeType.STRING,
			},
			indexName: getResourceNameWithPrefix(`fundation-index-${props.env}`),
			projectionType: dynamo.ProjectionType.ALL,
		})

		new cdk.CfnOutput(this, 'PetsTableNameOutput', {
			value: petsTable.tableName,
			exportName: getResourceNameWithPrefix(`pets-table-name-${props.env}`),
		})
	}	
}
