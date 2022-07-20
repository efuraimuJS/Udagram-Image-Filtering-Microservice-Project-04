import 'source-map-support/register';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

import { createLogger } from '../../../utils/logger';
import { ValidatedEventAPIGatewayProxyEventV2 } from '../../../utils/apiGateway';
import updateTodoSchema from './updateTodo.schema';
import { UpdateTodoRequest } from '../../../requests/UpdateTodoRequest';
import { formatJSONResponse, middyfy } from '../../../utils/lambda';
import { updateTodo as patchTodo } from '../../../layers/business/todo';

// Winston logger
const logger = createLogger('updateTodo');

const handler: ValidatedEventAPIGatewayProxyEventV2<typeof updateTodoSchema> = async (
    event,
    context: any
): Promise<APIGatewayProxyResultV2> => {
    // Get the user ID
    const userId = context.userId;
    // Get the TODO ID from path params
    const todoId = event.pathParameters.todoId;
    // Get the update todo request params
    const updateReqParams: UpdateTodoRequest = event.body;

    logger.info('Updating a TODO item for an user', { userId, todoId, updateReqParams });

    // Update the TODO item in DB
    await patchTodo(userId, todoId, updateReqParams);

    logger.info('TODO item updated for an user', { userId });

    // Return the OK response with an empty body
    return formatJSONResponse(200, {});
};

export const updateTodo = middyfy(handler);
