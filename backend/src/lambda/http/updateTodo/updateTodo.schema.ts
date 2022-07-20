export default {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        dueDate: { type: 'string', minLength: 1 },
        done: { type: 'boolean', minLength: 1 },
    },
    required: ['name', 'dueDate', 'done'],
    additionalProperties: false,
} as const;
