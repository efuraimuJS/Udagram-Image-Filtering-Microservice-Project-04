import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';

import { getPresignedUrl, attachUrl } from '../../bussinessLogic/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', {event: event});

  const todoId = event.pathParameters.todoId  
  const presignedUrl = await getPresignedUrl(todoId);
  const userId = getUserId(event);

  try {
    await attachUrl(userId, todoId);
    logger.info("Url is attached to todo. TodoId and its userId", todoId, userId);
    logger.info("presignedURL as in generateuploadurl:", presignedUrl);
  } catch(e) {
    logger.error("An error is occured on attaching url: ", { error: e.message });

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
        uploadUrl: presignedUrl
    })
  };
}