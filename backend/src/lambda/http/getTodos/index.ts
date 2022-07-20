export const getTodos = {
    handler: `${__dirname
        .split(process.cwd())[1]
        .substring(1)
        .replace(/\\/g, '/')}/handler.getTodos`,
    events: [
        {
            http: {
                method: 'get',
                path: 'todos',
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
            Action: ['dynamoDB:Query'],
            Resource: [
                'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODO_TABLE}',
                'arn:aws:dynamodb:${self:provider.region}:#{AWS::AccountId}:table/${self:provider.environment.TODO_TABLE}/index/${self:provider.environment.TODO_INDEX}',
            ],
        },
    ],
};
