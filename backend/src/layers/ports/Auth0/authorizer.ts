import 'source-map-support/register';
import { JwksClient } from 'jwks-rsa';
import * as createHttpError from 'http-errors';

// JSON web key set client
const jwksClient = new JwksClient({ jwksUri: '...YOUR AUTH0 JSON Web Key Set Endpoint...' });

/**
 * Get the Auth0 RS256 certificate used to sign JWTs.
 * @param jsonWebKeyId The JSON web key ID belonging to Auth0 key set.
 * @returns The RS256 signing certificate.
 */
export async function getRS256Certificate(jsonWebKeyId: string) {
    try {
        // Retrieve the JSON Web Key from Auth0 Key Set
        const jsonWebKey = await jwksClient.getSigningKey(jsonWebKeyId);
        // Return the RS256 certificate
        return jsonWebKey.getPublicKey();
    } catch (error) {
        throw new createHttpError.InternalServerError(
            `Not possible to retrieve Auth0 RS265 certificate: ${error.message}`
        );
    }
}
