import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../logic/main/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  logger.info(`Creating new todo ${newTodo} for user ${userId}`)
  const newTodoItem = await createTodo(userId, newTodo)
  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newTodoItem
    })
  }
}).use(
  cors({
    credentials: true
  })
)