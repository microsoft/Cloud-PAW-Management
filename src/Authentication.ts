import { DefaultAzureCredential, DefaultAzureCredentialOptions } from "@azure/identity"

export class MSAzureAccessCredential {
    // strictly type the credential property
    credential: DefaultAzureCredential

    // Define the authentication logic class initialization, optionally taking a GUID that points to a user assigned managed identity
    constructor(userAssignedManagedIdentityID?: string) {
        // Check if a user assigned managed identity is specified
        if (userAssignedManagedIdentityID !== "none" && typeof userAssignedManagedIdentityID !== "undefined") {
            // if one is, build the configuration for the auto login to use it
            const credOptions: DefaultAzureCredentialOptions = {
                managedIdentityClientId: userAssignedManagedIdentityID
            };
            // log in with the user assigned managed identity 
            this.credential = new DefaultAzureCredential(credOptions);
            // Otherwise use the default configuration for system assigned identities
        } else {
            // auto log in with default configuration
            this.credential = new DefaultAzureCredential();
        };
    };
};