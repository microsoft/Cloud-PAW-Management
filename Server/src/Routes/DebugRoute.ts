// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { AppGraphClient } from "../Utility/GraphClient";
import type { ConfigurationEngine } from "../Startup/ConfigEngine";
import { endpointPAWUserRightsSettings, conditionalAccessPAWUserAssignment, localGroupMembershipUserRights } from "../Utility/RequestGenerator";
import { validateGUID, validateGUIDArray, validateStringArray } from "../Utility/Validators";
import type express from "express";
import type { ChainedTokenCredential } from "@azure/identity"

export class DebugRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: AppGraphClient;
    private configEngine: ConfigurationEngine;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: AppGraphClient, configEngine: ConfigurationEngine, credential: Promise<ChainedTokenCredential>) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Make the configuration engine instance available to the class
        this.configEngine = configEngine;

        // Initialize the routes
        this.init(credential);
    }

    // Initialize the routes
    private init(azureAuthSession: Promise<ChainedTokenCredential>): void {
        // List access token to manually web request as the app
        this.webServer.get('/Debug/accessToken', async (request, response, next) => {
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
        this.webServer.get('/Debug/envVar', (request, response) => {
            response.send(process.env)
        });

        // Validate post body data is being received properly
        this.webServer.post('/Debug/testPost', async (request, response) => {
            // Send the body back as a response
            response.send(request.body);
        });

        // Create a new role scope tag in Endpoint Manager
        this.webServer.post('/Debug/roleScopeTag', async (request, response, next) => {
            // Catch execution errors
            try {
                // Use the graph client to create a new role scope tag.
                response.send(await this.graphClient.newMEMScopeTag(request.body.name, request.body.description));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/Debug/roleScopeTag', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the data back to the caller
                response.send(await this.graphClient.getMEMScopeTag());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Lists all of the role scope tags from Endpoint Manager
        this.webServer.get('/Debug/roleScopeTag/:name', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the data back to the caller
                response.send(await this.graphClient.getMEMScopeTag(request.params.name));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Update the specified role scope tag
        this.webServer.patch('/Debug/roleScopeTag/:name', async (request, response, next) => {
            // Catch execution errors
            try {
                // Validate that the description was provided
                if (typeof request.body.description === "undefined") { throw new Error("The description needs to be specified when updating a scope tag. An empty string will clear the description from the scope.") };

                // Update the scope tag
                if (typeof request.body.ID !== "undefined") {
                    response.send(await this.graphClient.updateMEMScopeTag(request.params.name, request.body.description, request.body.ID));
                } else {
                    response.send(await this.graphClient.updateMEMScopeTag(request.params.name, request.body.description));
                };

            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified role scope tag from Endpoint Manager
        this.webServer.delete('/Debug/roleScopeTag/:id', async (request, response, next) => {
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
                    response.send(await this.graphClient.removeMEMScopeTag(parseID));
                };
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Create a Windows 10 Custom Device string configuration
        this.webServer.post('/Debug/customStringDeviceConfiguration/', async (request, response, next) => {
            // Catch execution errors
            try {
                // Generate the oma settings
                const omaSettings = localGroupMembershipUserRights();

                // Create a new custom config
                response.send(await this.graphClient.newMEMCustomDeviceConfigString(request.body.name, request.body.description, request.body.tagId, [omaSettings]));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Update a Windows 10 Custom Device string configuration
        this.webServer.patch('/Debug/customStringDeviceConfiguration/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Generate the oma settings
                const omaSettings = localGroupMembershipUserRights();

                // Create a new custom config
                response.send(await this.graphClient.updateMEMCustomDeviceConfigString(request.params.id, request.body.name, request.body.description, request.body.tagId, [omaSettings]));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List the Microsoft Endpoint manager device configurations
        this.webServer.get('/Debug/deviceConfiguration', async (request, response, next) => {
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
        this.webServer.get('/Debug/deviceConfiguration/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get a specific device config based on its unique GUID
                response.send(await this.graphClient.getDeviceConfig(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified device configuration
        this.webServer.delete('/Debug/deviceConfiguration/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Describe the action
                response.send(await this.graphClient.removeDeviceConfig(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List the Device Group Policy Configurations
        this.webServer.get('/Debug/deviceGroupPolicyConfiguration', async (request, response, next) => {
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
        this.webServer.get('/Debug/deviceGroupPolicyConfiguration/:id', async (request, response, next) => {
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
        this.webServer.get('/Debug/group', async (request, response, next) => {
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
        this.webServer.get('/Debug/group/:id', async (request, response, next) => {
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
        this.webServer.post('/Debug/group', async (request, response, next) => {
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
        this.webServer.patch('/Debug/group/:id', async (request, response, next) => {
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
        this.webServer.delete('/Debug/group/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Have the Graph API delete the specified group GUID and send the response to the caller
                response.send(await this.graphClient.removeAADGroup(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Add a member to a AAD Group using GUIDs
        this.webServer.post('/Debug/groupMember/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the results of the operation back to the client
                response.send(await this.graphClient.newAADGroupMember(request.params.id, request.body.GUID, request.body.idDeviceId));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List the members of the specified group
        this.webServer.get('/Debug/groupMember/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the results of the operation back to the client
                response.send(await this.graphClient.getAADGroupMember(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List the members of the specified group
        this.webServer.get('/Debug/groupMember/:id/:type', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the results of the operation back to the client
                response.send(await this.graphClient.getAADGroupMember(request.params.id, request.params.type));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Remove the specified member from the specified AAD group
        this.webServer.delete('/Debug/groupMember/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the results of the operation back to the client
                response.send(await this.graphClient.removeAADGroupMember(request.params.id, request.body.GUID, request.body.idDeviceId));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List all users in AAD
        this.webServer.get('/Debug/user', async (request, response, next) => {
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
        this.webServer.get('/Debug/user/:id', async (request, response, next) => {
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
        this.webServer.get('/Debug/adminUnit', async (request, response, next) => {
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
        this.webServer.get('/Debug/adminUnit/:id', async (request, response, next) => {
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
        this.webServer.delete('/Debug/adminUnit/:id', async (request, response, next) => {
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
        this.webServer.post('/Debug/settingsCatalog', async (request, response, next) => {
            // Catch execution errors
            try {
                // Validate input
                if (!validateStringArray(request.body.userNames)) { response.send("Please send a valid array usernames!") };

                // Build the settings
                const settings = endpointPAWUserRightsSettings(request.body.userNames);

                // Create the specified settings catalog
                response.send(await this.graphClient.newSettingsCatalog(request.body.name, request.body.description, request.body.id, settings));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // List all settings catalogs
        this.webServer.get('/Debug/settingsCatalog', async (request, response, next) => {
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
        this.webServer.get('/Debug/settingsCatalog/:id', async (request, response, next) => {
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
        this.webServer.patch('/Debug/settingsCatalog/:id', async (request, response, next) => {
            // Validate input
            if (!validateGUID(request.params.id)) { response.send("Please specify a valid GUID!") };
            if (!validateStringArray(request.body.userNames)) { response.send("Please send a valid array usernames!") };

            // Build the settings
            const settings = endpointPAWUserRightsSettings(request.body.userNames);

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
                    response.send("I am not sure how we got here... (patch settings catalog: " + request.params.id + ")");
                }
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified settings catalog based on the GUID
        this.webServer.delete('/Debug/settingsCatalog/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Call the deletion passing the specified GUID
                response.send(await this.graphClient.removeSettingsCatalog(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Assign an endpoint manager device configuration
        this.webServer.post('/Debug/deviceConfigurationAssignment/:id', async (request, response, next) => {
            // Validate input
            if (typeof request.body.type !== "string" && request.body.type !== "Settings Catalog" && request.body.type !== "Setting Template" && request.body.type !== "Admin Template") { response.send("Please specify a valid assignment type") };
            if (typeof request.body.includeGUID !== "undefined" && !validateGUIDArray(request.body.includeGUID)) { response.send("The specified array of included group GUIDs is not valid!") };
            if (typeof request.body.excludeGUID !== "undefined" && !validateGUIDArray(request.body.excludeGUID)) { response.send("The specified array of excluded group GUIDs is not valid!") };
            if (!validateGUID(request.params.id)) { response.send("Please specify a valid GUID!") };

            // Catch execution errors
            try {
                // execute the graph client to assign a device configuration in Endpoint Manager
                response.send(await this.graphClient.updateConfigurationAssignment(request.body.type, request.params.id, request.body.includeGUID, request.body.excludeGUID));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Create a Conditional Access Policy
        this.webServer.post('/Debug/conditionalAccess', async (request, response, next) => {
            // Catch execution errors
            try {
                // Build the settings object that will be used with the new AAD CA method.
                const settingsBody = conditionalAccessPAWUserAssignment(request.body.deviceID, request.body.deviceGroupGUID, request.body.userGroupGUID, request.body.breakGlass);

                // Send the results of the creation operation
                response.send(await this.graphClient.newAadCaPolicy(request.body.name, settingsBody, "disabled"));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        })

        // Get all Conditional Access Policies
        this.webServer.get('/Debug/conditionalAccess', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the response back to the CX with the data
                response.send(await this.graphClient.getAadCaPolicy());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get the specified Conditional Access Policy based on GUID
        this.webServer.get('/Debug/conditionalAccess/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the response back to the CX with the data
                response.send(await this.graphClient.getAadCaPolicy(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Update the specified (already existing) Conditional Access Policy
        this.webServer.patch('/Debug/conditionalAccess/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Build the settings object that will be used with the update AAD CA method.
                const settingsBody = conditionalAccessPAWUserAssignment(request.body.deviceID, request.body.deviceGroupGUID, request.body.userGroupGUID, request.body.breakGlass);

                // Send the results of the update operation
                response.send(await this.graphClient.updateAadCaPolicy(request.params.id, request.body.name, settingsBody, "disabled"));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Delete the specified Conditional Access Policy based on its GUID.
        this.webServer.delete('/Debug/conditionalAccess/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the data back via the response
                response.send(await this.graphClient.removeAadCaPolicy(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get all devices from Microsoft Endpoint Manager.
        this.webServer.get('/Debug/memDevice', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the execution results to the client
                response.send(await this.graphClient.getMEMDevice());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get the specified device from Microsoft Endpoint Manager by using its AAD Device ID.
        this.webServer.get('/Debug/memDevice/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the execution results to the client
                response.send(await this.graphClient.getMEMDevice(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get all devices from Azure Active Directory.
        this.webServer.get('/Debug/device', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the execution results to the client
                response.send(await this.graphClient.getAADDevice());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get the specified device from Azure Active Directory by using its Device ID.
        this.webServer.get('/Debug/device/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the execution results to the client
                response.send(await this.graphClient.getAADDevice(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Edit the Extension Attribute 1 of the specified device
        this.webServer.patch('/Debug/deviceExtensionAttribute/:objectID', async (request, response, next) => {
            // Catch execution errors
            try {
                // Update the extension attribute of the specified device
                response.send(await this.graphClient.updateAADDeviceExtensionAttribute(request.params.objectID, request.body.value));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get all Autopilot devices from Microsoft Endpoint Manager.
        this.webServer.get('/Debug/autopilotDevice', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the execution results to the client
                response.send(await this.graphClient.getAutopilotDevice());
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Get the specified Autopilot device from Microsoft Endpoint Manager by using its AAD Device ID.
        this.webServer.get('/Debug/autopilotDevice/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the execution results to the client
                response.send(await this.graphClient.getAutopilotDevice(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Wipe the specified device using Endpoint Manager
        this.webServer.post('/Debug/wipeDevice/:id', async (request, response, next) => {
            // Catch execution errors
            try {
                // Send the data back to the caller
                response.send(await this.graphClient.wipeMEMDevice(request.params.id));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });

        // Return the PAW's group config in a parsed format
        this.webServer.get('/Debug/configEngine/getPAWGroupConfig/:groupID', async (request, response, next) => {
            // Catch execution errors
            try {
                // Get the group's config, parse it and send it back to the client
                response.send(await this.configEngine.getPAWGroupConfig(request.params.groupID));
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        })
    };
};