import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { Key } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../../../../models/TodoItem';

export class TodoAccess {
    /**
     * Constructs a TodoAccess instance.
     * @param dynamoDB AWS DynamoDB instance.
     * @param todoTable Todo table name.
     * @param todoIndex Todo table secondary index name.
     */
    constructor(
        private readonly dynamoDB = TodoAccess.createDBClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly todoIndex = process.env.TODO_INDEX
    ) {}

    /**
     * Return the live or offline DynamoDB Document client depending on
     * serverless running mode.
     * @returns The DynamoDB Document client.
     */
    private static createDBClient() {
        // Encapsulate AWS SDK to use AWS X-Ray
        const XAWS = AWSXRay.captureAWS(AWS);

        // Serverless running in offline mode
        if (process.env.IS_OFFLINE) {
            return new XAWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:5000',
                accessKeyId: 'DEFAULT_ACCESS_KEY',
                secretAccessKey: 'DEFAULT_SECRET',
            });
        } else {
            // Running in live mode
            return new XAWS.DynamoDB.DocumentClient();
        }
    }

    /**
     * Get all user TODO items from Todo DynamoDB table with optional
     * pagination.
     * @param userId The TODO items user id owner.
     * @param limit The number of returned items per call.
     * @param exclusiveStartKey The DynamoDB TODO item key to start the
     * query from.
     * @returns The user TODO items with optional pagination.
     */
    async getAllUserTodos(
        userId: string,
        limit?: number,
        exclusiveStartKey?: Key
    ): Promise<{ items: TodoItem[]; lastEvaluatedKey: Key }> {
        const result = await this.dynamoDB
            .query({
                TableName: this.todoTable,
                IndexName: this.todoIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId },
                Limit: limit,
                ExclusiveStartKey: exclusiveStartKey,
                ScanIndexForward: true,
            })
            .promise();
        return { items: result.Items as TodoItem[], lastEvaluatedKey: result.LastEvaluatedKey };
    }

    /**
     * Gets an user single TODO item per it's ID.
     * @param userId The user ID.
     * @param todoId The TODO item ID.
     * @returns The TODO item.
     */
    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
        const todo = await this.dynamoDB
            .query({
                TableName: this.todoTable,
                KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
                ExpressionAttributeValues: { ':userId': userId, ':todoId': todoId },
            })
            .promise();
        return todo.Items[0] as TodoItem;
    }

    /**
     * Add a TODO item in Todo DynamoDB table.
     * @param todo The TODO item.
     * @returns The added TODO item.
     */
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.dynamoDB.put({ TableName: this.todoTable, Item: todo }).promise();
        // Return the TODO item as confirmation of success operation
        return todo;
    }

    /**
     * Update a TODO item in Todo DynamoDB table.
     * @param todo The TODO item.
     */
    async updateTodo(todo: TodoItem): Promise<void> {
        await this.dynamoDB.put({ TableName: this.todoTable, Item: todo }).promise();
    }

    /**
     * Deletes a TODO item from Todo DynamoDB Table.
     * @param todoId The TODO item.
     */
    async deleteTodo(todo: TodoItem): Promise<void> {
        await this.dynamoDB
            .delete({
                TableName: this.todoTable,
                Key: { userId: todo.userId, todoId: todo.todoId },
            })
            .promise();
    }
}
