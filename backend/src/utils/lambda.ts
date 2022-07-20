import 'source-map-support/register';
import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import cors from '@middy/http-cors';

import { getUserID } from './middleware/userIDmiddleware';
import { errorMiddleware } from './middleware/error.middleware';

export const middyfy = (handler) => {
    return middy(handler)
        .use(middyJsonBodyParser())
        .use(getUserID())
        .use(cors({ credentials: true }))
        .use(errorMiddleware());
};

/**
 * Format the Lambda response with status code, headers and stringified JSON body.
 * @param statusCode The response status code.
 * @param response The response body.
 * @returns The formatted response.
 */
export const formatJSONResponse = (statusCode: number, response: Record<string, unknown>) => {
    return { statusCode: statusCode, body: JSON.stringify(response) };
};
