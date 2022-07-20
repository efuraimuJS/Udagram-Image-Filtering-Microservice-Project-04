import 'source-map-support/register';
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    APIGatewayProxyHandlerV2,
} from 'aws-lambda';

import { createLogger } from '../../../utils/logger';
import { deleteTodo as removeTodo } from '../../../layers/business/todo';
import { formatJSONResponse, middyfy } from '../../../utils/lambda';

// Winston logger
const logger = createLogger('deleteTodo');

const handler: APIGatewayProxyHandlerV2 = async (
    event: APIGatewayProxyEventV2,
    context: any
): Promise<APIGatewayProxyResultV2> => {
    // Get the user ID
    const userId = context.userId;
    // Get the TODO ID from path params
    const todoId = event.pathParameters.todoId;

    logger.info('Deleting a TODO item for an user', { userId, todoId });

    // Delete the TODO item from DB
    await removeTodo(userId, todoId);

    logger.info('TODO item deleted for an user', { userId });

    // Return the OK response with an empty body
    return formatJSONResponse(200, {});
};

export const deleteTodo = middyfy(handler);
