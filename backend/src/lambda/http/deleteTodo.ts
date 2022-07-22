import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';
import { deleteTodo } from '../../bussinessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', {event: event});

  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  try{
    await deleteTodo(todoId, userId);
    logger.info('Deleted todoId and its userId: ', { todoId, userId });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
   };
  } catch(err) {
    logger.error('Unable to delete item. Error JSON:', { error: JSON.stringify(err, null, 2) } );

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
  }
}
