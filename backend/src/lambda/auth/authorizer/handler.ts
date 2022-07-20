import 'source-map-support/register';
import { APIGatewayTokenAuthorizerHandler, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

import { createLogger } from '../../../utils/logger';
import { validateAuthToken } from '../../../layers/business/authorizer';
import { generateIAMPolicy } from '../../../utils/apiGateway';

// Winston logger
const logger = createLogger('auth');

export const handler: APIGatewayTokenAuthorizerHandler = async (
    event: APIGatewayTokenAuthorizerEvent
) => {
    logger.info('Authorizing an user', event.authorizationToken);

    try {
        // Retrieve the validated and decoded auth token
        const decodedToken = await validateAuthToken(event.authorizationToken);
        // Valid token, allow access to lambda functions with an Allow
        // IAM policy
        logger.info('User was authorized', decodedToken);
        return generateIAMPolicy(true, decodedToken.payload.sub);
    } catch (error) {
        // User not authorized, thus send the deny policy to API
        // Gateway
        logger.error('User not authorized', { error: error.message });
        return generateIAMPolicy(false, 'unauthorized user');
    }
};
