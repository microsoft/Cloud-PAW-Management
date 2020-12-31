import { ClientSecretCredential } from "@azure/identity"
import type { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
export class MSAzureAccessCredential {
    // strictly type the credential property
    credential: ClientSecretCredential

    // todo: write docs and validate, add managed identity support
    constructor(appRegID: string, appRegSecret: string, tenantID: string) {
        this.credential = new ClientSecretCredential(tenantID, appRegID, appRegSecret);
    };
};

export class GraphClientAuthProvider implements AuthenticationProvider {
    // define the credential property as the get access token method is not allowed to have parameters
    // data will have to be passed into it via property access instead of param access.
    // this property should be private as nobody needs to access the auth system besides the graph client.
    private credential: ClientSecretCredential

    // Create the credential constructor
    constructor(AzureIdentityCredential: ClientSecretCredential){
        // Set the value of the credential property with the azure credential passed to it
        this.credential = AzureIdentityCredential;
    }

    // Implement the access token retrieval logic as required by the graph client custom auth provider.
    // This method must return an access token.
	public async getAccessToken(): Promise<string> {
        // Create a promise to process the retrieval of the access token
        const AccessToken: Promise<string> = new Promise((resolve,reject)=> {
            // Retrieve the access token for the Microsoft Graph default scope (defined by the AAD app registration)
            this.credential.getToken("https://graph.microsoft.com/.default").then((token)=> {
                // if no token is retrieved, reject the promise as it has failed.
                if (token === null) {
                    reject("No token retrieved")
                // Otherwise resolve the promise with the raw token string
                } else {   
                    resolve(token.token)
                }
            // catch any other uncaught errors
            }).catch((error)=>{
                // reject the promise with the other uncaught error's data
                reject(error);
            });
        });

        // return the access token promise
        return AccessToken;
    }
}