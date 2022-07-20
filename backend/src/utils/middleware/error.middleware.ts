import 'source-map-support/register';
import { formatJSONResponse } from '../lambda';
import { createLogger } from '../logger';

// Winston logger
const logger = createLogger('errorMiddleware');

/**
 * Middy custom error middleware to catch all errors in the chain.
 */
export const errorMiddleware = () => {
    return {
        onError: async (request: any) => {
            const statusCode = request.error.statusCode ? request.error.statusCode : 500;
            const message = request.error.message
                ? request.error.message
                : 'An unexpected error happened.';

            logger.error(message, { statusCode, error: message, request });

            request.response = formatJSONResponse(statusCode, { message });
        },
    };
};
