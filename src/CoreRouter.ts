import type { MSGraphClient } from "./GraphClient";
import { endpointPAWUserRightsSettings, conditionalAccessPAWUserAssignment } from "./RequestGenerator";
import { validateGUIDArray, parseScopeTag, ScopeTagDataIncomplete, writeDebugInfo } from "./Utility";
import type express from "express";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

export class CoreRouter {
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
    }

    // TODO: refactor the config initialization so that it can handel deltas and not just full deployments
    // Initialize the configuration for the app
    private async configInit(): Promise<ScopeTagDataIncomplete> {
        // Validate environmental variable
        if (typeof process.env.Scope_Tag !== "string") { throw new Error("The Scope_Tag env var is not a string or not defined!") };

        // Grab a copy of the main scope tag data
        const scopeTagObject = (await this.graphClient.getMEMScopeTag(process.env.Scope_Tag))[0]

        // Write debug info if in debug mode
        writeDebugInfo(scopeTagObject, "Retrieved scope tag object from the Graph API:")

        // Ensure that the scope tag exists and if it doesn't make a new one.
        if (typeof scopeTagObject === "undefined") {
            try {
                // Create a new role scope tag in MEM with an empty description.
                const newMEMScopeTag = await this.graphClient.newMEMScopeTag(process.env.Scope_Tag);

                // Write debug info if in debug mode
                writeDebugInfo(newMEMScopeTag, "Created new MEM Scope Tag:");

                // Validate that the new tag is not a dud
                if (typeof newMEMScopeTag.displayName === "undefined" || newMEMScopeTag.displayName === null) { throw new Error("The new tag is undefined or null!") };

                // Make the core security groups and collect their GUIDs
                const pawGroupGUID = (await this.createPAWDevicesGroup()).id;
                const userGroupGUID = (await this.createPrivilegedUsersGroup()).id;
                const siloGroupGUID = (await this.createSILORootGroup()).id;
                const breakGlassGroupGUID = (await this.createBreakGlassGroup()).id;
                const privTagGroupGUID = (await this.createPrivilegedUserTagGroup()).id;

                // Build a new description for the Scope Tag with the above metadata.
                const newDescription = "PAWSecGrp=" + pawGroupGUID + "\nUsrSecGrp=" + userGroupGUID + "\nSiloRootGrp=" + siloGroupGUID + "\nBrkGls=" + breakGlassGroupGUID + "\nUsrTag=" + privTagGroupGUID;

                // Set the new data in the Graph API.
                const updatedScopeTag = await this.graphClient.updateMEMScopeTag(newMEMScopeTag.displayName, newDescription);

                // Check to ensure that the updated data was set properly and not a dud.
                if (typeof updatedScopeTag.description === "undefined" || updatedScopeTag.description === null) { throw new Error("The updated Scope tag is undefined!") };

                // Parse the new description and return the parsed data structure
                return parseScopeTag(updatedScopeTag.description);
            } catch (error) { // If an error happens, throw a new error
                throw new Error("Couldn't make a new MEM scope tag during configInit!: " + error);
            }
            // Parse and expose the data of the already existing MEM scope tag
        } else {
            if (typeof scopeTagObject.description === "undefined" || scopeTagObject.description === null) {
                // Give the scope tag parser an empty string to satisfy the parse requirement
                return parseScopeTag("");
            } else {
                // Parse and return the parsed object
                return parseScopeTag(scopeTagObject.description)
            }

        };
    };

    // Create the PAW Devices Root group
    private async createPAWDevicesGroup(): Promise<MicrosoftGraphBeta.Group> {
        // Catch execution errors
        try {
            // Create the root PAW devices group
            const results = await this.graphClient.newAADGroup("PAW Devices", "The root of the PAW Devices hierarchy. Contains all PAWs and their dedicated SGs.");

            // Write debug info
            writeDebugInfo(results, "Created PAW Root Group:")

            // Return the results of the creation operation to the caller
            return results;

        } catch (error) { // On error, don't throw, instead pass the error details to a dedicated code block.
            // Return the error details
            return error;
        };
    };

    // Create the Priv Users Root group
    private async createPrivilegedUsersGroup(): Promise<MicrosoftGraphBeta.Group> {
        // Catch execution errors
        try {
            // Create the root Priv Users group as a role assignable SG
            const results = await this.graphClient.newAADGroup("Privileged Users", "The root of the priv users hierarchy. Contains all Priv Users and their dedicated SGs.");

            // Write debug info
            writeDebugInfo(results, "Created Priv Users Root Group:")

            // Return the results of the creation operation to the caller
            return results;

        } catch (error) { // On error, don't throw, instead pass the error details to a dedicated code block.
            // Return the error details
            return error;
        };
    };

    // Create the SILO Root group
    private async createSILORootGroup(): Promise<MicrosoftGraphBeta.Group> {
        // Catch execution errors
        try {
            // Create the root Priv Users group as a role assignable SG
            const results = await this.graphClient.newAADGroup("SILO Root", "The root of the SILO hierarchy. Contains all of the privilege SILOs.");

            // Write debug info
            writeDebugInfo(results, "Created SILO Root Group:")

            // Return the results of the creation operation to the caller
            return results;

        } catch (error) { // On error, don't throw, instead pass the error details to a dedicated code block.
            // Return the error details
            return error;
        };
    };

    // Create the Break Glass group
    private async createBreakGlassGroup(): Promise<MicrosoftGraphBeta.Group> {
        // Catch execution errors
        try {
            // Create the root Priv Users group as a role assignable SG
            const results = await this.graphClient.newAADGroup("Break Glass", "Contains a list of all of the break glass accounts.");

            // Write debug info
            writeDebugInfo(results, "Created Break Glass Group:")

            // Return the results of the creation operation to the caller
            return results;

        } catch (error) { // On error, don't throw, instead pass the error details to a dedicated code block.
            // Return the error details
            return error;
        };
    };

    // Create the Priv Users Tagging group
    private async createPrivilegedUserTagGroup(): Promise<MicrosoftGraphBeta.Group> {
        // Catch execution errors
        try {
            // Create the root Priv Users group as a role assignable SG
            const results = await this.graphClient.newAADGroup("Privileged Users - Tagging", "A list of all privileged users. This group tags the priv users on system log in so that effective user rights assignment can take place.", true);

            // Write debug info
            writeDebugInfo(results, "Created Priv User Tag Group:")

            // Return the results of the creation operation to the caller
            return results;

        } catch (error) { // On error, don't throw, instead pass the error details to a dedicated code block.
            return error;
        };
    };

    // Initialize the REST API routes
    private initRoutes(): void {

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