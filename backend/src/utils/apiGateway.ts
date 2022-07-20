import 'source-map-support/register';
import type {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Handler,
    APIGatewayAuthorizerResult,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';

type ValidatedAPIGatewayProxyEventV2<S> = Omit<APIGatewayProxyEventV2, 'body'> & {
    body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEventV2<S> = Handler<
    ValidatedAPIGatewayProxyEventV2<S>,
    APIGatewayProxyResultV2
>;

/**
 * Generates an API Gateway IAM policy to allow or deny user access to
 * API resources.
 * @param userAuthorized Indicates whether the user is authorized or
 * not according to auth token from request headers.
 * @param userId The user id.
 * @returns The IAM policy allowing or denying access to API resources.
 */
export function generateIAMPolicy(userAuthorized: boolean, userId: string) {
    // IAM Policy to be sent to API Gateway
    const iamPolicy: APIGatewayAuthorizerResult = {
        principalId: userId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{ Effect: 'Deny', Action: 'execute-api:Invoke', Resource: '*' }],
        },
    };

    if (userAuthorized) {
        iamPolicy.policyDocument.Statement[0].Effect = 'Allow';
        // User authorized, return the Allow Policy
        return iamPolicy;
    }

    // User not authorized, thus send the deny policy
    return iamPolicy;
}
