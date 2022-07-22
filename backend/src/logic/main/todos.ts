import * as uuid from 'uuid'
import TodosAccess from "../data/todos"
import { TodoItem } from "../../models/TodoItem"
import { CreateTodoRequest } from "../../requests/CreateTodoRequest"
import { TodoUpdate } from '../../models/TodoUpdate'
import { getAttachmentUrl } from './storage'

const todosAccess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
    const result = await todosAccess.getTodos(userId)
    for (const item of result) {
        const url = await getAttachmentUrl(item.todoId)
        if (url) {
            item.attachmentUrl = url
        }
    }
    return result
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const todoItem: TodoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        ...createTodoRequest
    }
    await todosAccess.createTodo(todoItem)
    return todoItem
}

export async function updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<void> {
    return await todosAccess.updateTodo(userId, todoId, todoUpdate)
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function getTodoById(userId: string, todoId: string): Promise<AWS.DynamoDB.QueryOutput> {
    return await todosAccess.getTodoById(userId, todoId)
}