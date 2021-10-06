// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { endpointPAWUserRightsSettings, conditionalAccessPAWUserAssignment } from "./RequestGenerator";
import { validateGUIDArray, writeDebugInfo, InternalAppError, validateGUID } from "./Utility";
import type { MSGraphClient } from "./GraphClient";
import type { ConfigurationEngine, PAWObject } from "./ConfigEngine";
import type express from "express";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

export class LifeCycleRouter {
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
                // Retrieve a list of all PAWs starting at the root PAW group
                const PAWList = await this.recursePAWGroup(this.configEngine.config.PAWSecGrp);

                // Send the PAW list back to the client
                response.send(PAWList);
            } else { // Configuration is not initialized
                // Send the response notifying the client as such
                response.send("Config is not initialized!");
            };
        });

        // TODO: Assign a PAW to a user or set of users
        this.webServer.post('/API/Lifecycle/PAW/:deviceID/Assign/', async (request, response, next) => {
            // Assign the PAW device
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
};