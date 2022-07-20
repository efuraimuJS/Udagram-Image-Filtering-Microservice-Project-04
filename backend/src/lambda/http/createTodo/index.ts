import createTodoSchema from './createTodo.schema';

export const createTodo = {
    handler: `${__dirname
        .split(process.cwd())[1]
        .substring(1)
        .replace(/\\/g, '/')}/handler.createTodo`,
    events: [
        {
            http: {
                method: 'post',
                path: 'todos',
                cors: true,
                authorizer: {
                    name: 'Authorizer',
                    arn: { 'Fn::GetAtt': ['AuthorizerLambdaFunction', 'Arn'] },
                },
                request: {
                    schemas: {
                        'application/json': createTodoSchema,
                    },
                },
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: ['dynamoDB:PutItem'],
            Resource: [
                'arn:aws:dynamodb:${self:provider.region}:#{AWS::AccountId}:table/${self:provider.environment.TODO_TABLE}',
            ],
        },
    ],
};
