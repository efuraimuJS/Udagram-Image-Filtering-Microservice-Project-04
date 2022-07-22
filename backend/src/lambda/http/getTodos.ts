import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { getTodos } from '../../logic/main/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  logger.info(`Retrieving todos for user ${userId}`)
  const todoItems = await getTodos(userId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todoItems
    })
  }
}).use(
  cors({
    credentials: true
  })
)