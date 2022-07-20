# TODO APP Serverless Backend

An AWS Lambda Serverless backend API for the fourth project of Udacity Cloud Developer Nanodegree.

## Installation instructions

The APP is deployed in the cloud, but if you want to run it locally please follow the instructions below.

1. Requirements:

    - [Install Node.js](https://nodejs.org/en/) (tested with Node.Js 14);

2. In the project root folder, please run:

    - Download and install the required npm packages: `npm i`;
    - Install the DynamoDB locally: `serverless dynamodb install`;
    - Install the S3 Bucket plugin locally: `serverless plugin install --name serverless-s3-local`;

3. To start the local dev server, please run:

-   In root folder run: `npm run offline`

# Postman Collection

An alternative way to test the backend API without the client frontend is by using the Postman collection that contains sample requests.
You can find it in the [main project root](https://github.com/dtmarangoni/serverless-todo):

-   File named `Final Project.postman_collection.json`
-   Just import it in Postman application and start using the sample requests.

## Reference

This backend is based in the Udacity repository below. Please check it for more details.

-   [Serverless TODO APP Starter Code](https://github.com/udacity/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code)

## Learn More

You can learn more in the [Serverless Framework documentation](https://www.serverless.com/framework/docs/).
