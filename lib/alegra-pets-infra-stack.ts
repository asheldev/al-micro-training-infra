import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGw2 from 'aws-cdk-lib/aws-apigatewayv2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { RootStackProps } from '../interfaces';
import { getCdkPropsFromCustomProps, getResourceNameWithPrefix } from '../utils';

export class AlegraPetsInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RootStackProps) {
    super(scope, id, getCdkPropsFromCustomProps(props));

		const fundationsTable = props.fundationsStack.fundationsTable;
		
    const alegraHostedZone = new route53.HostedZone(this, 'AlegraTrainingZone', {
  		zoneName: 'alegra.com',
		});

		// alegra.com certificate
		new acm.Certificate(this, 'AlegraPetsTrainingCertificate', {
			domainName: '*.alegra.com',
			certificateName: 'Alegra Pets Training',
			validation: acm.CertificateValidation.fromDns(alegraHostedZone)
		});

		// jsonwebtoken lambda layer
		const jwtLayer = new lambda.LayerVersion(this, 'JwtLambdaLayer', {
			code: lambda.Code.fromAsset('src/lambda/layers/jsonwebtoken'),
			compatibleRuntimes: [
				lambda.Runtime.NODEJS_14_X,
				lambda.Runtime.NODEJS_16_X,
			],
			layerVersionName: getResourceNameWithPrefix(`jwt-layer-${props.env}`),
			description: 'Uses a 3rd party libray called jsonwebtoken'
		});

		// ulid lambda layer
		const ulidLayer = new lambda.LayerVersion(this, 'UlidLambdaLayer', {
			code: lambda.Code.fromAsset('src/lambda/layers/ulid'),
			compatibleRuntimes: [
				lambda.Runtime.NODEJS_14_X,
				lambda.Runtime.NODEJS_16_X,
			],
			layerVersionName: getResourceNameWithPrefix(`ulid-layer-${props.env}`),
			description: 'Uses a 3rd party libray called ulid to generate sorteable identifiers'
		});

		// Authorizer lambda
		const authorizerLambda = new NodejsFunction(this, 'AuthorizerLambda', {
			runtime: lambda.Runtime.NODEJS_16_X,
			entry: path.join(__dirname, '/../src/lambda/authorizer.lambda.ts'),
			handler: 'handler',
			bundling: {
				minify: false,
				externalModules: ['jsonwebtoken', 'aws-sdk']
			},
			functionName: getResourceNameWithPrefix(`lambda-authorizer-${props.env}`),
			layers: [jwtLayer],
			environment: {
				JWT_SECRET: process.env.JWT_SECRET || '',
				FUNDATIONS_TABLE_NAME: fundationsTable.tableName,
			}
		});

		fundationsTable.grantFullAccess(authorizerLambda);

		// Creating the API
		const httpApi = new apiGw2.CfnApi(this, 'AlegraPetsTrainingApi', {
			name: getResourceNameWithPrefix(`api-${props.env}`),
			protocolType: 'HTTP',
			corsConfiguration: {
				allowCredentials: false,
				allowHeaders: ['*'],
				allowMethods: ['*'],
				allowOrigins: ['*'],
			},
		});

		const jwtAuthorizerUri = `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/${authorizerLambda.functionArn}/invocations`
		
		// Creating the authorizer for the API
		const jwtAuthorizer = new apiGw2.CfnAuthorizer(
			this,
			'AlegraPetsTrainingApiAuthorizer',
			{
				apiId: httpApi.ref,
				name: getResourceNameWithPrefix(`jwt-authorizer-${props.env}`),
				authorizerType: 'REQUEST',
				authorizerUri: jwtAuthorizerUri,
				identitySource: ['$request.header.Authorization'],
				authorizerPayloadFormatVersion: '2.0',
				authorizerResultTtlInSeconds: 300,
			}
		);

		const defaultStage = new apiGw2.CfnStage(this, "ApiDefaultStage", {
      apiId: httpApi.ref,
      stageName: "$default",
      autoDeploy: true,
      defaultRouteSettings: {
        dataTraceEnabled: false,
        detailedMetricsEnabled: true,
      },
    });

		new cdk.CfnOutput(this, 'JwtLambdaLayerArn', {
			exportName: getResourceNameWithPrefix(`jwt-layer-arn-${props.env}`),
			value: jwtLayer.layerVersionArn,
		});

		new cdk.CfnOutput(this, 'UlidLambdaLayerArn', {
			exportName: getResourceNameWithPrefix(`ulid-layer-arn-${props.env}`),
			value: ulidLayer.layerVersionArn,
		});
		
		new cdk.CfnOutput(this, 'ApiIdOutput', {
			exportName: getResourceNameWithPrefix(`api-id-${props.env}`),
			value: httpApi.ref,
		});

		new cdk.CfnOutput(this, 'JwtAuthorizerIdOutput', {
			exportName: getResourceNameWithPrefix(`jwt-authorizer-id-${props.env}`),
			value: jwtAuthorizer.ref,
		})
	}
}
