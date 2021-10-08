// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { endpointPAWUserRightsSettings, conditionalAccessPAWUserAssignment } from "./RequestGenerator";
import { validateGUIDArray, writeDebugInfo, InternalAppError, validateGUID } from "./Utility";
import type { MSGraphClient } from "./GraphClient";
import type { ConfigurationEngine, PAWGroupConfig, PAWObject } from "./ConfigEngine";
import type express from "express";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

export class LifecycleRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: MSGraphClient;
    private configEngine: ConfigurationEngine;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: MSGraphClient, configEngine: ConfigurationEngine) {

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

        // List all Commissioned PAW Devices
        this.webServer.get('/API/Lifecycle/PAW', async (request, response, next) => {
            // Write debug info
            writeDebugInfo(this.configEngine.configInitialized, "Config initialization status:");
            writeDebugInfo(this.configEngine.config, "Config data:");

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
                    response.send("An error occurred while retrieving the PAW list.");
                }
            } else { // Configuration is not initialized
                // Send the response notifying the client as such
                response.send("Config is not initialized!");
            };
        });

        // TODO write the commission paw endpoint
        this.webServer.post('/API/Lifecycle/PAW/:deviceID/Commission', async (request, response, next) => {
            // Coming Soon!
        });

        // TODO: Assign a PAW to a user or set of users
        this.webServer.post('/API/Lifecycle/PAW/:deviceID/Assign', async (request, response, next) => {
            // Coming Soon!
        });

        // Assign a PAW to a user or set of users
        this.webServer.post('/AssignPAW/:deviceID', async (request, response, next) => {
            // request.body.userGUIDList - Array of AAD user GUIDs that represent the user account that will be assigned to the specified PAW
            // request.body.userGroupList - Corresponding SG GUID for the above GUIDs this will have the CA policy applied to it to be PAW enforced
            // Catch execution errors
            try {
                // Ensure that the config engine is initialized before action is taken
                if (!this.configEngine.configInitialized || typeof this.configEngine.config === "undefined") { throw new InternalAppError("The configuration engine is not initialized at the time of lifecycle management action!", "Not Initialized") };
                // Parse the userGUID List and retrieve a user object from AAD for each GUID presented
                if (!validateGUIDArray(request.body.userGUIDList)) { throw new Error("Please specify a valid array of GUIDs in the body's userGUIDList property!") };
                // Check to ensure that the configData properties are present and accounted for
                const configData = this.configEngine.config
                if (typeof configData.BrkGls === "undefined" || typeof configData.PAWSecGrp === "undefined") { throw new Error("BrkGls is not defined at the class level after an await command, BrkGls is potentially not configured in the scope tag!") };

                // Initialize blank arrays for users
                let userList: MicrosoftGraphBeta.User[] = [];
                let upnList: string[] = ["defaultuser0"];

                // Loop through each of the GUIDs and retrieve an AAD User object for each GUID
                for (const userGUID of request.body.userGUIDList) {
                    writeDebugInfo(userGUID);

                    // Get an instance of the specified user from AAD
                    const userInstance = await this.graphClient.getAADUser(userGUID);

                    writeDebugInfo(userInstance)

                    // Validate data is present before consuming the data.
                    if (typeof userInstance[0].userPrincipalName === "undefined" || userInstance[0].userPrincipalName === null) { throw new Error("The UPN is not set on the user instance!") };

                    // Get the specified user from AAD and add them to the user list
                    userList = userList.concat(userInstance);

                    // Add the current user instance's UPN to the UPN list that will be consumed by the user rights assignment system
                    upnList.push("AzureAD\\" + userInstance[0].userPrincipalName);
                };

                // Get the PAW Device instance from MEM
                const memDeviceInstance = (await this.graphClient.getMEMDevice(request.params.deviceID))[0];

                // Validate the device instance from MEM has the data necessary
                if (typeof memDeviceInstance.deviceName === "undefined" || memDeviceInstance.deviceName === null) { throw new Error("The PAW's device name is not set in MEM!") };

                // Create the SG for the newly created PAW.
                const pawGroup = await this.graphClient.newAADGroup(memDeviceInstance.deviceName);
                if (typeof pawGroup.id === "undefined" || pawGroup.id === null) { throw new Error("The PAW Group's ID isn't present, it may have not been created!") };

                // Add the newly created PAW Dev Grp to the PAW Devices root group
                await this.graphClient.newAADGroupMember(pawGroup.id, configData.PAWSecGrp)

                // Validate the device instance from MEM has the data necessary
                if (typeof pawGroup.id === "undefined" || pawGroup.id === null) { throw new Error("The PAW's device name is not set in MEM!") };

                // Add the specified PAW to the newly created SG.
                await this.graphClient.newAADGroupMember(pawGroup.id, request.params.deviceID);

                // Generated post bodies for auto assignment
                const pawUserRightsSetting = endpointPAWUserRightsSettings(upnList);
                const caPolicySetting = conditionalAccessPAWUserAssignment(request.params.deviceID, pawGroup.id, request.body.userGroupList, configData.BrkGls);

                // Grab a copy of the main scope tag data
                const scopeTagObject = (await this.graphClient.getMEMScopeTag(process.env.Scope_Tag))[0];
                if (typeof scopeTagObject.id === "undefined" || scopeTagObject.id === null) { throw new Error("The role scope tag prob doesn't exist! the ID has no data!") };

                // Create and assign the settings catalog
                this.graphClient.newSettingsCatalog("PAW Login - " + memDeviceInstance.deviceName, "Auto Managed by Cloud PAW Management!", [scopeTagObject.id], pawUserRightsSetting)

                // Create and enable the Conditional Access Policy
                this.graphClient.newAADCAPolicy("PAW - Hardware Enforcement: " + memDeviceInstance.deviceName, caPolicySetting, "enabledForReportingButNotEnforced")

                // Send the results
                response.send(true);
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });
    };

    // Recurse through the specified PAW group and return an array of PAW device config objects
    private async recursePAWGroup(groupID: string): Promise<PAWObject[]> {
        // Validate input
        if (!validateGUID(groupID)) { throw new InternalAppError("The specified GUID is not a GUID!", "Invalid Input", "LifeCycleManagement - LifeCycleRouter - recursePAWGroup - Input Validation") }

        // Initialize variable namespaces
        let groupMemberList: MicrosoftGraphBeta.Group[];
        let deviceMemberList: MicrosoftGraphBeta.Device[];
        let processedMembers: PAWObject[] = [];

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

            // Parse the group's description
            const parsedDescription = await this.configEngine.getPAWGroupConfig(groupID);

            // Compile the data into a PAW object
            const pawObject: PAWObject = {
                "id": deviceMemberList[0].deviceId,
                "ParentGroup": groupID,
                "CommissionedDate": parsedDescription.CommissionedDate,
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

    // Commission the specified PAW with no user(s)
    private async commissionPAW(deviceID: string, type?: string): Promise<boolean> {
        // Validate Input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The specified Device ID is not a valid device ID!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Input Validation") };

        // Initialize the variables that are locally scoped so that they are available for execution
        let devGroup: MicrosoftGraphBeta.Group;
        let rootGroupMemberResult: boolean;
        let devGroupMemberResult: boolean;
        let pawType: "Privileged" | "Developer" | "Tactical-CR" | "Tactical-RRR";

        // If the type param is not specified, default it to standard PAW.
        if (typeof type !== "string") {
            // Set the PAW type to be used
            pawType = "Privileged"
        } else if (type === "Privileged" || type === "Developer" || type == "Tactical-CR" || type == "Tactical-RRR") {
            // Set the PAW type to be used
            pawType = type
        } else { // a string was specified but it doesn't match the expected types allowed
            // Throw an error
            throw new InternalAppError("Type is not a valid option", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Input Validation");
        };

        // Ensure that the config engine is initialized
        if (!this.configEngine.configInitialized || typeof this.configEngine.config === "undefined") {
            // Throw an error
            throw new InternalAppError("Config engine is not initialized", "Not Initialized", "LifecycleManagement - LifecycleRouter - commissionPAW - Input Validation");
        };

        // Grab the specified device's autopilot instance
        const deviceAutopilot = await this.graphClient.getAutopilotDevice(deviceID);

        // Check to see if the device is autopilot enabled, 0 means that the ID is not present and therefor not autopilot enabled
        if (deviceAutopilot.length == 0) {
            // Throw an error
            throw new InternalAppError("Device is not autopilot enabled!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Autopilot Status not present");
        } else if (deviceAutopilot.length > 1) {// if there is more than one autopilot device for the AAD device id, throw an error
            // Throw an error
            throw new InternalAppError("More than one device returned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Autopilot Status too many");
        };

        // Get the list of PAWs
        const pawList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

        // Loop through the PAW list and ensure that the device doesn't already exist
        for (const paw of pawList) {
            // If the PAW is already commissioned
            if (paw.id == deviceID) {
                // Throw an error
                throw new InternalAppError("PAW is already commissioned!", "Invalid Input", "LifecycleManagement - LifecycleRouter - commissionPAW - Validate PAW Commission Status");
            } else { // Otherwise, check the next PAW in the list
                continue;
            };
        };

        // Ensure that the serial number is present on the autopilot device instance by checking the absence of the serial number and throwing an error if missing
        if (typeof deviceAutopilot[0].serialNumber !== "string") {
            // Throw an error
            throw new InternalAppError("Data Missing from the serial number property!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - Serial Number Null Check");
        };

        // Catch execution errors
        try {
            // Set the device extension attribute 1 value to "PAW" on the PAW device
            await this.graphClient.updateAADDeviceExtensionAttribute(deviceID, "PAW");
        } catch (error) {
            // Throw an error
            throw new InternalAppError("Error setting Extension Attribute", "Unknown Error", "LifecycleManagement - LifecycleRouter - commissionPAW - Add Extension Attribute");
        };

        // Make the defaultuser0 assignment object so that the PAW can complete Autopilot even if the device isn't assigned
        const userAssignmentSettings = endpointPAWUserRightsSettings(["defaultuser0"]);

        // Create the user assignment settings catalog.
        const userAssignmentConfig = await this.graphClient.newSettingsCatalog("PAW - Login - " + deviceID, "Allow only the defaultuser0 user to login to the specified PAW. This allows it to complete", [this.configEngine.scopeTagName], userAssignmentSettings);

        if (typeof userAssignmentConfig.id !== "string") {
            // Throw an error
            throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - User Assignment Settings Catalog ID Null Check");
        };

        // Collect all the data in one place for the PAW Device Group description
        const devGroupDescription: PAWGroupConfig = {
            "CommissionedDate": new Date(),
            "Type": pawType,
            "UserAssignment": userAssignmentConfig.id
        };

        // Generate the description string to be use for the PAW's device group
        const groupDescription = "CommissionedDate=" + devGroupDescription.CommissionedDate + ",Type=" + devGroupDescription.Type + ",UserAssignment=" + devGroupDescription.UserAssignment

        // Catch Execution Errors
        try {
            // Create the device group
            devGroup = await this.graphClient.newAADGroup(deviceAutopilot[0].serialNumber, groupDescription);
        } catch (error) {
            // Throw an error
            throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Device Group Creation");
        };

        // Check to ensure that complete data was returned.
        if (typeof devGroup.id !== "string") {
            // Throw an error
            throw new InternalAppError("Incomplete Data!", "Invalid Return", "LifecycleManagement - LifecycleRouter - commissionPAW - Device Group ID Null Check");
        };

        // Assign the user rights configuration to the device security group
        const assignmentResults = await this.graphClient.updateConfigurationAssignment("Settings Catalog", userAssignmentConfig.id, [devGroup.id], [this.configEngine.config.BrkGls]);

        // Catch Execution Errors
        try {
            // Add the newly created PAW device group to the PAW root group
            rootGroupMemberResult = await this.graphClient.newAADGroupMember(this.configEngine.config.PAWSecGrp, devGroup.id);
        } catch (error) {
            // Throw an error
            throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Add Dev Grp to PAW Root Grp");
        };

        // Catch Execution Errors
        try {
            // Add the PAW device to the PAW SG
            devGroupMemberResult = await this.graphClient.newAADGroupMember(devGroup.id, deviceID);
        } catch (error) {
            // Throw an error
            throw new InternalAppError("Unknown error", "Unknown", "LifecycleManagement - LifecycleRouter - commissionPAW - Add Dev to Dev Grp");
        };

        // Return true for successful operation
        return true;
    };
};