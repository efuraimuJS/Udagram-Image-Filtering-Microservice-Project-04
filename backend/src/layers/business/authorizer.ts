import 'source-map-support/register';
import { decode, verify } from 'jsonwebtoken';
import * as createHttpError from 'http-errors';

import { Jwt } from '../../utils/auth/Jwt';
import { getRS256Certificate } from '../ports/Auth0/authorizer';

/**
 * Get the authorization token from request headers.
 * @param authHeader Request authorization header.
 * @returns The auth token if present in headers.
 */
export function getAuthToken(authHeader: string) {
    // No auth headers
    if (!authHeader) {
        throw new createHttpError.Unauthorized('No authentication header');
    }
    // Retrieve the token itself - "Bearer {{token}}"
    const token = authHeader.split(' ')[1];
    // Check if the token was sent with the proper format
    if (!authHeader.toLocaleLowerCase().startsWith('bearer ') || !token) {
        throw new createHttpError.Unauthorized('Malformed token.');
    }
    // Return the auth token
    return token;
}

/**
 * Decode the Auth0 token.
 * @param authToken Authorization token.
 * @returns The decoded auth0 token in case it's valid.
 */
export function decodeToken(authToken: string): Jwt {
    return decode(authToken, { complete: true }) as Jwt;
}

/**
 * Verify and decode the Auth0 authorization token if it's valid.
 * @param token The authorization token from request headers.
 * @param rsaCertificate The RSA certificate used to sign the token.
 * @returns The verified and decoded token.
 */
function verifyRSAToken(token: string, rsaCertificate: string) {
    try {
        return verify(token, rsaCertificate, { algorithms: ['RS256'], complete: true }) as Jwt;
    } catch (error) {
        // Invalid token
        throw new createHttpError.Unauthorized('Invalid token.');
    }
}

/**
 * Decode and validate the authorization token from request headers.
 * @param authHeader Authorization header.
 * @returns The decoded token.
 */
export async function validateAuthToken(authHeader: string) {
    // Retrieve the auth token
    const token = getAuthToken(authHeader);
    // Decode the auth token
    const decodedToken = decodeToken(token);
    // Get the RS256 signing certificate from Auth0
    const rsaCertificate = await getRS256Certificate(decodedToken.header.kid);
    // Validate and return the auth token
    return verifyRSAToken(token, rsaCertificate);
}
