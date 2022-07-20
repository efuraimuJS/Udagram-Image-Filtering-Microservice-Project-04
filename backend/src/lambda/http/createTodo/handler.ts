import 'source-map-support/register';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

import { createLogger } from '../../../utils/logger';
import { ValidatedEventAPIGatewayProxyEventV2 } from '../../../utils/apiGateway';
import createTodoSchema from './createTodo.schema';
import { createTodo as addTodoToDB } from '../../../layers/business/todo';
import { formatJSONResponse, middyfy } from '../../../utils/lambda';

// Winston logger
const logger = createLogger('createTodo');

const handler: ValidatedEventAPIGatewayProxyEventV2<typeof createTodoSchema> = async (
    event,
    context: any
): Promise<APIGatewayProxyResultV2> => {
    logger.info('Creating a new TODO item for an user', {
        userId: context.userId,
        todoReqParams: event.body,
    });

    // Add the new TODO item to DB
    const newTodo = await addTodoToDB(context.userId, event.body);

    logger.info('New TODO item added to DB', newTodo);

    // Return the CREATED response with the new TODO item
    return formatJSONResponse(201, { item: newTodo });
};

export const createTodo = middyfy(handler);
