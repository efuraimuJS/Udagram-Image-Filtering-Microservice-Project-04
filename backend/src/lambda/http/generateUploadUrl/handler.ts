import 'source-map-support/register';
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    APIGatewayProxyHandlerV2,
} from 'aws-lambda';

import { createLogger } from '../../../utils/logger';
import { getPutPreSignedUrl } from '../../../layers/business/fileStore';
import { formatJSONResponse, middyfy } from '../../../utils/lambda';

// Winston logger
const logger = createLogger('generateUploadUrl');

const handler: APIGatewayProxyHandlerV2 = async (
    event: APIGatewayProxyEventV2,
    context: any
): Promise<APIGatewayProxyResultV2> => {
    // Get the user ID
    const userId = context.userId;
    // Get the TODO ID from path params
    const todoId = event.pathParameters.todoId;

    logger.info('Generating a pre-signed upload URL', { userId, todoId });

    // Get the file store pre-signed URL
    const signedUrl = getPutPreSignedUrl(todoId);

    logger.info('Pre-signed URL generated', { signedUrl });

    // Return the pre-signed URL to allow object upload to file store
    // for a TODO item image
    return formatJSONResponse(200, { uploadUrl: signedUrl });
};

export const generateUploadUrl = middyfy(handler);
