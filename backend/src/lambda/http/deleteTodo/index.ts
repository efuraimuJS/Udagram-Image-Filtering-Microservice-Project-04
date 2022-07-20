export const deleteTodo = {
    handler: `${__dirname
        .split(process.cwd())[1]
        .substring(1)
        .replace(/\\/g, '/')}/handler.deleteTodo`,
    events: [
        {
            http: {
                method: 'delete',
                path: 'todos/{todoId}',
                cors: true,
                authorizer: {
                    name: 'Authorizer',
                    arn: { 'Fn::GetAtt': ['AuthorizerLambdaFunction', 'Arn'] },
                },
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: ['dynamoDB:Query', 'dynamoDB:DeleteItem'],
            Resource: [
                'arn:aws:dynamodb:${self:provider.region}:#{AWS::AccountId}:table/${self:provider.environment.TODO_TABLE}',
            ],
        },
    ],
};
