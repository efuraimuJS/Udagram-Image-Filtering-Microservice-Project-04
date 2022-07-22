import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todoAccess');

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTableName = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX) {
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTableName,
        Item: todoItem
      }, function(err, data) {
        if (err) logger.error('Error occured on putting an item to db',{error: err, item: todoItem});                                   // an error occurred
        else     logger.info('Data has been successfully added to db', {item: data});   // successful response
      }).promise()

    return todoItem;
  }

  async deleteTodo(todoId: string, userId: string): Promise<any> {
    await this.docClient.delete({
      TableName: this.todosTableName,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }, function(err, data) {
      if (err) logger.error('Error occured on deleting an item to db',{error: err, item: {userId, todoId}});                                   // an error occurred
      else     logger.info('Data has been successfully deleted from db', {item: {
        "userId": userId,
        "todoId": todoId
      }});
    }).promise();
  }

  async getTodos(userId: string): Promise<any> {
    return await this.docClient.query({
      TableName : this.todosTableName,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      },
      ScanIndexForward: false
    }, function(err, data) {
      if (err) logger.error('Error occured on getting a single toDoItem',{error: err, todoId: userId});                                   // an error occurred
      else     logger.info('Data has been fetched from db', {item: {
        "userId": userId
      }});
    }).promise();
  }

  private async update(params: any) : Promise<any>{
    await this.docClient.update(params, function(err, data) {
      if (err) {
          logger.error("Unable to update item. Error JSON:", {error: JSON.stringify(err, null, 2)});
      } else {
          logger.info("UpdateItem succeeded:", {data: JSON.stringify(data, null, 2)});
      }
    }).promise();
  }

  async updateTodo(todoItem: TodoItem): Promise<any> {
    const updateExpression = "set #name = :name, #dueDate=:dueDate, #done=:done";

    const params = {
      TableName: this.todosTableName,
      Key: {
        "todoId": todoItem.todoId,
        "userId": todoItem.userId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ":name": todoItem.name,
        ":dueDate": todoItem.dueDate,
        ":done": todoItem.done
      },
      ExpressionAttributeNames: {
        "#name": "name",
        "#dueDate": "dueDate",
        "#done": "done"
      },
      ReturnValues: "UPDATED_NEW"
    }

    logger.info("UpdateTodo", {params: params});

    await this.update(params);

    return todoItem;
  }

  async updateUrl(userId: string, url: string, todoId: string): Promise<any>  {
    const updateExpression = "set #attachmentUrl = :attachmentUrl";
  
    const params = {
      TableName: this.todosTableName,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ":attachmentUrl": url
      },
      ExpressionAttributeNames: {
        "#attachmentUrl": "attachmentUrl"
      },
      ReturnValues: "UPDATED_NEW"
    }

    logger.info("updateUrl", {params: params});

    await this.update(params);
  }
}

function createDynamoDBClient() {
  logger.info('Creating Todos DynamoDB Client...');

  return new XAWS.DynamoDB.DocumentClient()
}