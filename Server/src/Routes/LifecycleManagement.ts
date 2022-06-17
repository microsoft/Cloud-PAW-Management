// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";
import type express from "express";
import type { ConfigurationEngine } from "../Startup/ConfigEngine";
import type { AppGraphClient, IDeviceGroupConfig, IDeviceObject } from "../Utility";
import { endpointPAWUserRightsSettings, InternalAppError, localGroupMembershipUserRights, validateEmailArray, validateGUID, writeDebugInfo } from "../Utility";

export class LifecycleRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: AppGraphClient;
    private configEngine: ConfigurationEngine;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: AppGraphClient, configEngine: ConfigurationEngine) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Make the config engine instance available to the class
        this.configEngine = configEngine;

        // Initialize the routes
        this.initRoutes();
    };

    // Initialize the REST API routes
    private initRoutes(): void {
        // Get all autopilot devices
        this.webServer.get('/API/Lifecycle/AutopilotDevice', async (request, response, next) => {
            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Catch execution errors
            try {
                // Send the result of the get operation back to the caller
                response.send(await this.graphClient.getAutopilotDevice());
            } catch (error) { // On error, process known errors or send back a generic error statement that isn't user editable
                // Check if the error is known
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Set the response code of 400 to indicate a bad request
                        response.statusCode = 400;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else if (error.name === "Misconfigured Structure") {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // Send a generic error to the next middleware in the line for processing
                        next("An error was thrown and handled internally, operation failed. Please see server console for more info.");
                    };
                } else { // The error is unknown, treat it as such
                    // Write debug info
                    writeDebugInfo(error, "Error details:");

                    // Send a generic error to the next middleware in the line for processing
                    next("There was an error retrieving all of the Autopilot devices.");
                };
            };
        });

        // List all Commissioned PAW Devices
        this.webServer.get('/API/Lifecycle/PAW', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(this.configEngine.configInitialized, "Config initialization status:");
            writeDebugInfo(this.configEngine.config, "Config data:");

            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Ensure that the config is initialized before executing the PAW Group recurse command
            if (this.configEngine.configInitialized && typeof this.configEngine.config !== "undefined") {
                try {
                    // Retrieve a list of all PAWs starting at the root PAW group
                    const PAWList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

                    // Send the PAW list back to the client
                    response.send(PAWList);
                } catch (error) { // TODO Better error handling
                    // Write debug info
                    writeDebugInfo(error, "List PAW Devices error:");

                    // Send a hard coded response
                    next("An error occurred while retrieving the PAW list.");
                }
            } else { // Configuration is not initialized
                // Send the response notifying the client as such
                response.send("Config is not initialized!");
            };
        });

        // Commissions an Autopilot device as a PAW device based on its AAD Device ID
        this.webServer.post('/API/Lifecycle/PAW/:deviceID/Commission', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(request.params.deviceID, "Commission PAW - Device ID URL Param:");
            writeDebugInfo(request.body, "Commission PAW - Body of the XHR:");

            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Catch execution errors
            try {
                // Send the PAW Object of the commission operation back to the caller as a sign of successful execution
                response.send(await this.commissionPAW(request.params.deviceID, request.body.type));
            } catch (error) { // On error, process known errors or send back a generic error statement that isn't user editable
                // Check if the error is known
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Set the response code of 400 to indicate a bad request
                        response.statusCode = 400;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else if (error.name === "Misconfigured Structure") {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // Send a generic error to the next middleware in the line for processing
                        next("An error was thrown and handled internally, operation failed. Please see server console for more info.");
                    };
                } else { // The error is unknown, treat it as such
                    // Send a generic error to the next middleware in the line for processing
                    next("There was an error commissioning the specified autopilot device as a PAW");
                };
            };
        });

        // Decommissions the PAW into a normal enterprise device
        this.webServer.delete('/API/Lifecycle/PAW/:deviceID/Commission', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(request.params.deviceID, "Decommission PAW - Device ID URL Param:");

            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Catch execution errors
            try {
                // Send the boolean result of the decommission operation back to the caller as a sign of successful execution
                response.send(await this.decommissionPAW(request.params.deviceID));
            } catch (error) { // On error, process known errors or send back a generic error statement that isn't user editable
                // Check if the error is known
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Set the response code of 400 to indicate a bad request
                        response.statusCode = 400;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else if (error.name === "Misconfigured Structure") {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // Send a generic error to the next middleware in the line for processing
                        next("An error was thrown and handled internally, operation failed. Please see server console for more info.");
                    };
                } else { // The error is unknown, treat it as such
                    // Send a generic error to the next middleware in the line for processing
                    next("There was an error commissioning the specified autopilot device as a PAW");
                };
            };
        });

        // Get user assignments for the specified PAW
        this.webServer.get('/API/Lifecycle/PAW/:deviceID/Assign', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(request.params.deviceID, "Get PAW Assignment - Device ID URL Param:");

            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Catch execution errors
            try {
                // Send the result of the assign operation back to the caller
                response.send(await this.getPawAssignment(request.params.deviceID));
            } catch (error) { // On error, process known errors or send back a generic error statement that isn't user editable
                // Check if the error is known
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Set the response code of 400 to indicate a bad request
                        response.statusCode = 400;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else if (error.name === "Misconfigured Structure") {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // Send a generic error to the next middleware in the line for processing
                        next("An error was thrown and handled internally, operation failed. Please see server console for more info.");
                    };
                } else { // The error is unknown, treat it as such
                    // Write debug info
                    writeDebugInfo(error, "Error details:");

                    // Send a generic error to the next middleware in the line for processing
                    next("There was an error assigning the specified user list to the specified PAW");
                };
            };
        });

        // Assign a PAW to a user or set of users
        this.webServer.post('/API/Lifecycle/PAW/:deviceID/Assign', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(request.params.deviceID, "Assign PAW - Device ID URL Param:");

            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Catch execution errors
            try {
                // Send the result of the assign operation back to the caller
                response.send(await this.assignPAW(request.params.deviceID, request.body.userList));
            } catch (error) { // On error, process known errors or send back a generic error statement that isn't user editable
                // Check if the error is known
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Set the response code of 400 to indicate a bad request
                        response.statusCode = 400;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else if (error.name === "Misconfigured Structure") {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // Send a generic error to the next middleware in the line for processing
                        next("An error was thrown and handled internally, operation failed. Please see server console for more info.");
                    };
                } else { // The error is unknown, treat it as such
                    // Write debug info
                    writeDebugInfo(error, "Error details:");

                    // Send a generic error to the next middleware in the line for processing
                    next("There was an error assigning the specified user list to the specified PAW");
                };
            };
        });

        // Remove an assignment of a principal or set of principals from a PAW.
        // If no user assignments are left, a wipe command is issued to prepare it for the next user(s).
        this.webServer.delete('/API/Lifecycle/PAW/:deviceID/Assign', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(request.params.deviceID, "Remove PAW Assignment - Device ID URL Param:");

            // If the app is starting, send a notice to the client stating that
            if (this.configEngine.startup) {
                // Set the HTTP status code to indicate app start up faze
                response.statusCode = 520;

                // Send the response to the caller
                response.send("App is starting still");
            };
            // TODO: Add the ability to detect if the infra is not deployed and respond with a 525.

            // Catch execution errors
            try {
                // Send the result of the assign operation back to the caller
                response.send(await this.unassignPAW(request.params.deviceID, request.body.userList));
            } catch (error) { // On error, process known errors or send back a generic error statement that isn't user editable
                // Check if the error is known
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Set the response code of 400 to indicate a bad request
                        response.statusCode = 400;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else if (error.name === "Misconfigured Structure") {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // All internal app errors are hard coded, no tricky business here from the end user :)
                        next(error.message);
                    } else {
                        // Set the response code of 500 to indicate an internal error
                        response.statusCode = 500;

                        // Send a generic error to the next middleware in the line for processing
                        next("An error was thrown and handled internally, operation failed. Please see server console for more info.");
                    };
                } else { // The error is unknown, treat it as such
                    // Write debug info
                    writeDebugInfo(error, "Error details:");

                    // Send a generic error to the next middleware in the line for processing
                    next("There was an error assigning the specified user list to the specified PAW");
                };
            };
        });
    };

    // TODO: Add child support
    // Recurse through the specified PAW group and return an array of PAW device config objects
    private async recursePAWGroup(groupID: string): Promise<IDeviceObject[]> {
        // Validate input
        if (!validateGUID(groupID)) { throw new InternalAppError("The specified GUID is not a GUID!", "Invalid Input", "LifeCycleManagement - LifeCycleRouter - recursePAWGroup - Input Validation"); }

        // Initialize variable namespaces
        let groupMemberList: MicrosoftGraphBeta.Group[];
        let deviceMemberList: MicrosoftGraphBeta.Device[];
        let processedMembers: IDeviceObject[] = [];

        // Catch Execution errors on member list retrieval
        try {
            // Get a list of all group and device members of the specified PAW group
            groupMemberList = await this.graphClient.getAADGroupMember(groupID, "microsoft.graph.group");
            deviceMemberList = await this.graphClient.getAADGroupMember(groupID, "microsoft.graph.device");
        } catch (error) { // In the case of a retrieval error
            // Throw an error
            throw new InternalAppError("Unable to retrieve membership of the specified group", "Unknown", "LifeCycleManagement - LifeCycleRouter - recursePAWGroup - Input Validation");
        };

        // Validate that there is not more than one PAW in the specified group
        if (deviceMemberList.length > 1) {
            // Throw an error
            throw new InternalAppError("Too Many PAWs in the SG!", "Misconfigured Structure", "LifecycleManagement - LifeCycleRouter - recursePAWGroup - Validate group's PAW membership count");
        } else if (deviceMemberList.length === 1) { // If there is a PAW in the group, add it to the member list
            // Ensure that the ID Property of the device is present
            if (typeof deviceMemberList[0].deviceId === "undefined" || deviceMemberList[0].deviceId === null) {
                // Throw an error
                throw new InternalAppError("PAW ID is undefined!", "No Data", "LifecycleManagement - LifeCycleRouter - recursePAWGroup - Validate device ID presence");
            };

            // Check to make sure that the name data is present for the retrieved device.
            if (typeof deviceMemberList[0].displayName === "undefined" || deviceMemberList[0].displayName == null) {
                // Throw an error
                throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - AAD Device Object Validation");
            };

            // Parse the group's description
            const parsedDescription = await this.configEngine.getPAWGroupConfig(groupID);

            // Compile the data into a PAW object
            const pawObject: IDeviceObject = {
                "id": deviceMemberList[0].deviceId,
                "DisplayName": deviceMemberList[0].displayName,
                "ParentGroup": groupID,
                "CommissionedDate": parsedDescription.CommissionedDate,
                "GroupAssignment": parsedDescription.GroupAssignment,
                "Type": parsedDescription.Type,
                "UserAssignment": parsedDescription.UserAssignment
            };

            // Add the processed PAW object to the processed members list
            processedMembers = processedMembers.concat([pawObject]);
        };

        // Iterate through all of the members in the group's member list
        for (const group of groupMemberList) {

            // Ensure that the ID and the description is present, and if not, execute
            if (typeof group.id !== "string" || typeof group.description !== "string") {
                // skip processing the round of the loop and process the next round of the loop
                continue;
            };

            // Recurse the method on itself with the new Group ID to get any sub groups
            const recurseResults = await this.recursePAWGroup(group.id);

            // Add the processed PAW object to the processed members list
            processedMembers = processedMembers.concat(recurseResults);
        };

        // Return the processed data
        return processedMembers;
    };

    // TODO: Add child support
    // Commission the specified PAW with no user(s)
    private async commissionPAW(deviceID: string, type?: string): Promise<IDeviceObject> {
        // Validate Input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The specified Device ID is not a valid device ID!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Input Validation"); };

        // Initialize the variables that are locally scoped so that they are available for execution
        let devGroup: MicrosoftGraphBeta.Group;
        let rootGroupMemberResult: boolean;
        let devGroupMemberResult: boolean;
        let deviceObject: MicrosoftGraphBeta.Device;
        let pawType: "Privileged" | "Developer" | "Tactical";

        // If the type param is not specified, default it to standard PAW.
        if (typeof type !== "string") {
            // Set the PAW type to be used
            pawType = "Privileged";
        } else if (type === "Privileged" || type === "Developer" || type == "Tactical") {
            // Set the PAW type to be used
            pawType = type;
        } else { // a string was specified but it doesn't match the expected types allowed
            // Throw an error
            throw new InternalAppError("The type parameter is not a valid value", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Input Validation");
        };

        // Ensure that the config engine is initialized
        if (!this.configEngine.configInitialized || this.configEngine.config === undefined) {
            // Throw an error
            throw new InternalAppError("Config engine is not initialized", "Not Initialized", "LifecycleManagement - LifecycleRouter - commissionPAW - Input Validation");
        };

        // Initialize vars
        let pawList: IDeviceObject[];
        let userAssignmentConfig: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy;
        let localGroupsConfig: MicrosoftGraphBeta.Windows10CustomConfiguration;

        // Grab the specified device's autopilot instance
        const deviceAutopilot = await this.graphClient.getAutopilotDevice(deviceID);

        // Check to see if the device is autopilot enabled, 0 means that the ID is not present and therefor not autopilot enabled
        if (deviceAutopilot.length == 0) {
            // Throw an error
            throw new InternalAppError("Device is not autopilot enabled!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Autopilot Status not present");
        } else if (deviceAutopilot.length > 1) {// if there is more than one autopilot device for the AAD device id, throw an error
            // Throw an error
            throw new InternalAppError("More than one autopilot device returned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Autopilot Status too many");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Starting PAW recurse on the root group");

            // Get the list of PAWs
            pawList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

            // Write debug info
            writeDebugInfo(pawList, "Completed retrieving the list of PAW devices:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Error getting PAW Devices", "Unknown Error", "LifecycleManagement - LifecycleRouter - commissionPAW - Get PAW Devices");
            };
        };

        // Write debug info
        writeDebugInfo("Completed PAW recurse on the root group");

        // Check for an existing PAW
        const existingPAW = pawList.some((paw) => { return paw.id == deviceID });

        // Write debug info
        writeDebugInfo(existingPAW, "Existing PAW?");

        // If a PAW already exists, stop execution
        if (existingPAW) {
            // Throw an error
            throw new InternalAppError("PAW is already commissioned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Commission Status");
        };

        // Ensure that the serial number is present on the autopilot device instance by checking the absence of the serial number and throwing an error if missing
        if (typeof deviceAutopilot[0].serialNumber !== "string") {
            // Throw an error
            throw new InternalAppError("Data Missing from the serial number property!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - Serial Number Null Check");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Updating ExtensionAttribute1 of the Device");

            // Set the device extension attribute 1 value to "PAW" on the PAW device
            await this.graphClient.updateAADDeviceExtensionAttribute(deviceID, "PAW");

            // Write debug info
            writeDebugInfo(deviceID, "Completed update of ExtensionAttribute1 for device:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Error setting Extension Attribute", "Unknown Error", "LifecycleManagement - LifecycleRouter - commissionPAW - Add Extension Attribute");
            };
        };

        // Write debug info
        writeDebugInfo("Generating user rights post body");

        // Make the defaultuser0 assignment object so that the PAW can complete Autopilot even if the device isn't assigned
        const userAssignmentSettings = endpointPAWUserRightsSettings(["defaultuser0"]);

        // Write debug info
        writeDebugInfo("Completed generating user rights post body");

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Creating settings catalog");

            // Create the user assignment settings catalog.
            userAssignmentConfig = await this.graphClient.newSettingsCatalog("PAW - Login - " + deviceID, "Allow only the specified users to log in.", [this.configEngine.config.ScopeTagID], userAssignmentSettings);

            // Write debug info
            writeDebugInfo(userAssignmentConfig.id, "Created settings catalog:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error when creating the settings catalog!", "Unknown Error", "LifecycleManagement - LifecycleRouter - commissionPAW - Create User Assignment Config");
            };
        };

        // Check that all the expected data is present from the Graph API call
        if (typeof userAssignmentConfig.id !== "string") {
            // Throw an error
            throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - User Assignment Settings Catalog ID Null Check");
        };

        // Generate the OMA Settings object
        const omaSettings = localGroupMembershipUserRights();

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Creating custom settings config");

            // Create the local users and groups custom OMA setting.
            localGroupsConfig = await this.graphClient.newMEMCustomDeviceConfigString("PAW - Groups - " + deviceID, "Restrict Admins and Hyper-V admin group memberships.", [this.configEngine.config.ScopeTagID], [omaSettings]);

            // Write debug info
            writeDebugInfo(localGroupsConfig.id, "Created custom settings config:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error when creating the custom settings config!", "Unknown Error", "LifecycleManagement - LifecycleRouter - commissionPAW - Create Custom Settings Config");
            };
        };

        // Check that all the expected data is present from the Graph API call
        if (typeof localGroupsConfig.id !== "string") {
            // Throw an error
            throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - Local Group Config ID Null Check");
        };

        // Collect all the data in one place for the PAW Device Group description
        const devGroupDescription: IDeviceGroupConfig = {
            "CommissionedDate": new Date(),
            "Type": pawType,
            "UserAssignment": userAssignmentConfig.id,
            "GroupAssignment": localGroupsConfig.id
        };

        // Generate the description string to be use for the PAW's device group
        const groupDescription = "CommissionedDate=" + devGroupDescription.CommissionedDate.toJSON() + ",Type=" + devGroupDescription.Type + ",UserAssignment=" + devGroupDescription.UserAssignment + ",GroupAssignment=" + devGroupDescription.GroupAssignment;

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Creating device's unique group");

            // Create the device group
            devGroup = await this.graphClient.newAADGroup("PAW - " + deviceID, groupDescription);

            // Write debug info
            writeDebugInfo(devGroup.id, "Created device's unique group:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error on AAD Group creation!", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Device Group Creation");
            };
        };

        // Check to ensure that complete data was returned.
        if (typeof devGroup.id !== "string") {
            // Throw an error
            throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - Device Group ID Null Check");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo(devGroup.id, "Starting assignment of user rights to:");

            // Assign the user rights configuration to the device security group
            await this.graphClient.updateConfigurationAssignment("Settings Catalog", userAssignmentConfig.id, [devGroup.id], [this.configEngine.config.BrkGls]);

            // Write debug info
            writeDebugInfo(devGroup.id, "Completed assignment of user rights to:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error on assignment of settings catalog", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Settings Catalog Assignment");
            };
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo(devGroup.id, "Starting assignment of group management to:");

            // Assign the user rights configuration to the device security group
            await this.graphClient.updateConfigurationAssignment("Setting Template", localGroupsConfig.id, [devGroup.id], [this.configEngine.config.BrkGls]);

            // Write debug info
            writeDebugInfo(devGroup.id, "Completed assignment of group management to:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Settings Catalog Assignment");
            };
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo(devGroup.id, "Adding PAW (" + deviceID + ") to its exclusive SG:");

            // Add the PAW device to the PAW SG
            await this.graphClient.newAADGroupMember(devGroup.id, deviceID, true);

            // Write debug info
            writeDebugInfo(devGroup.id, "Completed membership addition of PAW (" + deviceID + ") to its exclusive SG:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Add Dev to Dev Grp");
            };
        };

        // Catch execution errors
        try {
            // Add the newly created PAW device group to the PAW root group
            await this.graphClient.newAADGroupMember(this.configEngine.config.PAWSecGrp, devGroup.id);
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Add Dev Grp to PAW Root Grp");
            };
        };

        // Catch execution errors
        try {
            // Get the device object from AAD
            deviceObject = (await this.graphClient.getAADDevice(deviceID))[0];
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Get AAD Device Object");
            };
        };

        // Check to make sure that the name data is present for the retrieved device.
        if (deviceObject.displayName === undefined || deviceObject.displayName == null) {
            // Throw an error
            throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - AAD Device Object Validation");
        };

        // Build the object that will be returned on successful execution.
        const returnObject: IDeviceObject = {
            "id": deviceID,
            "DisplayName": deviceObject.displayName,
            "ParentGroup": devGroup.id,
            "CommissionedDate": devGroupDescription.CommissionedDate,
            "Type": devGroupDescription.Type,
            "UserAssignment": devGroupDescription.UserAssignment,
            "GroupAssignment": devGroupDescription.GroupAssignment
        };

        // Return the newly commissioned PAW object on successful operation
        return returnObject;
    };

    // Decommission the specified PAW
    private async decommissionPAW(deviceID: string): Promise<boolean> {
        // Validate input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The specified Device ID is not a valid device ID!", "Invalid Input", "LifecycleManagement - LifecycleRouter - decommissionPAW - Input Validation"); };

        // Ensure that the config engine is initialized
        if (!this.configEngine.configInitialized || this.configEngine.config === undefined) {
            // Throw an error
            throw new InternalAppError("Config engine is not initialized", "Not Initialized", "LifecycleManagement - LifecycleRouter - decommissionPAW - Input Validation");
        };

        // Write debug info
        writeDebugInfo("Getting PAW list");

        // Get the list of PAWs
        const pawList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

        // Write debug info
        writeDebugInfo(pawList, "Got PAW list:");

        // Recurse over the PAW List and pull out the specified PAW device instance
        const pawObject = pawList.find(paw => paw.id === deviceID);

        // Write debug info
        writeDebugInfo(pawObject, "PAW to decommission from list matched by ID:");

        // If the PAW Object var is undefined, then the find command didn't find any commissioned PAWs with the specified device ID
        if (pawObject === undefined) {
            // Throw an error
            throw new InternalAppError("PAW is not commissioned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - decommissionPAW - Validate PAW Commission Status");
        };

        // Loop through the PAWs and check for children PAWs
        for (const paw of pawList) {
            // Check if the current PAW lists the PAW to be decommissioned as its parent
            if (paw.ParentDevice === deviceID) { // If it does list it
                // Write debug info
                writeDebugInfo(paw.id, "Found child PAW, recursing function against child:");

                // Decommission the child PAW
                await this.decommissionPAW(paw.id);
            };
        };

        // Write debug info
        writeDebugInfo(pawObject.id, "Starting extension attribute removal against:");

        // Remove the PAW's extension attribute
        await this.graphClient.updateAADDeviceExtensionAttribute(pawObject.id);

        // Write debug info
        writeDebugInfo(pawObject.id, "Finished extension attribute removal against:");

        // Write debug info
        writeDebugInfo(pawObject.ParentGroup, "Starting SG removal:");

        // Remove the PAW's unique device group
        await this.graphClient.removeAADGroup(pawObject.ParentGroup);

        // Write debug info
        writeDebugInfo(pawObject.ParentGroup, "Finished SG removal:");

        // Write debug info
        writeDebugInfo(pawObject.UserAssignment, "Starting settings catalog removal:");

        // Remove the PAW's user rights assignment
        await this.graphClient.removeSettingsCatalog(pawObject.UserAssignment);

        // Write debug info
        writeDebugInfo(pawObject.UserAssignment, "Finished settings catalog removal:");

        // Write debug info
        writeDebugInfo(pawObject.GroupAssignment, "Starting groups config removal:");

        // Remove the PAW's user rights assignment
        await this.graphClient.removeDeviceConfig(pawObject.GroupAssignment);

        // Write debug info
        writeDebugInfo(pawObject.GroupAssignment, "Finished groups config removal:");

        // Write debug info
        writeDebugInfo(pawObject.id, "Sending wipe device command:");

        // Catch execution errors
        try {
            // Wipe the device after decommission
            await this.graphClient.wipeMEMDevice(pawObject.id);

            // Write debug info
            writeDebugInfo(pawObject.id, "Sent wipe device command:");
        } catch (error) {
            // If the error is unknown device, ignore it, otherwise bubble it up
            if (error instanceof InternalAppError && error.message === "The specified device does not exist" && error.name === "Retrieval Error") {
                // Write debug info
                writeDebugInfo("This is ok as it indicates the device was never booted.", "Skipped sending wipe command as device was not present in MEM.");

                // Do nothing because this is ok, it means the device hasn't booted up and registered into Endpoint Manager yet.
            } else {
                // Write debug info
                writeDebugInfo(error, "Unexpected exception during decommission:");

                // Throw an error
                throw new InternalAppError("An unknown error occurred, please see console for details", "Unknown Error", "LifecycleManagement - LifecycleRouter - decommissionPAW - Input Validation");
            };
        };

        // Return true for a successful operation
        return true;
    };

    // Assign the specified user(s) to a device, if replacing assignment, wipes if no user overlap.
    private async assignPAW(deviceID: string, upnList: string[]): Promise<MicrosoftGraphBeta.User[]> {
        // Validate Input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The specified Device ID is not valid!", "Invalid Input", "LifecycleManagement - LifecycleRouter - assignPAW - Input Validation"); };
        if (!validateEmailArray(upnList)) { throw new InternalAppError("The UPN list is not valid!", "Invalid Input", "LifecycleManagement - LifecycleRouter - assignPAW - Input Validation"); };

        // Ensure that the config engine is initialized
        if (!this.configEngine.configInitialized || this.configEngine.config === undefined) {
            // Throw an error
            throw new InternalAppError("Config engine is not initialized", "Not Initialized", "LifecycleManagement - LifecycleRouter - assignPAW - Input Validation");
        };

        // Initialize variable
        let oldUpnList: string[] = [];
        let pawList: IDeviceObject[];
        let assignmentCatalog: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy;

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Starting PAW recurse on the root group");

            // Get the list of PAWs
            pawList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

            // Write debug info
            writeDebugInfo(deviceID, "Completed update of ExtensionAttribute1 for device:");
        } catch (error) {
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Error getting PAW Devices", "Unknown Error", "LifecycleManagement - LifecycleRouter - assignPAW - Get PAW Devices");
            };
        };

        // Loop through the PAW list and grab the first PAW whose ID matches the specified device ID
        const pawDevice = pawList.find((paw) => { return paw.id === deviceID });

        // Check if the PAW object isn't found
        if (typeof pawDevice !== "object") {
            // Throw an error
            throw new InternalAppError("PAW is not commissioned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Commission Status");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Grabbing the user assignment data.");

            // Get the assignment settings
            assignmentCatalog = (await this.graphClient.getSettingsCatalog(pawDevice.UserAssignment))[0];

            // Write debug info
            writeDebugInfo(assignmentCatalog, "Completed retrieval of the user assignment data:");
        } catch (error) {
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Error the assignment catalog", "Unknown Error", "LifecycleManagement - LifecycleRouter - assignPAW - Get Assignment Catalog");
            };
        };

        // Check to make sure that the
        if (assignmentCatalog.settings === null || assignmentCatalog.settings === undefined || typeof assignmentCatalog.settings[0].settingInstance === "undefined") {
            // Throw an error
            throw new InternalAppError("Data from the settings catalog is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - assignPAW - assignment catalog data check.");
        };

        // Extract the settings node and assign it a different type of typescript compatibility.
        const extractedSettings: MicrosoftGraphBeta.DeviceManagementConfigurationSimpleSettingCollectionInstance = assignmentCatalog.settings[0].settingInstance;

        // Validate that is present
        if (extractedSettings.simpleSettingCollectionValue === undefined) {
            // Throw an error
            throw new InternalAppError("Data from the settings catalog's settings array is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - assignPAW - settings array data check.");
        };

        // Loop through all of the user assignment and extract them.
        for (const valueItem of extractedSettings.simpleSettingCollectionValue) {
            // Convert the type so that the typing is present for TypeScript
            const userAssignment: MicrosoftGraphBeta.DeviceManagementConfigurationStringSettingValue = valueItem;

            // Validate that is present
            if (userAssignment.value === undefined || userAssignment.value === null) {
                // Throw an error
                throw new InternalAppError("Data from the settings catalog's settings array's value is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - assignPAW - settings array value data check.");
            };

            // If the default user 0 user (OOBE User) is listed, ignore it and continue to the next loop iteration
            if (userAssignment.value === "defaultuser0") {
                // Skip this loop round
                continue;
            } else { // Is not the OOBE user
                // Extract the UPN from the value and add it to the old user list
                oldUpnList = [userAssignment.value.split("\\")[1], ...oldUpnList];
            };
        };

        // Write debug info
        writeDebugInfo(oldUpnList, "Currently Assigned Users:");

        // Loops through the upn lists and see if any are the same.
        // This is like a for of loop except it stops executing if a true is returned and it only returns a boolean.
        const userOverlap = upnList.some((newUPN) => {
            // Returns true if a upn matches the new upn provided with the current old upn.
            return oldUpnList.some((oldUPN) => {
                // Return true for a matched UPN.
                return oldUPN == newUPN;
            });
        });

        // Save a copy of the UPN List for the user enrichment later.
        const assignedUpnEnrichmentList = upnList;

        // Prefix the accounts with AzureAD so that they are compatible with the user rights assignment generator
        upnList = upnList.map(upn => "AzureAD\\" + upn);

        // Write debug info
        writeDebugInfo(userOverlap, "User overlap status:");

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Updating custom settings config");

            // Generate the OMA Settings object
            const omaSettings = localGroupMembershipUserRights(upnList);

            // Create the local users and groups custom OMA setting.
            await this.graphClient.updateMEMCustomDeviceConfigString(pawDevice.GroupAssignment, "PAW - Groups - " + deviceID, "Restrict Administrators and Hyper-V Admin group memberships.", [this.configEngine.config.ScopeTagID], [omaSettings]);

            // Write debug info
            writeDebugInfo("Updated custom settings config");
        } catch (error) {
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error on custom settings config update!", "Unknown Error", "LifecycleManagement - LifecycleRouter - assignPAW - Update Custom Settings Config");
            };
        };

        // Write debug info
        writeDebugInfo("Generating user rights post body");

        // Make the defaultuser0 assignment object so that the PAW can complete Autopilot even if the device isn't assigned
        const userAssignmentSettings = endpointPAWUserRightsSettings(["defaultuser0", ...upnList]);

        // Write debug info
        writeDebugInfo(userAssignmentSettings, "Completed generating user rights post body:");

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Updating settings catalog");

            // Create the user assignment settings catalog.
            const userAssignmentConfig = await this.graphClient.updateSettingsCatalog(pawDevice.UserAssignment, "PAW - Login - " + deviceID, "Allow only the specified users to log in.", [this.configEngine.config.ScopeTagID], userAssignmentSettings);

            // Write debug info
            writeDebugInfo(userAssignmentConfig, "Updated settings catalog:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unable to update the settings catalog!", "Unknown Error", "LifecycleManagement - LifecycleRouter - assignPAW - Update Settings Catalog");
            };
        };

        // If the users overlap, just update the current assignment
        if (userOverlap === true) {
            // Write debug info
            writeDebugInfo("Not wiping device as there is user overlap.");
        } else if (userOverlap === false && oldUpnList.length !== 0) { // Wipe the device if there is no user overlap
            // Catch execution errors
            try {
                // Wipe the device after if no user overlap is detected
                await this.graphClient.wipeMEMDevice(deviceID);

                // Write debug info
                writeDebugInfo(deviceID, "Sent wipe device command:");
            } catch (error) {
                // If the error is unknown device, ignore it, otherwise bubble it up
                if (error instanceof InternalAppError && error.message === "The specified device does not exist" && error.name === "Retrieval Error") {
                    // Write debug info
                    writeDebugInfo("This is ok as it indicates the device was never booted.", "Skipped sending wipe command as device was not present in MEM.");

                    // Do nothing because this is ok, it means the device hasn't booted up and registered into Endpoint Manager yet.
                } else {
                    // Write debug info
                    writeDebugInfo(error, "Unexpected exception during assignment:");

                    // Throw an error
                    throw new InternalAppError("An unknown error occurred, please see console for details", "Unknown Error", "LifecycleManagement - LifecycleRouter - assignPAW - Input Validation");
                };
            };
        } else {
            // Write debug info
            writeDebugInfo("Not wiping device as there are no users assigned.");
        };

        // Initialize the variable that will contained the enriched user(s)
        let upnResults: MicrosoftGraphBeta.User[] = [];

        // Loop through all of the UPNs and get user objects
        for (const upn of assignedUpnEnrichmentList) {
            // Catch execution errors
            try {
                // Get the specified UPN and add it to the list of assigned UPNs
                upnResults = [(await this.graphClient.getAADUser(upn))[0], ...upnResults];
            } catch (error) { // If an error happens
                // Check if error is internal and pass it directly if it is.
                if (error instanceof InternalAppError) {
                    // Send the current error instance up since it is an internal error.
                    throw error;
                } else {
                    // Throw an error
                    throw new InternalAppError("Unable to retrieve user", "Unknown Error", "LifecycleManagement - LifecycleRouter - assignPAW - User Enrichment");
                };
            };
        };

        // Return the list of users that are now assigned.
        return upnResults;
    };

    // Get the user assignment(s) of the specified PAW
    private async getPawAssignment(deviceID: string): Promise<MicrosoftGraphBeta.User[]> {
        // Validate Input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The specified Device ID is not valid!", "Invalid Input", "LifecycleManagement - LifecycleRouter - getPawAssignment - Input Validation"); };

        // Ensure that the config engine is initialized
        if (!this.configEngine.configInitialized || this.configEngine.config === undefined) {
            // Throw an error
            throw new InternalAppError("Config engine is not initialized", "Not Initialized", "LifecycleManagement - LifecycleRouter - getPawAssignment - Input Validation");
        };

        // Initialize Variables
        let assignedUpnList: string[] = [];
        let pawList: IDeviceObject[];
        let assignmentCatalog: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy;

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Starting PAW recurse on the root group");

            // Get the list of PAWs
            pawList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

            // Write debug info
            writeDebugInfo("Completed PAW recurse on the root group");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unable to get a list of PAW devices!", "Unknown Error", "LifecycleManagement - LifecycleRouter - getPawAssignment - Get PAW List");
            };
        };

        // Loop through the PAW list and grab the first PAW whose ID matches the specified device ID
        const pawDevice = pawList.find((paw) => { return paw.id === deviceID });

        // Check if the PAW object isn't found
        if (typeof pawDevice !== "object") {
            // Throw an error
            throw new InternalAppError("PAW is not commissioned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - getPawAssignment - Validate PAW Commission Status");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Grabbing the user assignment data.");

            // Get the assignment settings
            assignmentCatalog = (await this.graphClient.getSettingsCatalog(pawDevice.UserAssignment))[0];

            // Write debug info
            writeDebugInfo(assignmentCatalog, "Completed retrieval of the user assignment data:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unable to get the settings catalog due to an unknown error", "Unknown Error", "LifecycleManagement - LifecycleRouter - getPawAssignment - Get Settings Catalog");
            };
        };

        // Check to make sure that the
        if (assignmentCatalog.settings === null || assignmentCatalog.settings === undefined || typeof assignmentCatalog.settings[0].settingInstance === "undefined") {
            // Throw an error
            throw new InternalAppError("Data from the settings catalog is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - getPawAssignment - assignment catalog data check");
        };

        // Extract the settings node and assign it a different type of typescript compatibility.
        const extractedSettings: MicrosoftGraphBeta.DeviceManagementConfigurationSimpleSettingCollectionInstance = assignmentCatalog.settings[0].settingInstance;

        // Validate that is present
        if (extractedSettings.simpleSettingCollectionValue === undefined) {
            // Throw an error
            throw new InternalAppError("Data from the settings catalog's settings array is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - assignPAW - settings array data check.");
        };

        // Loop through all of the user assignment and extract them.
        for (const valueItem of extractedSettings.simpleSettingCollectionValue) {
            // Convert the type so that the typing is present for TypeScript
            const userAssignment: MicrosoftGraphBeta.DeviceManagementConfigurationStringSettingValue = valueItem;

            // Validate that is present
            if (userAssignment.value === undefined || userAssignment.value === null) {
                // Throw an error
                throw new InternalAppError("Data from the settings catalog's settings array's value is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - assignPAW - settings array value data check.");
            };

            // If the default user 0 user (OOBE User) is listed, ignore it and continue to the next loop iteration
            if (userAssignment.value === "defaultuser0") {
                // Skip this loop round
                continue;
            } else { // Is not the OOBE user
                // Extract the UPN from the value and add it to the old user list
                assignedUpnList = [userAssignment.value.split("\\")[1], ...assignedUpnList];
            };
        };

        // Write debug info
        writeDebugInfo(assignedUpnList, "Currently Assigned Users:");

        // Initialize the variable that will contained the enriched user(s)
        let upnResults: MicrosoftGraphBeta.User[] = [];

        // Loop through all of the UPNs and get user objects
        for (const upn of assignedUpnList) {
            // Catch execution errors
            try {
                // Get the specified UPN and add it to the list of assigned UPNs
                upnResults = [(await this.graphClient.getAADUser(upn))[0], ...upnResults];
            } catch (error) { // If an error happens
                // Check if error is internal and pass it directly if it is.
                if (error instanceof InternalAppError) {
                    // Send the current error instance up since it is an internal error.
                    throw error;
                } else {
                    // Throw an error
                    throw new InternalAppError("Unable to retrieve user", "Unknown Error", "LifecycleManagement - LifecycleRouter - getPawAssignment - User Enrichment");
                };
            };
        };

        // Return the results of the request to the caller
        return upnResults;
    };

    // Un-Assign the specified user(s) from the specified PAW. Wipes the device if no user left.
    private async unassignPAW(deviceID: string, upnList: string[]): Promise<MicrosoftGraphBeta.User[]> {
        // Validate Input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The specified Device ID is not valid!", "Invalid Input", "LifecycleManagement - LifecycleRouter - unassignPAW - Input Validation"); };
        if (!validateEmailArray(upnList)) { throw new InternalAppError("The UPN list is not valid!", "Invalid Input", "LifecycleManagement - LifecycleRouter - unassignPAW - Input Validation"); };

        // Ensure that the config engine is initialized
        if (!this.configEngine.configInitialized || this.configEngine.config === undefined) {
            // Throw an error
            throw new InternalAppError("Config engine is not initialized", "Not Initialized", "LifecycleManagement - LifecycleRouter - unassignPAW - Input Validation");
        };

        // Initialize variable
        let pawList: IDeviceObject[];
        let assignedUserList: MicrosoftGraphBeta.User[];

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Starting PAW recurse on the root group");

            // Get the list of PAWs
            pawList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

            // Write debug info
            writeDebugInfo(deviceID, "Completed update of ExtensionAttribute1 for device:");
        } catch (error) {
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Error getting PAW Devices", "Unknown Error", "LifecycleManagement - LifecycleRouter - unassignPAW - Get PAW Devices");
            };
        };

        // Loop through the PAW list and grab the first PAW whose ID matches the specified device ID
        const pawDevice = pawList.find((paw) => { return paw.id === deviceID });

        // Check if the PAW object isn't found
        if (typeof pawDevice !== "object") {
            // Throw an error
            throw new InternalAppError("PAW is not commissioned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - unassignPAW - Validate PAW Commission Status");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Getting a list of assigned users");

            assignedUserList = await this.getPawAssignment(deviceID);

            // Write debug info
            writeDebugInfo(assignedUserList, "Got the list of assigned users:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error occurred when getting the user list!", "Unknown Error", "LifecycleManagement - LifecycleRouter - unassignPAW - Get Assigned User List");
            };
        };

        // Make a list of users that will remain after removal
        const remainingUserList = assignedUserList.filter((user) => {
            // Ensure that the required data is present in the user object
            if (user.userPrincipalName === null || user.userPrincipalName === undefined) {
                // Throw an error
                throw new InternalAppError("Data from the User object is not present!", "Invalid Return", "LifecycleManagement - LifecycleRouter - unassignPAW - Validate user object integrity");
            };

            // Returns the results for the requested current UPN and upn requested to be removed
            // If the result of the sub match is true, then that UPN needs to be removed.
            // If the result of the sub match is false, then the UPN can stay.
            // If this return is equal to true the filter method will add the current user to the list of remaining users
            // If this return is equal to false, the filter method will exclude the current user from being returned.
            return !upnList.some((removeUPN) => {
                // Return true if the user matches the UPN that was requested to be removed
                return user.userPrincipalName === removeUPN;
            });
        });

        // Write debug info
        writeDebugInfo(remainingUserList, "Remaining users:");

        // Write debug info
        writeDebugInfo("Generating user rights post body");

        // Prefix the accounts with AzureAD so that they are compatible with the user rights assignment generator
        const upnListMap = remainingUserList.map(user => "AzureAD\\" + user.userPrincipalName);

        // Make the defaultuser0 assignment object so that the PAW can complete Autopilot even if the device isn't assigned
        const userAssignmentSettings = endpointPAWUserRightsSettings(["defaultuser0", ...upnListMap]);

        // Write debug info
        writeDebugInfo(userAssignmentSettings, "Completed generating user rights post body:");

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Updating settings catalog");

            // Create the user assignment settings catalog.
            const userAssignmentConfig = await this.graphClient.updateSettingsCatalog(pawDevice.UserAssignment, "PAW - Login - " + deviceID, "Allow only the specified users to log in.", [this.configEngine.config.ScopeTagID], userAssignmentSettings);

            // Write debug info
            writeDebugInfo(userAssignmentConfig, "Updated settings catalog:");
        } catch (error) { // If an error happens
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unable to update the settings catalog!", "Unknown Error", "LifecycleManagement - LifecycleRouter - unassignPAW - Update Settings Catalog");
            };
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo("Updating custom settings config");

            // Initialize oma variable
            let omaSettings;

            // Check if there are no users left
            if (upnListMap.length == 0) {
                // Generate the OMA Settings object with no user rights
                omaSettings = localGroupMembershipUserRights();
            } else { // if there are still users left, execute the below
                // Generate the OMA Settings object
                omaSettings = localGroupMembershipUserRights(upnListMap);
            };

            // Create the local users and groups custom OMA setting.
            await this.graphClient.updateMEMCustomDeviceConfigString(pawDevice.GroupAssignment, "PAW - Groups - " + deviceID, "Restrict Administrators and Hyper-V Admin group memberships.", [this.configEngine.config.ScopeTagID], [omaSettings]);

            // Write debug info
            writeDebugInfo("Updated custom settings config");
        } catch (error) {
            // Check if error is internal and pass it directly if it is.
            if (error instanceof InternalAppError) {
                // Send the current error instance up since it is an internal error.
                throw error;
            } else {
                // Throw an error
                throw new InternalAppError("Unknown error on custom settings config update!", "Unknown Error", "LifecycleManagement - LifecycleRouter - unassignPAW - Update Custom Settings Config");
            };
        };

        // If no users are assigned, wipe the device
        if (remainingUserList.length == 0) {
            // Catch execution errors
            try {
                // Wipe the device
                await this.graphClient.wipeMEMDevice(deviceID);

                // Write debug info
                writeDebugInfo(deviceID, "Sent wipe device command:");
            } catch (error) {
                // If the error is unknown device, ignore it, otherwise bubble it up
                if (error instanceof InternalAppError && error.message === "The specified device does not exist" && error.name === "Retrieval Error") {
                    // Write debug info
                    writeDebugInfo("This is ok as it indicates the device was never booted.", "Skipped sending wipe command as device was not present in MEM.");

                    // Do nothing because this is ok, it means the device hasn't booted up and registered into Endpoint Manager yet.
                } else {
                    // Write debug info
                    writeDebugInfo(error, "Unexpected exception during assignment:");

                    // Throw an error
                    throw new InternalAppError("An unknown error occurred, please see console for details", "Unknown Error", "LifecycleManagement - LifecycleRouter - unassignPAW - Input Validation");
                };
            };
        } else {
            // Write debug info
            writeDebugInfo("Skipping wipe as other user(s) are still assigned.");
        };

        // Return the list of users that remain
        return remainingUserList;
    };
};