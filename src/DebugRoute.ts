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

        // Validate post body data is being received properly
        this.webServer.post('/testPost', async (request, response, next) => {
            // Send the body back as a response
            response.send(request.body);
        })

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
        this.webServer.get('/deviceConfiguration', async (request, response) => {
            response.send(await this.graphClient.getDeviceConfig());
        });

        // Get a specific Device Configuration based on its GUID
        this.webServer.get('/deviceConfiguration/:id', async (request, response) => {
            response.send(await this.graphClient.getDeviceConfig(request.params.id));
        });

        // List the Device Group Policy Configurations
        this.webServer.get('/deviceGroupPolicyConfiguration', async (request, response) => {
            response.send(await this.graphClient.getDeviceGroupPolicyConfig());
        });

        // Get a specific Device Group Policy Configuration based on its GUID
        this.webServer.get('/deviceGroupPolicyConfiguration/:id', async (request, response) => {
            response.send(await this.graphClient.getDeviceGroupPolicyConfig(request.params.id));
        });

        // List all groups in AAD
        this.webServer.get('/group', async (request, response) => {
            response.send(await this.graphClient.getAADGroup());
        });

        // Get a specific group in AAD based on its GUID
        this.webServer.get('/group/:id', async (request, response) => {
            response.send(await this.graphClient.getAADGroup(request.params.id));
        });

        // Create a new group
        this.webServer.post('/group', async (request, response, next) => {
            response.send(await this.graphClient.newAADGroup(request.body.name, request.body.description, request.body.roleAssignable))

        // Update a group's settings
        this.webServer.patch('/group/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Update the specified group with the specified options
                response.send(await this.graphClient.updateAADGroup(request.params.id, request.body.name, request.body.description))
            } catch (error) {
                // Process the error if one happens
                next(error);
            }
        });

        // Delete the specified group
        this.webServer.delete('/group/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Have the Graph API delete the specified group GUID and send the response to the caller
                response.send(await this.graphClient.deleteAADGroup(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong.
                next(error)
            }
        })

        // List all users in AAD
        this.webServer.get('/user', async (request, response) => {
            response.send(await this.graphClient.getAADUser());
        });

        // Get a specific user in AAD based on their GUID or UPN
        this.webServer.get('/user/:id', async (request, response) => {
            response.send(await this.graphClient.getAADUser(request.params.id));
        });

        // List all Administrative Units in AAD
        this.webServer.get('/adminUnit', async (request, response) => {
            response.send(await this.graphClient.getAADAdminUnit());
        });

        // Get a specific Administrative Unit in AAD based on the GUID
        this.webServer.get('/adminUnit/:id', async (request, response) => {
            response.send(await this.graphClient.getAADAdminUnit(request.params.id));
        });
    }
}