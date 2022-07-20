import updateTodoSchema from './updateTodo.schema';

export const updateTodo = {
    handler: `${__dirname
        .split(process.cwd())[1]
        .substring(1)
        .replace(/\\/g, '/')}/handler.updateTodo`,
    events: [
        {
            http: {
                method: 'patch',
                path: 'todos/{todoId}',
                cors: true,
                authorizer: {
                    name: 'Authorizer',
                    arn: { 'Fn::GetAtt': ['AuthorizerLambdaFunction', 'Arn'] },
                },
                request: {
                    schemas: {
                        'application/json': updateTodoSchema,
                    },
                },
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: ['dynamoDB:Query', 'dynamoDB:PutItem'],
            Resource: [
                'arn:aws:dynamodb:${self:provider.region}:#{AWS::AccountId}:table/${self:provider.environment.TODO_TABLE}',
            ],
        },
    ],
};
