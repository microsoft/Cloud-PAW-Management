// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ChainedTokenCredential, ClientSecretCredential, ManagedIdentityCredential } from "@azure/identity";
import type { KeyVaultSecret } from "@azure/keyvault-secrets";
import { SecretClient } from "@azure/keyvault-secrets";
import { validateGUID, validateKeyVaultName, validateKeyVaultSecretName, InternalAppError, writeDebugInfo } from "../Utility";

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
    private keyVaultName: string
    private kvSecretName: string
    private kvCloudSelection: string

    // Initialize the Access Credential class when instantiated
    constructor() {
        // Set keyvault to operate off teh Azure Public Cloud by default.
        this.kvCloudSelection = ".vault.azure.net"

        // Import environmental variables
        this.managedIdentGUID = process.env.PSM_Managed_ID_GUID || ""
        this.keyVaultName = process.env.PSM_KeyVault_Name || ""
        this.kvSecretName = process.env.PSM_KeyVault_Secret || ""
        this.clientID = process.env.PSM_Client_GUID || ""
        this.clientSecret = process.env.PSM_Client_Secret || ""
        this.tenantID = process.env.PSM_Tenant_ID || ""

        // Validate environmental variable input to ensure that the input is as expected and not an injection attempt.
        if (this.managedIdentGUID !== "" && !validateGUID(this.managedIdentGUID)) { throw new InternalAppError("The user assigned managed identity GUID is not a valid GUID!", "Invalid Input"); };
        if (this.keyVaultName !== "" && !validateKeyVaultName(this.keyVaultName)) { throw new InternalAppError("The key vault name must be a string and following naming constraints!", "Invalid Input", "Authentication - Constructor - Input Validation"); };
        if (this.kvSecretName !== "" && !validateKeyVaultSecretName(this.kvSecretName)) { throw new InternalAppError("The key vault secret name must be a string and following naming constraints!", "Invalid Input", "Authentication - Constructor - Input Validation"); };
        if (this.clientID !== "" && !validateGUID(this.clientID)) { throw new InternalAppError("The Client ID was specified but it isn't a string in the GUID format!", "Invalid Input", "Authentication - Constructor - Input Validation"); };
        if (this.clientSecret !== "" && typeof this.clientSecret !== "string") { throw new InternalAppError("The client secret was specified but isn't a string!", "Invalid Input", "Authentication - Constructor - Input Validation"); };
        if (this.tenantID !== "" && !validateGUID(this.tenantID)) { throw new InternalAppError("The Tenant ID was specified but it isn't a string in the GUID format!", "Invalid Input", "Authentication - Constructor - Input Validation"); };

        // Validate if a GUID is provided for a user assigned managed identity
        if (this.managedIdentGUID !== "") {
            // Write debug info
            writeDebugInfo("Initializing UA MI Credential");

            // Initialize the managed identity credential object for user assigned managed identity.
            this.managedIdentCred = new ManagedIdentityCredential(this.managedIdentGUID);
        } else {
            // Write debug info
            writeDebugInfo("Initializing SA MI Credential");

            // Initialize the managed identity credential object for system assigned managed identity.
            this.managedIdentCred = new ManagedIdentityCredential();
        };

        // Write debug info
        writeDebugInfo("Managed Identity Credential Initialization Complete");

        // Check if the keyvault name was specified
        if (this.keyVaultName !== "" || this.kvSecretName !== "") {
            // Validate that all of the properties are in the correct configuration.
            if (this.keyVaultName === "" || this.kvSecretName === "" || this.tenantID === "" || this.clientID === "" || this.clientSecret !== "") { throw new InternalAppError("The required configurations aren't present, please double check your MI KV based auth config.", "Invalid Config", "Authentication - MI KV App Reg - Config Validation"); };

            // Build the URL of the key vault
            const kvURL = "https://" + this.keyVaultName + this.kvCloudSelection;

            // Instantiate the key vault client
            const kvSecretClient = new SecretClient(kvURL, this.managedIdentCred);

            // Start the KV secret retrieval process
            this.clientSecret = kvSecretClient.getSecret(this.kvSecretName);

            // Build the chained token credential
            this.credential = this.getKvChainedCred();
        } else if (this.clientID !== "" || this.clientSecret !== "" || this.tenantID !== "") { // If no KV, then check for App Reg Auth
            // Validate that all of the properties are in the correct configuration.
            if (this.tenantID === "" || this.clientID === "" || this.clientSecret === "") { throw new InternalAppError("The required configurations aren't present, please double check your app reg based auth config.", "Invalid Config", "Authentication - App Reg/Local Vars - Config Validation"); };

            // Build a client secret credential
            this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, this.clientSecret);

            // Build the chained token credential
            this.credential = Promise.resolve(new ChainedTokenCredential(this.clientSecretCred));
        } else { // Just Managed identity auth here
            // Build the chained token credential 
            this.credential = Promise.resolve(new ChainedTokenCredential(this.managedIdentCred));
        };
    };

    // Define an asynchronous function that chains together a credential built from data in the key vault and managed identity.
    private async getKvChainedCred() {
        // Validate the client secret is defined correctly.
        if (typeof this.clientSecret === "string") { throw new InternalAppError("The client secret should not be manually set for key vault based auth!", "Invalid Input", "Authentication - getKvChainedCred - Input Validation"); };
        if (typeof this.clientSecret.then !== "function" || typeof this.clientSecret.catch !== "function") { throw new InternalAppError("The client secret should be Promise, the specified object is not a promise!", "Invalid Input", "Authentication - getKvChainedCred - Input Validation"); };

        // Isolate the value from the Key Vault secret
        const kvSecretValue = (await this.clientSecret).value

        // Validate that it contains data, if not, throw an error
        if (kvSecretValue === undefined) { throw new InternalAppError("KV secret value is undefined", "Invalid Input", "Authentication - getKvChainedCred - Secret value validation") };

        // Create the client secret object and place it into the instantiated class' properties
        this.clientSecretCred = new ClientSecretCredential(this.tenantID, this.clientID, kvSecretValue);

        // Return a chained credential
        return new ChainedTokenCredential(this.clientSecretCred);
    };
};