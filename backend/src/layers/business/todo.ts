import 'source-map-support/register';
import { Key } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import * as createHttpError from 'http-errors';

import { TodoAccess } from '../ports/AWS/DynamoDB/todoAccess';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { TodoItem } from '../../models/TodoItem';
import { fileStoreUrl } from './fileStore';

// The TODO Access port
const todoAccess = new TodoAccess();

/**
 * Get all user todo items from Todo database table with optional
 * pagination.
 * @param userId The user ID.
 * @param limit The optional number of returned items per call.
 * @param exclusiveStartKey The optional database TODO item key to
 * start the query from.
 * @returns All user TODO items with optional pagination.
 */
export async function getAllUserTodos(userId: string, limit?: string, exclusiveStartKey?: string) {
    // Validate the query params
    let queryLimit: number;
    let queryExclusiveStartKey: Key;
    if (limit) {
        queryLimit = validateLimitParam(limit);
    }
    if (exclusiveStartKey) {
        queryExclusiveStartKey = decodeNextKey(exclusiveStartKey);
    }

    // Get all user TODO items from DB
    const todos = await todoAccess.getAllUserTodos(userId, queryLimit, queryExclusiveStartKey);
    // Remove the user ID before the TODO items
    return { items: rmUserIdFromArr(todos.items), lastEvaluatedKey: todos.lastEvaluatedKey };
}

/**
 * Add a new TODO item to database.
 * @param userId The user ID.
 * @param todoParams The create TODO item request parameters.
 * @returns The newly created TODO item.
 */
export async function createTodo(userId: string, todoParams: CreateTodoRequest) {
    // Generate an unique TODO item ID
    const todoId = uuidv4();

    // Construct the new TODO item
    let newTodo: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: todoParams.name,
        dueDate: todoParams.dueDate,
        done: false,
        attachmentUrl: `${fileStoreUrl}/${todoId}`,
    };

    // Add the new TODO item to DB
    newTodo = await todoAccess.createTodo(newTodo);

    // Remove the user ID before returning the newly created TODO item
    return rmUserId(newTodo);
}

/**
 * Update a TODO item in database according to update params.
 * @param userId The TODO item owner user ID.
 * @param todoId The TODO item ID.
 * @param updateParams The update TODO item request parameters.
 */
export async function updateTodo(userId: string, todoId: string, updateParams: UpdateTodoRequest) {
    // Check if the TODO item exists in DB
    let todo = await todoExists(userId, todoId);
    // Update the TODO item properties
    todo = { ...todo, ...updateParams };
    // Update the TODO item in DB
    await todoAccess.updateTodo(todo);
}

/**
 * Delete a TODO item from database.
 * @param userId The TODO item owner user ID.
 * @param todoId The TODO item ID.
 */
export async function deleteTodo(userId: string, todoId: string) {
    // Check if the TODO item exists in DB
    const todo = await todoExists(userId, todoId);
    // Delete the TODO item from DB
    await todoAccess.deleteTodo(todo);
}

/**
 * Validate if the limit query parameter exists and it's positive.
 * @param limit Retrieval limit number of items for DB query operation.
 */
function validateLimitParam(limit: string) {
    // Validate the limit query parameter
    if (+limit <= 0) {
        throw new createHttpError.BadRequest('The pagination limit should be a positive number.');
    } else {
        return +limit;
    }
}

/**
 * Encode last evaluated key from database item.
 * @param {Key} lastEvaluatedKey a JS object that represents last
 * evaluated key.
 * @return {string} URI encoded last evaluated key.
 */
export function encodeNextKey(lastEvaluatedKey: Key): string {
    if (!lastEvaluatedKey) return undefined;

    return encodeURIComponent(JSON.stringify(lastEvaluatedKey));
}

/**
 * Decode last evaluated key from database item.
 * @param {string} lastEvaluatedKey a JS object that represents last
 * evaluated key.
 * @return {Key} URI encoded last evaluated key
 */
function decodeNextKey(lastEvaluatedKey: string): Key {
    return JSON.parse(decodeURIComponent(lastEvaluatedKey));
}

/**
 * Utility method to remove userId from TODO items. Useful for request
 * responses.
 * @param todo The complete TODO item.
 * @returns The new TODO item without the userId property.
 */
function rmUserId(todo: TodoItem) {
    const { userId, ...newTodo } = todo;
    return newTodo;
}

/**
 * Utility method to remove userId from an array of TODO items. Useful
 * for request responses.
 * @param todos The complete TODO items array.
 * @returns The new TODO item array without the userId property.
 */
function rmUserIdFromArr(todos: TodoItem[]) {
    const newTodos = todos.map((todo) => {
        const { userId, ...newTodo } = todo;
        return newTodo;
    });
    return newTodos;
}

/**
 * Check whether a TODO item exists in database.
 * @param userId The TODO user ID owner.
 * @param todoId The TODO item ID.
 * @returns The TODO item in case it exists or throw an error
 * otherwise.
 */
async function todoExists(userId: string, todoId: string) {
    let todo = await todoAccess.getTodo(userId, todoId);

    if (!todo) {
        throw new createHttpError.BadRequest("This TODO item doesn't exists.");
    }

    return todo;
}
