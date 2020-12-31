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