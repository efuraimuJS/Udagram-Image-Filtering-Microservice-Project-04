import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils';
import { getTodos } from '../../bussinessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', {event: event});

  const authHeader = event.headers.Authorization;
  const authSplit = authHeader.split(" ");
  const userId = parseUserId(authSplit[1]);
  
  try {
    const result = await getTodos(userId);
    logger.info('Result: ', { result: result});

    const items = result.Items;

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items
        })
    }
    
  } catch(e) {
    logger.error('An error occured on getting todos: ', {error: e.message})

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
  }
}