import type { AWS } from '@serverless/typescript';

import {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    generateUploadUrl,
} from './src/lambda/http/index';
import { authorizer } from './src/lambda/auth/index';

const serverlessConfiguration: AWS = {
    service: 'serverless-todo',
    frameworkVersion: '2',
    package: { individually: true },
    plugins: [
        'serverless-webpack',
        'serverless-iam-roles-per-function',
        'serverless-pseudo-parameters',
        'serverless-s3-remover',
        'serverless-offline',
        'serverless-dynamodb-local',
        'serverless-s3-local',
    ],
    provider: {
        name: 'aws',
        region: 'us-east-1',
        runtime: 'nodejs14.x',
        stage: "${opt:stage, 'dev'}",
        tracing: { apiGateway: true, lambda: true },
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            TODO_TABLE: 'Todo-${self:provider.stage}',
            TODO_INDEX: 'TodoIndex',
            IMAGES_S3_BUCKET: 'serverless-dtm-todo-images-${self:provider.stage}',
            S3_SIGNED_URL_EXP: '300',
        },
        lambdaHashingVersion: '20201221',
    },
    custom: {
        webpack: { webpackConfig: './webpack.config.js', includeModules: true },
        remover: { buckets: ['${self:provider.environment.IMAGES_S3_BUCKET}'] },
        'serverless-iam-roles-per-function': { defaultInherit: true },
        'serverless-offline': { httpPort: 4000 },
        dynamodb: {
            stages: ['${self:provider.stage}'],
            start: { port: 5000, inMemory: true, migrate: true, seed: true },
            seed: {
                todo: {
                    sources: [
                        {
                            table: '${self:provider.environment.TODO_TABLE}',
                            sources: ['./mock/dbSeed/todoSeed.json'],
                        },
                    ],
                },
            },
        },
        s3: { port: 6000 },
    },
    functions: { authorizer, getTodos, createTodo, updateTodo, deleteTodo, generateUploadUrl },
    resources: {
        Resources: {
            TodoDynamoDBTable: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    TableName: '${self:provider.environment.TODO_TABLE}',
                    AttributeDefinitions: [
                        { AttributeName: 'userId', AttributeType: 'S' },
                        { AttributeName: 'todoId', AttributeType: 'S' },
                        { AttributeName: 'dueDate', AttributeType: 'S' },
                    ],
                    KeySchema: [
                        { AttributeName: 'userId', KeyType: 'HASH' },
                        { AttributeName: 'todoId', KeyType: 'RANGE' },
                    ],
                    LocalSecondaryIndexes: [
                        {
                            IndexName: '${self:provider.environment.TODO_INDEX}',
                            KeySchema: [
                                { AttributeName: 'userId', KeyType: 'HASH' },
                                { AttributeName: 'dueDate', KeyType: 'RANGE' },
                            ],
                            Projection: { ProjectionType: 'ALL' },
                        },
                    ],
                    BillingMode: 'PAY_PER_REQUEST',
                },
            },
            ImagesS3Bucket: {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: '${self:provider.environment.IMAGES_S3_BUCKET}',
                    CorsConfiguration: {
                        CorsRules: [
                            {
                                AllowedOrigins: ['*'],
                                AllowedHeaders: ['*'],
                                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                                MaxAge: 3000,
                            },
                        ],
                    },
                },
            },
            ImagesS3BucketPolicy: {
                Type: 'AWS::S3::BucketPolicy',
                Properties: {
                    Bucket: { Ref: 'ImagesS3Bucket' },
                    PolicyDocument: {
                        Id: 'ImagesS3BucketPolicy',
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: 'PublicReadForGetBucketObjects',
                                Effect: 'Allow',
                                Principal: '*',
                                Action: 'S3:GetObject',
                                Resource:
                                    'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*',
                            },
                        ],
                    },
                },
            },
            APIGatewayResponseDefault4xx: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseType: 'DEFAULT_4XX',
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers':
                            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
                    },
                    RestApiId: { Ref: 'ApiGatewayRestApi' },
                },
            },
        },
    },
};

module.exports = serverlessConfiguration;
