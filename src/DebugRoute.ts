import type { MSGraphClient } from "./GraphClient";
import type express from "express";
import type { ChainedTokenCredential } from "@azure/identity"

export class DebugRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private roleScopeTag: String | undefined;
    private graphClient: MSGraphClient;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: MSGraphClient, credential: Promise<ChainedTokenCredential>) {
        // Initialize the environmental variable list
        this.roleScopeTag = process.env.Scope_Tag
        
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

        // Configure the role scope tag endpoint to return the configured role scope tag
        this.webServer.get('/getRoleScopeTag', async (request, response) => {
            if (typeof this.roleScopeTag === "undefined") {
                // Notify the calling app that the role scope tag is not defined in the env vars.
                response.send("The role scope tag variable is not defined!");
            } else {
                // Get all role scope tags in Microsoft Endpoint Manager (Intune)
                response.send(await this.graphClient.getEndpointScopeTag(this.roleScopeTag));
            }
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/listRoleScopeTag', async (request, response) => {
            response.send(await this.graphClient.listEndpointScopeTag());
        });

        // List the Microsoft Endpoint manager device configurations
        this.webServer.get('/listDeviceConfiguration', async (request, response) => {
            response.send(await this.graphClient.listDeviceConfig());
        })
    }
}