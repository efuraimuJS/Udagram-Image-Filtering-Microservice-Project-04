/**
 * A JSON object that represents a set of JWKs (JSONs cryptographic
 * keys).
 */
export interface Jwks {
    keys: {
        alg: string;
        kty: string;
        use: string;
        n: string;
        e: string;
        kid: string;
        x5t: string;
        x5c: string[];
    }[];
}
