import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

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
    // Extract the authorization token from the event
    const authorizationToken = event.headers.authorization;

		let decodedToken;
    
		try {
        decodedToken = jwt.verify(authorizationToken, process.env.JWT_SECRET);

				const params = {
					TableName: process.env.FUNDATIONS_TABLE_NAME,
					KeyConditionExpression: 'fundationId = :fundationId',
					ExpressionAttributeValues: {
						":fundationId": decodedToken.fundationId
					}
				}
				
				const fundation = await dynamo.query(params).promise();

				if (!fundation) {
					return generatePolicy(decodedToken.fundationId, 'Deny', event.routeArn);
				}
    } catch (err) {
        console.error('Error: ', err);
        // Return an authorization response indicating the request is not authorized
        return generatePolicy(decodedToken.fundationId, 'Deny', event.routeArn);
    }

    // return an authorization response indicating the request is authorized
    return generatePolicy(decodedToken.fundationId, 'Allow', event.routeArn);
}
