// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { endpointPAWUserRightsSettings, conditionalAccessPAWUserAssignment } from "./RequestGenerator";
import { validateGUIDArray, parseScopeTag, ScopeTagDataIncomplete, writeDebugInfo, InternalAppError } from "./Utility";
import type { MSGraphClient } from "./GraphClient";
import type express from "express";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

export class LifeCycleRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: MSGraphClient;
    private configData: Promise<ScopeTagDataIncomplete>;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: MSGraphClient) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Initialize the config data that will be used on all of the core routes
        this.configData = this.configInit();

        // Initialize the routes
        this.initRoutes();
    };

    // Initialize the REST API routes
    private initRoutes(): void {

        // TODO: List all PAW Devices
        this.webServer.get('/API/Lifecycle/PAW/', async (request, response, next) => {
            // List all PAW devices
        });

        // TODO: Assign a PAW to a user or set of users
        this.webServer.post('/API/Lifecycle/AssignPAW/:deviceID', async (request, response, next) => {
            // Assign the PAW device
        });

        // Assign a PAW to a user or set of users
        this.webServer.post('/AssignPAW/:deviceID', async (request, response, next) => {
            // request.body.userGUIDList - Array of AAD user GUIDs that representthe user account that will be assigned to the specified PAW
            // request.body.userGroupList - Corresponding SG GUID for the above GUIDs this will have the CA policy applied to it to be PAW enforced
            // Catch execution errors
            try {
                // Parse the userGUID List and retrieve a user object from AAD for each GUID presented
                if (!validateGUIDArray(request.body.userGUIDList)) { throw new Error("Please specify a valid array of GUIDs in the body's userGUIDList property!") };
                // Check to ensure that the configData properties are present and accounted for
                const configData = await this.configData
                if (typeof configData.BrkGls === "undefined" || typeof configData.PAWSecGrp === "undefined") {throw new Error("BrkGls is not defined at the class level after an await command, BrkGls is potentially not configured in the scope tag!")};
                
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
                if (typeof pawGroup.id === "undefined" || pawGroup.id === null) {throw new Error("The PAW Group's ID isn't present, it may have not been created!")};

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
                if (typeof scopeTagObject.id === "undefined" || scopeTagObject.id === null) {throw new Error("The role scope tag prob doesn't exist! the ID has no data!")};

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
    }
}