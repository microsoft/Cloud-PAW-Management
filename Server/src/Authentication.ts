import { ClientSecretCredential, ManagedIdentityCredential, ChainedTokenCredential } from "@azure/identity"
import { SecretClient } from "@azure/keyvault-secrets";
import { validateGUID } from "./Utility";
import type { KeyVaultSecret } from "@azure/keyvault-secrets";

// Create the MS Azure Access Credential handler class.
export class MSAzureAccessCredential {
    // Define the class properties
    credential: Promise<ChainedTokenCredential>;
    private clientSecretCred: ClientSecretCredential | undefined;
    private managedIdentCred: ManagedIdentityCredential;
    private clientID: string
    private clientSecret: string | Promise<KeyVaultSecret>
    private tenantID: string
    private managedIdentGUID: string
    private keyVaultName: string | undefined
    private kvSecretName: string | undefined

    // Initialize the Access Credential class when instantiated
    constructor() {
        // Import environmental variables
        this.clientID = process.env.Client_GUID || ""
        this.clientSecret = process.env.Client_Secret || ""
        this.tenantID = process.env.Tenant_ID || ""
        this.managedIdentGUID = process.env.Managed_ID_GUID || "None"
        this.keyVaultName = process.env.KeyVault_Name
        this.kvSecretName = process.env.KeyVault_Secret

        // Validate environmental variable input to ensure that the input is as expected and not an injection attempt.
        if (!validateGUID(this.clientID) && this.clientID !== "") { throw new Error("Client ID is not configured properly!") };
        if (this.clientSecret !== "" && typeof this.keyVaultName !== "undefined") { throw new Error("You should not specify a app secret if you are using a key vault to store the secret. This is a security risk!") };
        if (this.clientSecret === "" && typeof this.keyVaultName === "undefined") { throw new Error("You must specify either a Key Vault name (preferred) and Key Vault secret name, or set a app registration secret to authenticate to the MS graph"); }
        if (!validateGUID(this.tenantID) && this.tenantID !== "") { throw new Error("Tenant ID is not configured properly!") };
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

            // Chain the two credentials together to allow the automatic flow of authentication during token consumption
            this.credential = this.getKvChainedCred();
                
            // If it is not being initialized by key vault, just chain the stuff and return the required promise.
        } else {
            // Validate that the client secret is not undefined.
            if (typeof this.clientSecret === "undefined") { throw new Error("The client secret is undefined at chaining time. Non KV chain.") };

            // Initialize an app registration credential object with the specified options
            this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, this.clientSecret);

            // Chain the two credentials together to allow the automatic flow of authentication during token consumption
            this.credential = Promise.resolve(new ChainedTokenCredential(this.clientSecretCred, this.managedIdentCred));
        };
    };

    // Define an asynchronous function that chains together a credential built from data in the key vault and managed identity.
    private async getKvChainedCred() {
        // Validate the client secret is defined correctly.
        if (this.clientSecret === "") {throw new Error("the client secret is not defined: kv chained cred")};
        if (typeof this.clientSecret === "string") {throw new Error("The client secret is manually configured: kv chained cred")};
                        
        // Isolate the value from the Key Vault secret
        const kvSecretValue = (await this.clientSecret).value

        // Validate that it contains data, if not, throw an error
        if (typeof kvSecretValue === "undefined") {throw new Error("KV secret value is undefined")};

        // Create the client secret object and place it into the instantiated class' properties
        this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, kvSecretValue);

        // Return a chained credential
        return new ChainedTokenCredential(this.clientSecretCred, this.managedIdentCred);
    }
};