import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';

const generatePolicy = (
	principalId: string,
	effect: string,
	resource: string
): APIGatewayAuthorizerResult => ({
	principalId: principalId,
	policyDocument: {
		Version: '2012-10-17',
		Statement: [
			{
				Action: 'execute-api:Invoke',
				Effect: effect,
				Resource: resource
			},
		],
	},
});

export const handler = async (
	event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    // Extract the bearer authorization token from the event
    const authorizationToken = event.authorizationToken;

		let decodedToken;
    
		try {
        decodedToken = jwt.verify(authorizationToken, process.env.JWT_SECRET);

				if (decodedToken.sub !== 'fundation1') {
					return generatePolicy(decodedToken.sub, 'Deny', event.methodArn);
				}
    } catch (err) {
        console.error('Error verifying token', err);
        // Return an authorization response indicating the request is not authorized
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    // return an authorization response indicating the request is authorized
    return generatePolicy(decodedToken.sub, 'Allow', event.methodArn);
}
