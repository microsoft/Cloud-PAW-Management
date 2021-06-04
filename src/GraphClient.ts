import { GraphClientAuthProvider } from "./Authentication";
import { Client, ClientOptions, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import type * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";
import type { ChainedTokenCredential } from "@azure/identity"

// Define the Graph Client class.
export class MSGraphClient {
    private client: Promise<Client>;

    // Define the initialization of the class
    constructor(credential: Promise<ChainedTokenCredential>) {
        // Create an instance of the graph client and expose it internally.
        // The credentials are passed as a parameter as to not expose them to other methods internal to this class.
        this.client = this.init(credential);
    }

    // Define the login command that returns a connected instance of the Graph client
    private async init(credential: Promise<ChainedTokenCredential>): Promise<Client> {
        // Instantiate the access token interpreter
        const graphAuthProvider = new GraphClientAuthProvider(await credential);

        // Configure teh initialization system to use the custom graph auth provider
        const clientOptions: ClientOptions = {
            // Configure the auth provider property to be the value of the graph auth constant
            authProvider: graphAuthProvider
        };

        // Connect the graph client to the graph
        return Client.initWithMiddleware(clientOptions);
    };

    // make a page iterator so that pages of data will automatically be all of the data
    private async iteratePage(graphResponse: PageCollection): Promise<any[]> {
        try {
            // Initialize the collection that will be returned after iteration.
            let collection: Array<any> = [];
            
            // Initialize the iterator to use the existing graph connection and the current response that may need iterated on.
            const pageIterator = new PageIterator(await this.client, graphResponse, (data) => {
                // Add data gathered from the iterator to the collection
                collection.push(data);

                // Continue iteration (true means continue, false means pause iteration).
                return true;
            });

            // Start the iteration process and wait for completion of the operation.
            await pageIterator.iterate();

            // Return the collection to the caller
            return collection;
        } catch (error) {
            // if there is an error, tell us about it...
            throw new Error("Page iterator breakdown :(");
        };
    };

    // Return the instance of the specified scope tag
    async getEndpointScopeTag(scopeTagName: String): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Error check environmental variables to ensure that the app is configured properly
        if (typeof scopeTagName === "undefined") { throw new Error("The scope tag name is not defined, please specify the name of the scope tag to query.") };

        // Define the regex to find the input characters that could be used to break out of the query.
        const regexQuote = /'+/gi;
        const regexBackSlash = /\\+/gi;

        // Find and escape potentially malicious characters before it is sent to the query
        let sanitizedTagName: String = scopeTagName.replace(regexQuote,"\\'");
        sanitizedTagName = sanitizedTagName.replace(regexBackSlash, "\\\\");

        // Retrieve a list of Scope Tags from Endpoint Manager
        const tagList: PageCollection = await (await this.client).api("/deviceManagement/roleScopeTags").version("beta").filter("displayName eq '" + scopeTagName + "'").get();

        // Extract the values from the returned list and type it for easier processing
        const tagListValue: Array<MicrosoftGraphBeta.RoleScopeTag> = await this.iteratePage(tagList);

        // Check to make sure that data was returned from the Graph API query
        if (tagListValue.length !== 0) {
            // loop through each of the items in the tag list array
            for (let index = 0; index < tagListValue.length; index++) {
                // Extract the current tag item from the tag list.
                const tag = tagListValue[index];

                // Since the display name is enforced to be unique, if a match is successful, return the results and stop processing.
                // Otherwise, continue checking for more matches down the line.
                if (tag.displayName == scopeTagName) {
                    // return the tag to the caller
                    return tag;
                }
            }
            // If no tag matched and terminated execution by calling the return key word, throw an error stating that there is no match.
            throw new Error("No matched tag!");
        } else {
            // If the undefined check failed and the value list is undefined, throw an error.
            throw new Error("No tag value returned from query :-/");
        }
    }

    // Todo: Build the code that retrieves the list of device configurations
    // retrieve a list of all device configurations that are accessible to the app
    getDeviceConfigList() {
        // const deviceConfig = await (await this.client).api("/deviceManagement/deviceConfigurations").get()
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