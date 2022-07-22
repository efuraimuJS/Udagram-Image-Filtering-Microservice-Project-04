import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { BucketAccess } from '../dataLayer/bucketAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils';
import { TodoUpdate } from '../models/TodoUpdate';

const todoAccess = new TodoAccess();
const bucketAccess = new BucketAccess();

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const userId = parseUserId(jwtToken)
  
  const newItem = {
    ...createTodoRequest,
    userId,
    done: false,
    createdAt: new Date().toISOString(),
    todoId: uuid.v4()
  }

  return await todoAccess.createTodo(newItem);
}

export async function deleteTodo(todoId: string, userId: string): Promise<any> {
  return await todoAccess.deleteTodo(todoId, userId);
}

export async function getTodos(userId: string): Promise<any> {
  return await todoAccess.getTodos(userId);
}

export async function updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string) {
  return await todoAccess.updateTodo({
    todoId,
    userId,
    name: todoUpdate.name,
    dueDate: todoUpdate.dueDate,
    done: todoUpdate.done,
    createdAt: new Date().toISOString()
  })
}

export async function attachUrl(userId: string, todoId: string) {
  const url = bucketAccess.getImageUrl(todoId);
  await todoAccess.updateUrl(userId, url, todoId);
}

export async function getPresignedUrl(imageId: uuid){
  console.log("image id in getpresigned url:", imageId);
  const presignedUrl = bucketAccess.getPutSignedUrl(imageId);
  console.log("presigned url:", presignedUrl);

  return presignedUrl;
}