import type { MSGraphClient } from "./GraphClient";
import type express from "express";
import type { ChainedTokenCredential } from "@azure/identity"

export class DebugRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: MSGraphClient;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: MSGraphClient, credential: Promise<ChainedTokenCredential>) {
        
        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Initialize the routes
        this.init(credential);
    }

    // Initialize the routes
    private init(azureAuthSession: Promise<ChainedTokenCredential>) {
        // List access token to manually web request as the app
        this.webServer.get('/accessToken', async (request, response) => {
            try {
                // grab a token and extract its value
                const token = await (await azureAuthSession).getToken("https://graph.microsoft.com/.default");

                // Validate that the token has value
                if (token !== null) {
                    // If it does, send its value as a response
                    response.send(token);
                    // If it does not
                } else {
                    // Send a notice to the caller stating that it does not have value.
                    response.send("no token data received")
                };
            } catch (error) {
                response.send(error);
            }
        });

        // Send all environmental vars
        this.webServer.get('/envVar', (request, response) => {
            response.send(process.env)
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/roleScopeTag', async (request, response) => {
            response.send(await this.graphClient.getEndpointScopeTag());
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/roleScopeTag/:id', async (request, response) => {
            // Parse the parameter with the Number parser.
            const parseID = Number(request.params.id);

            // Check to make sure that the Number Parser was able to complete successfully.
            if (Object.is(parseID, NaN)) {
                // If the Parser failed, send a notice to the caller.
                response.send("Please send a valid ID for the Role Scope Tag!")
            } else {
                // Otherwise use the graph client to query the Scope Tag
                response.send(await this.graphClient.getEndpointScopeTag(parseID));
            };
        });

        // List the Microsoft Endpoint manager device configurations
    }
}