import { Client, ClientOptions } from "@microsoft/microsoft-graph-client";
import { GraphClientAuthProvider } from "./Authentication";
import "isomorphic-fetch";
import type * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";
import type { ChainedTokenCredential } from "@azure/identity"

// Define the Graph Client class.
export class MSGraphClient {
    private configurationList: Array<any> = [];
    private credential: Promise<ChainedTokenCredential>;
    private client: Promise<Client>;

    // Define the initialization of the class
    constructor(credential: Promise<ChainedTokenCredential>) {
        this.credential = credential
        this.client = this.init();
    }

    // Define the login command that returns a connected instance of the Graph client
    private async init(): Promise<Client> {
        // Instantiate the access token interpreter
        const graphAuthProvider = new GraphClientAuthProvider(await this.credential);

        // Configure teh initialization system to use the custom graph auth provider
        const clientOptions: ClientOptions = {
            // Configure the auth provider property to be the value of the graph auth constant
            authProvider: graphAuthProvider
        };

        // Connect the graph client to the graph
        return Client.initWithMiddleware(clientOptions);
    }

    // todo: add support for multiple pages of data (paging of results)
    // Return the instance of the specified scope tag
    async getEndpointScopeTag() {
        // Error check environmental variables to ensure that the app is configured properly
        if (typeof process.env.Scope_Tag === "undefined") {throw new Error("The scope tag configuration is not defined, please specify the name of the scope tag to use with this app.")};
        
        // Retrieve a list of Scope Tags from Endpoint Manager
        const tagList = await (await this.client).api("/deviceManagement/roleScopeTags").version("beta").get();
        
        // Extract the values from the returned list and type it for easier processing
        const tagListValue: Array<MicrosoftGraphBeta.RoleScopeTag> = tagList.value

        // Check to make sure that data was returned from the Graph API query
        if (typeof tagListValue !== "undefined") {
            // loop through each of the items in the tag list array
            for (let index = 0; index < tagListValue.length; index++) {
                // Extract the current tag item from the tag list.
                const tag = tagListValue[index];

                // Since the display name is enforced to be unique, if a match is successful, return the results and stop processing.
                // Otherwise, continue checking for more matches down the line.
                if (tag.displayName == process.env.Scope_Tag) {
                    // return the tag to the caller
                    return tag;
                }                
            }
            // If no tag matched and terminated execution by calling the return key word, throw an error stating that there is no match.
            throw new Error("no matched tag!");
        } else {
            // If the undefined check failed and the value list is undefined, throw an error.
            throw new Error("No tag values returned from query :-/");
        }
    }

    // Todo: Build the code that retrieves the list of device configurations
    // retrieve a list of all device configurations that are accessible to the app
    getDeviceConfigList() {
        // const deviceConfig = instance.api("/deviceManagement/deviceConfigurations").get()
    }

    // Todo: write the code that builds a new login restriction configuration
    newInteractiveLoginConfiguration() { }

    // Todo: Write the code that updates existing login restriction configurations
    updateInteractiveLoginConfiguration() { }

    // Todo: Write the code that removes login restriction configurations
    removeInteractiveLoginConfiguration() { }

    listEndpointScope() { }
    newEndpointScope() { }
    getAADUserList() { }
    getAADGroupList() { }
    newAADGroup() { }

}