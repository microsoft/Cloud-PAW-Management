import { Client, ClientOptions } from "@microsoft/microsoft-graph-client";
import type { ChainedTokenCredential } from "@azure/identity"
import { GraphClientAuthProvider } from "./Authentication";
import "isomorphic-fetch";

export class MSGraphClient {
    private configurationList: Array<any> = []

    // Define the login command that returns a connected instance of the Graph client
    login(credentials: ChainedTokenCredential): Client {
        // Instantiate the access token interpreter
        const graphAuthProvider = new GraphClientAuthProvider(credentials);

        // Configure teh initialization system to use the custom graph auth provider
        const clientOptions: ClientOptions = {
            // Configure the auth provider property to be the value of the graph auth constant
            authProvider: graphAuthProvider
        };

        // connect the graph client to the graph
        return Client.initWithMiddleware(clientOptions);
    }

    // retrieve a list of all device configurations that are accessible to the app
    getDeviceConfigList() {
        console.log(this.configurationList)
    }
}