import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { StackBasicProps } from '../interfaces';
import { getCdkPropsFromCustomProps } from '../utils';

export class AlegraPetsInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackBasicProps) {
    super(scope, id, getCdkPropsFromCustomProps(props));

    const alegraHostedZone = new route53.HostedZone(this, 'AlegraTrainingZone', {
  		zoneName: 'alegra.com',
		});

		// alegra.com certificate
		new acm.Certificate(this, 'AlegraPetsTrainingCertificate', {
			domainName: '*.alegra.com',
			certificateName: 'Alegra Pets Training',
			validation: acm.CertificateValidation.fromDns(alegraHostedZone)
		});
	}
}
