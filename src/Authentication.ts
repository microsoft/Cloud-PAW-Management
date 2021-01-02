import { ClientSecretCredential, ManagedIdentityCredential, ChainedTokenCredential } from "@azure/identity"
import { SecretClient } from "@azure/keyvault-secrets";
import { validateGUID } from "./Utility";
import type { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
import type { KeyVaultSecret } from "@azure/keyvault-secrets";

// Create the MS Azure Access Credential handler class.
export class MSAzureAccessCredential {
    // Define the class properties
    credential: Promise<ChainedTokenCredential>;
    private clientSecretCred: ClientSecretCredential | undefined;
    private managedIdentCred: ManagedIdentityCredential;
    private clientID: string
    private clientSecret: string | Promise<KeyVaultSecret> | undefined
    private tenantID: string
    private managedIdentGUID: string
    private keyVaultName: string | undefined
    private kvSecretName: string | undefined

    // todo: write docs and validate, add key vault
    constructor() {
        // Import environmental variables
        this.clientID = process.env.Client_GUID || "None"
        this.clientSecret = process.env.Client_Secret
        this.tenantID = process.env.Tenant_ID || "None"
        this.managedIdentGUID = process.env.Managed_ID_GUID || "None"
        this.keyVaultName = process.env.KeyVault_Name
        this.kvSecretName = process.env.KeyVault_Secret

        // Validate environmental variable input to ensure that the input is as expected and not an injection attempt.
        if (!validateGUID(this.clientID)) { throw new Error("Client ID is not configured properly!") };
        if (typeof this.clientSecret !== "undefined" && typeof this.keyVaultName !== "undefined") { throw new Error("You should not specify a app secret if you are using a key vault to store the secret. This is a security risk!") };
        if (typeof this.clientSecret === "undefined" && typeof this.keyVaultName === "undefined") { throw new Error("You must specify either a Key Vault name (preferred) and Key Vault secret name, or set a app registration secret to authenticate to the MS graph"); }
        if (!validateGUID(this.tenantID)) { throw new Error("Tenant ID is not configured properly!") };
        if (!validateGUID(this.managedIdentGUID) && this.managedIdentGUID !== "None") { throw new Error("The user assigned managed identity GUID is not a valid GUID!") };
        if (typeof this.keyVaultName !== "undefined" && typeof this.kvSecretName === "undefined") { throw new Error("If you specify a Key Vault name, you need to specify the name of a secret in the key vault"); }

        // Validate if a GUID is provided for a user assigned managed identity
        if (typeof this.managedIdentGUID !== "undefined" && validateGUID(this.managedIdentGUID)) {
            // Initialize the managed identity credential object for user assigned managed identity.
            this.managedIdentCred = new ManagedIdentityCredential(this.managedIdentGUID)
        } else {
            // Initialize the managed identity credential object for system assigned managed identity.
            this.managedIdentCred = new ManagedIdentityCredential();
        }

        // if a KeyVault is specified, grab the client ID secret.
        if (typeof this.keyVaultName !== "undefined") {
            // Validate that the key vault secret is specified and halt execution if it is not.
            if (typeof this.kvSecretName === "undefined") { throw new Error("If you configure a key vault name, you need to specify a secret."); }

            // Build the URL of the key vault
            const kvURL = "https://" + this.keyVaultName + ".vault.azure.net";

            // Instantiate the key vault client
            const kvSecretClient = new SecretClient(kvURL, this.managedIdentCred);

            // Start the KV secret retrieval process
            this.clientSecret = kvSecretClient.getSecret(this.kvSecretName);

            // async execute the credential setting process using the key vault
            this.credential = this.setKvBasedCredential()

            // If it is not being initialized by key vault, just chain the stuff and return the required promise.
        } else {
            // Validate that the client secret is not undefined.
            if (typeof this.clientSecret === "undefined") { throw new Error("The client secret is undefined at chaining time. I do not know how this happened. Non KV chain.") };

            // Initialize an app registration credential object with the specified options
            this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, this.clientSecret);

            // Chain the two credentials together to allow the automatic flow of authentication during token consumption
            this.credential = Promise.resolve(new ChainedTokenCredential(this.clientSecretCred, this.managedIdentCred));
        };
    };

    // Define the async process to chain the credentials using a key vault stored secret instead of a secret stored in an env var.
    private async setKvBasedCredential() {
        // Validate the client secret is defined.
        if (typeof this.clientSecret === "undefined") { throw new Error("the client secret is not set, please check your configuration(s)!") };
        if (typeof this.clientSecret === "string") {
            // Initialize an app registration credential object with the specified options.
            this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, this.clientSecret);

            // Check if the client secret is a promise.
        } else if (typeof this.clientSecret.then === "function") {
            // if it is, await the value and capture it.
            const kvSecretValue = (await this.clientSecret).value;

            // If the value that is captured is not undefined, create the client secret credential object.
            if (typeof kvSecretValue !== "undefined") {
                // Create the client secret object and place it into the instantiated class' properties
                this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, kvSecretValue);

                // if the secret value is indeed undefined, throw an error.
            } else {
                // if it is undefined, throw an error.
                throw new Error("The secret value is undefined!");
            };
            // 
        } else if (typeof this.clientSecret !== "string") {
            // Pull the value from the key vault asynchronously
            const password = await (await this.clientSecret).value;

            // If the value is a string
            if (typeof password === "string") {
                // Initialize an app registration credential object with the specified options
                this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, password);

                // Throw an error if the value is not a string
            } else {
                throw new Error("No value was retrieved from the key vault!");
            };
        };

        // Validate that the client secret credential object has been created successfully
        if (typeof this.clientSecretCred === "undefined") { throw new Error("The client secret credential is undefined at token chaining step, not sure how this happened...") };

        // Chain the two credentials together to allow the automatic flow of authentication during token consumption
        return new ChainedTokenCredential(this.clientSecretCred, this.managedIdentCred);
    };
};

// Create an authentication provider to allow the MS Graph client to authenticate.
// This is done by converting the Azure-Identity Object into a raw string access token for the client.
export class GraphClientAuthProvider implements AuthenticationProvider {
    // define the credential property as the get access token method is not allowed to have parameters
    // data will have to be passed into it via property access instead of param access.
    // this property should be private as nobody needs to access the auth system besides the graph client.
    private credential: ChainedTokenCredential

    // Create the credential constructor
    constructor(AzureIdentityCredential: ChainedTokenCredential) {
        // Set the value of the credential property with the azure credential passed to it
        this.credential = AzureIdentityCredential;
    }

    // Implement the access token retrieval logic as required by the graph client custom auth provider.
    // This method must return an access token.
    public async getAccessToken(): Promise<string> {
        // Create a promise to process the retrieval of the access token
        const AccessToken: Promise<string> = new Promise((resolve, reject) => {
            // Retrieve the access token for the Microsoft Graph default scope (defined by the AAD app registration)
            this.credential.getToken("https://graph.microsoft.com/.default").then((token) => {
                // if no token is retrieved, reject the promise as it has failed.
                if (token === null) {
                    reject("No token retrieved")
                    // Otherwise resolve the promise with the raw token string
                } else {
                    resolve(token.token)
                }
                // catch any other uncaught errors
            }).catch((error) => {
                // reject the promise with the other uncaught error's data
                reject(error);
            });
        });

        // return the access token promise
        return AccessToken;
    }
}