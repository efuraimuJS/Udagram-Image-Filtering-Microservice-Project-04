// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '8o9pfam0v5'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-74ecthwq.us.auth0.com',            // Auth0 domain
  clientId: '77cvhweDBZ0HpsCo2aE0oKZSA6zte8zW',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
