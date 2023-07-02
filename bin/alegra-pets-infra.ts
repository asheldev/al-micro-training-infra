#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { AlegraPetsInfraStack } from '../lib/alegra-pets-infra-stack';

dotenv.config();

const app = new cdk.App();

const appName = process.env.PROJECT_PREFIX || 'alegra-pets-training';

const environment = app.node.tryGetContext('env');

if (['dev', 'prod'].indexOf(environment) === -1) {
	throw Error(`Environment [${environment}] not supported`);
}

const sharedProps = {
	env: environment,
	account: process.env.AWS_ACCOUNT_ID || '',
	region: process.env.AWS_ACCOUNT_REGION || '',
}

new AlegraPetsInfraStack(app, 'AlegraPetsInfraStack', {
	...sharedProps,
	name: `${appName}-root-${environment}`,
});
