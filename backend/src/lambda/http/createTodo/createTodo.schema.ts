export default {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        dueDate: { type: 'string', minLength: 1 },
    },
    required: ['name', 'dueDate'],
    additionalProperties: false,
} as const;
