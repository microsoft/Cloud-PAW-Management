import { Client, ClientOptions } from "@microsoft/microsoft-graph-client";
import type { ChainedTokenCredential } from "@azure/identity"
import { GraphClientAuthProvider } from "./Authentication";
import "isomorphic-fetch";

// Define the Graph Client class.
export class MSGraphClient {
    private configurationList: Array<any> = [];
    private credential: ChainedTokenCredential;
    private client: Client;

    // Define the initialization of the class
    constructor(credential: ChainedTokenCredential) {
        this.credential = credential
        this.client = this.init();
    }

    // Define the login command that returns a connected instance of the Graph client
    private init(): Client {
        // Instantiate the access token interpreter
        const graphAuthProvider = new GraphClientAuthProvider(this.credential);

        // Configure teh initialization system to use the custom graph auth provider
        const clientOptions: ClientOptions = {
            // Configure the auth provider property to be the value of the graph auth constant
            authProvider: graphAuthProvider
        };

        // Connect the graph client to the graph
        return Client.initWithMiddleware(clientOptions);
    }

    // Todo: Build the code that retrieves the list of device configurations
    // retrieve a list of all device configurations that are accessible to the app
    getDeviceConfigList() {
        // const deviceConfig = instance.api("/deviceManagement/deviceConfigurations").get()
    }

    // Todo: write the code that builds a new login restriction configuration
    newInteractiveLoginConfiguration() {}

    // Todo: Write the code that updates existing login restriction configurations
    updateInteractiveLoginConfiguration() {}

    // Todo: Write the code that removes login restriction configurations
    removeInteractiveLoginConfiguration() {}
}