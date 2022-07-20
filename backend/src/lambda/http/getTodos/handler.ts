import 'source-map-support/register';
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    APIGatewayProxyHandlerV2,
} from 'aws-lambda';

import { createLogger } from '../../../utils/logger';
import { formatJSONResponse, middyfy } from '../../../utils/lambda';
import { encodeNextKey, getAllUserTodos } from '../../../layers/business/todo';

// Winston logger
const logger = createLogger('getTodos');

const handler: APIGatewayProxyHandlerV2 = async (
    event: APIGatewayProxyEventV2,
    context: any
): Promise<APIGatewayProxyResultV2> => {
    logger.info('Get all TODOs from an user', {
        userId: context.userId,
        queryStringParameters: event?.queryStringParameters,
    });

    // Retrieve the "limit" and "nextKey" from query parameters
    const limit = event?.queryStringParameters?.limit;
    const nextKey = event?.queryStringParameters?.nextKey;

    // Get all user TODO items from DB
    const todos = await getAllUserTodos(context.userId, limit, nextKey);

    logger.info('Retrieved TODOs from an user', { userId: context.userId, todos });

    // Return the response with TODO items
    return formatJSONResponse(200, {
        items: todos.items,
        // Encode the Key JSON object so a client can return it in an
        // URL as is
        nextKey: encodeNextKey(todos.lastEvaluatedKey),
    });
};

export const getTodos = middyfy(handler);
