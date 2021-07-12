import type { MSGraphClient } from "./GraphClient";
import { EndpointPAWUserRightsSettings } from "./RequestGenerator";
import { validateEmailArray, validateGUID, validateStringArray } from "./Utility";
import type express from "express";
import type { ChainedTokenCredential } from "@azure/identity"
import { response } from "express";

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
        this.webServer.get('/accessToken', async (request, response, next) => {
            // Catch execution errors
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
                    response.send("No token data received")
                };
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Send all environmental vars
        this.webServer.get('/envVar', (request, response) => {
            response.send(process.env)
        });

        // Validate post body data is being received properly
        this.webServer.post('/testPost', async (request, response) => {
            // Send the body back as a response
            response.send(request.body);
        })

        // Create a new role scope tag in Endpoint Manager
        this.webServer.post('/roleScopeTag', async (request, response, next) => {
            // Catch execution errors
            try {
                // Use the graph client to create a new role scope tag.
                response.send(await this.graphClient.newEndpointScopeTag(request.body.name, request.body.description));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/roleScopeTag', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get all role scope tags
                response.send(await this.graphClient.getEndpointScopeTag());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/roleScopeTag/:id', async (request, response, next) => {
            // Catch execution errors
            try {
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
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Update the specified role scope tag
        this.webServer.patch('/roleScopeTag/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Parse the parameter with the Number parser.
                const parseID = Number(request.params.id);

                // Check to make sure that the Number Parser was able to complete successfully.
                if (Object.is(parseID, NaN)) {
                    // If the Parser failed, send a notice to the caller.
                    response.send("Please send a valid ID for the Role Scope Tag!")
                } else {
                    // Update the specified role scope tag with the provided values
                    response.send(await this.graphClient.updateEndpointScopeTag(parseID, request.body.name, request.body.description));
                };
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified role scope tag from Endpoint Manager
        this.webServer.delete('/roleScopeTag/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Parse the parameter with the Number parser.
                const parseID = Number(request.params.id);

                // Check to make sure that the Number Parser was able to complete successfully.
                if (Object.is(parseID, NaN)) {
                    // If the Parser failed, send a notice to the caller.
                    response.send("Please send a valid ID for the Role Scope Tag!")
                } else {
                    // Otherwise use the graph client to query the Scope Tag
                    response.send(await this.graphClient.removeEndpointScopeTag(parseID));
                };
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List the Microsoft Endpoint manager device configurations
        this.webServer.get('/deviceConfiguration', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get all device configs in Endpoint Manager
                response.send(await this.graphClient.getDeviceConfig());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get a specific Device Configuration based on its GUID
        this.webServer.get('/deviceConfiguration/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get a specific device config based on its unique GUID
                response.send(await this.graphClient.getDeviceConfig(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List the Device Group Policy Configurations
        this.webServer.get('/deviceGroupPolicyConfiguration', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get all Group Policy Configs in Endpoint Manager
                response.send(await this.graphClient.getDeviceGroupPolicyConfig());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get a specific Device Group Policy Configuration based on its GUID
        this.webServer.get('/deviceGroupPolicyConfiguration/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // get a specific group policy config based on its unique GUID
                response.send(await this.graphClient.getDeviceGroupPolicyConfig(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List all groups in AAD
        this.webServer.get('/group', async (request, response, next) => {
            // Catch execution errors
            try {
                // List all groups in AAD
                response.send(await this.graphClient.getAADGroup());;
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get a specific group in AAD based on its GUID
        this.webServer.get('/group/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // get the specified group by its unique GUID
                response.send(await this.graphClient.getAADGroup(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Create a new group
        this.webServer.post('/group', async (request, response, next) => {
            // Catch execution errors
            try {
                // Have the Graph API delete the specified group GUID and send the response to the caller
                response.send(await this.graphClient.newAADGroup(request.body.name, request.body.description, request.body.roleAssignable));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

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
                response.send(await this.graphClient.removeAADGroup(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List all users in AAD
        this.webServer.get('/user', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get all users
                response.send(await this.graphClient.getAADUser());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get a specific user in AAD based on their GUID or UPN
        this.webServer.get('/user/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get a specific user by their GUID or UPN
                response.send(await this.graphClient.getAADUser(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List all Administrative Units in AAD
        this.webServer.get('/adminUnit', async (request, response, next) => {
            // Catch execution errors
            try {
                // List all AAD Administrative Units
                response.send(await this.graphClient.getAADAdminUnit());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get a specific Administrative Unit in AAD based on the GUID
        this.webServer.get('/adminUnit/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get a specific Administrative unit by its GUID
                response.send(await this.graphClient.getAADAdminUnit(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified AU based on its GUID
        this.webServer.delete('/adminUnit/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Delete the specified AU from AAD
                response.send(await this.graphClient.removeAADAdminUnit(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        })

        // TODO: rewrite the update method to use the new validators, generators and graph client method
        // Generate an example settings catalog with the specified name, description, and scope tag
        this.webServer.post('/settingsCatalog', async (request, response, next) => {
            // Catch execution errors
            try {
                // Validate input
                if (!validateStringArray(request.body.userNames)) {response.send("Please send a valid array usernames!")};
                
                // Build the settings
                const settings = EndpointPAWUserRightsSettings(request.body.userNames);

                // Create the specified settings catalog
                response.send(await this.graphClient.newSettingsCatalog(request.body.name, request.body.description, request.body.id, settings));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List all settings catalogs
        this.webServer.get('/settingsCatalog', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get all settings catalogs from Endpoint manager
                response.send(await this.graphClient.getSettingsCatalog());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get a specific settings catalog based on the GUID
        this.webServer.get('/settingsCatalog/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get a specific settings catalog from Endpoint manager
                response.send(await this.graphClient.getSettingsCatalog(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Updated the specified settings catalog in Endpoint Manager
        // when this route is executed against a GUID, all current settings are replaced with the specified data.
        // This is not an update command, this is a replace command in reality.
        this.webServer.patch('/settingsCatalog/:id', async (request, response, next) => {
            // Validate input
            if (!validateGUID(request.params.id)) {response.send("Please specify a valid GUID!")};
            if (!validateStringArray(request.body.userNames)) {response.send("Please send a valid array usernames!")};

            // Build the settings
            const settings = EndpointPAWUserRightsSettings(request.body.userNames);

            // Catch execution errors
            try {               
                // Update the specified settings catalog
                const results = await this.graphClient.updateSettingsCatalog(request.params.id, request.body.name, request.body.description, request.body.id, settings);
                if (results) {
                    // Since the update settings catalog command does not return any value,
                    // use the get method to retrieve a complete copy of the current settings
                    response.send(await this.graphClient.getSettingsCatalog(request.params.id));
                } else {
                    // Send a "what the..."
                    response.send("I am not sure how we got here... (patch settings catalog: " +request.params.id + ")");
                }
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified settings catalog based on the GUID
        this.webServer.delete('/settingsCatalog/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Call the deletion passing the specified GUID
                response.send(await this.graphClient.removeSettingsCatalog(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        })
    }
}