#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AlegraPetsInfraStack } from '../lib/alegra-pets-infra-stack';

const name = 'alegra-pets-training'

const app = new cdk.App();
new AlegraPetsInfraStack(app, 'AlegraPetsInfraStack', {
  env: {
		account: process.env.AWS_ACCOUNT_ID,
		region: process.env.AWS_ACCOUNT_REGION
	},
	stackName: name
});
