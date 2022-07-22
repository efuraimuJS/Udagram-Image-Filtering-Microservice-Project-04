import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { getPresignedUrl } from '../../logic/main/storage'
import { getTodoById } from '../../logic/main/todos'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const result = await getTodoById(userId, todoId)

  if (result.Count === 0) {
    logger.warn(`User ${userId} requesting presigned URL for non-existing todo with ID: ${todoId}`)
    return {
      statusCode: 400,
      body: JSON.stringify(`Todo does not exist`)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: getPresignedUrl(todoId)
    })
  }
}).use(
  cors({
    credentials: true
  })
)