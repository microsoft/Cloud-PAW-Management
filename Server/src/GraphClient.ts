// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { ChainedTokenCredential } from "@azure/identity";
import { Client, ClientOptions, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";
import "isomorphic-fetch";
import { endpointGroupAssignmentTarget } from "./RequestGenerator";
import { writeDebugInfo, InternalAppError, validateConditionalAccessSetting, validateEmail, validateGUID, validateGUIDArray, validateSettingCatalogSettings, validateStringArray, validateOmaStringObjectArray } from "./Utility";

// Define the Graph Client class.
export class MSGraphClient {
    private client: Promise<Client>;

    // Define the initialization of the class
    constructor(credential: Promise<ChainedTokenCredential>) {
        // Create an instance of the graph client and expose it internally.
        // The credentials are passed as a parameter as to not expose them to other methods internal to this class.
        this.client = this.init(credential);
    }

    // Define the login command that returns a connected instance of the Graph client
    private async init(credential: Promise<ChainedTokenCredential>): Promise<Client> {
        // Instantiate the access token interpreter
        const tokenCredentialAuthProvider = new TokenCredentialAuthenticationProvider(await credential, { scopes: ["https://graph.microsoft.com/.default"] });

        // Configure teh initialization system to use the custom graph auth provider
        const clientOptions: ClientOptions = {
            // Configure the auth provider property to be the value of the graph auth constant
            authProvider: tokenCredentialAuthProvider,
            defaultVersion: "beta"
        };

        // Connect the graph client to the graph
        return Client.initWithMiddleware(clientOptions);
    };

    // make a page iterator so that pages of data will automatically be all of the data
    private async iteratePage(graphResponse: PageCollection): Promise<any[]> {
        try {
            // Initialize the collection that will be returned after iteration.
            let collection: Array<any> = [];

            // Initialize the iterator to use the existing graph connection and the current response that may need iterated on.
            const pageIterator = new PageIterator(await this.client, graphResponse, (data) => {
                // Add data gathered from the iterator to the collection
                collection.push(data);

                // Continue iteration (true means continue, false means pause iteration).
                return true;
            });

            // Start the iteration process and wait for completion of the operation.
            await pageIterator.iterate();

            // Return the collection to the caller
            return collection;
        } catch (error) {
            // if there is an error, tell us about it...
            throw new InternalAppError("Page iterator breakdown: " + error);
        };
    };

    // Create a new role scope tag in Endpoint Manager
    async newMEMScopeTag(scopeTagName: string, description?: string): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Validate Inputs
        if (typeof scopeTagName !== "string") { throw new InternalAppError("The ScopeTagName has to be a string!", "Invalid Input", "GraphClient - newMEMScopeTag - Input Validation") };
        if (scopeTagName.length > 128) { throw new InternalAppError("The ScopeTagName can't be longer than 128 chars!", "Invalid Input", "GraphClient - newMEMScopeTag - Input Validation") };
        if (typeof description !== "undefined" && typeof description !== "string") { throw new InternalAppError("The description must be a string!", "Invalid Input", "GraphClient - newMEMScopeTag - Input Validation") };
        if (typeof description === "string" && description.length > 1024) { throw new InternalAppError("Description can't be longer than 1024 chars!", "Invalid Input", "GraphClient - newMEMScopeTag - Input Validation") };

        // Catch execution errors
        try {
            // Build the Post body that will be used to create the new tag.
            const scopeTagBody: MicrosoftGraphBeta.RoleScopeTag = {
                displayName: scopeTagName
            };

            // If the description is defined, add it to the scope tag post body.
            if (typeof description !== "undefined") {
                // Add the parameter value to the post body property.
                scopeTagBody.description = description
            };

            // Create the scope tag and return the result.
            return await (await this.client).api("/deviceManagement/roleScopeTags").post(scopeTagBody);

            // If something goes wrong, return the error.
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - newMEMScopeTag - catch statement");
            };
        };
    };

    // Get the specified scope tag or get all scope tags
    async getMEMScopeTag(name?: string): Promise<MicrosoftGraphBeta.RoleScopeTag[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the scope tag page so that it is available to callers.
            let scopeTagPage: PageCollection;

            // If no name is specified, return all scope tags
            if (typeof name === "undefined") {
                // Grab an initial MEM Scope page collection
                scopeTagPage = await (await this.client).api("/deviceManagement/roleScopeTags").get();
            } else if (typeof name === "string" && name.length <= 128) {
                // Grab the specified MEM Scope based on its unique name.
                scopeTagPage = await (await this.client).api("/deviceManagement/roleScopeTags").filter("displayName eq '" + name + "'").get();
            } else {
                // If the name param doesn't match, throw an error
                throw new InternalAppError("The name parameter is not a string or a valid scope tag name!", "Invalid Input");
            };

            // Process the page collection to its base form (RoleScopeTag)
            const scopeTagList: MicrosoftGraphBeta.RoleScopeTag[] = await this.iteratePage(scopeTagPage);

            // Return the processed data.
            return scopeTagList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getMEMScopeTag - catch statement");
            };
        };
    };

    // Update the specified role scope tag in Endpoint Manager
    async updateMEMScopeTag(name: string, description?: string, id?: number): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Validate input
        if (typeof name !== "string" || name.length > 128) { throw new InternalAppError("The name is not a valid string or is greater than 128 chars!", "Invalid Input", "GraphClient - updateMEMScopeTag - Input Validation") };
        if (typeof description === "string" && description.length > 1024) { throw new InternalAppError("The description can't be longer than 1024 chars!", "Invalid Input", "GraphClient - updateMEMScopeTag - Input Validation") };
        if (typeof id !== "undefined" && typeof id !== "number") { throw new InternalAppError("The ID needs to be a whole number!", "Invalid Input", "GraphClient - updateMEMScopeTag - Input Validation") };
        if (typeof id === "number" && (!Number.isInteger(id) || id <= 0)) { throw new InternalAppError("The ID has to be a whole number above 0", "Invalid Input", "GraphClient - updateMEMScopeTag - Input Validation") };

        // Build the initial scope tag object for the update process to use
        let scopeTagBody: MicrosoftGraphBeta.RoleScopeTag = { "displayName": name }

        // If the description is provided, add it to the scope tag body
        if (typeof description === "string") { scopeTagBody.description = description }

        // Catch execution errors
        try {
            if (typeof id === "undefined") {
                // Get an instance of the specified scope tag
                const scopeTagInstance = (await this.getMEMScopeTag(name))[0];

                // Update the scope tag with the specified data
                return (await this.client).api("/deviceManagement/roleScopeTags/" + scopeTagInstance.id).patch(scopeTagBody);
            } else {
                // Update the scope tag with the specified data
                return (await this.client).api("/deviceManagement/roleScopeTags/" + id).patch(scopeTagBody);
            }
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - updateMEMScopeTag - catch statement");
            };
        };
    };

    // Delete the specified scope tag
    async removeMEMScopeTag(id: number): Promise<boolean> {
        // Validate input
        if (typeof id !== "number") { throw new InternalAppError("The ID parameter needs to be a number!", "Invalid Input", "GraphClient - removeMEMScopeTag - Input Validation") };
        if (typeof id === "number" && (!Number.isInteger(id) || id <= 0)) { throw new InternalAppError("The ID has to be a whole number above 0", "Invalid Input", "GraphClient - removeMEMScopeTag - Input Validation") };

        // Catch error on execution
        try {
            // Delete the specified scope tag
            await (await this.client).api("/deviceManagement/roleScopeTags/" + id).delete();
            // Return true indicating successful operation
            return true
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - removeMEMScopeTag - catch statement");
            };
        };
    };

    // Create a custom Windows 10 Setting that uses a string xml (non-uploaded) format.
    async newMEMCustomDeviceConfigString(name: string, description: string, scopeTagID: string[], omaSetting: MicrosoftGraphBeta.OmaSettingString[]) {
        // Validate Input
        if (typeof name !== "string") { throw new InternalAppError("The type of the name parameter is not a string!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        if (name.length > 200) { throw new InternalAppError("The char count for the name parameter is more than 200!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        if (typeof description !== "string") { throw new InternalAppError("The type of the description parameter is not a string!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        if (description.length > 1500) { throw new InternalAppError("The char count for the description parameter is more than 1500!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        if (!validateOmaStringObjectArray(omaSetting)) { throw new InternalAppError("The specified omaSetting is not the correct structure!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        if (typeof scopeTagID !== "object" || scopeTagID.length == 0) { throw new InternalAppError("The role scope tag IDs must be an array of numbers in string format and not be empty!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        /*
         * TODO: Convert to scope tag name instead of the ID of the tag
         * Loop through each of the indexes and ensure that they are parsable to numbers
         */
        for (let index = 0; index < scopeTagID.length; index++) {
            // Expose a specific ID
            const ID = scopeTagID[index],
                // Parse the string to a number
                parsedNum = Number.parseInt(ID);

            // Check to make sure the string is a parsable number
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) { throw new InternalAppError("Please specify a number for the role scope tag IDs!", "Invalid Input", "GraphClient - MSGraphClient - newCustomDeviceConfig - Input Validation") };
        };

        // Create the post body to be used for the resource configuration
        const postBody = {
            "@odata.type": "#microsoft.graph.windows10CustomConfiguration",
            "displayName": name,
            "description": description,
            "roleScopeTagIds": scopeTagID,
            "omaSettings": omaSetting
        };

        // Catch any error on custom setting (string) creation
        try {
            // Create the custom settings and return the result
            return await (await this.client).api("/deviceManagement/deviceConfigurations").post(postBody);
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - MSGraphClient - newCustomDeviceConfig - catch statement");
            };
        };

    };

    // Retrieve Microsoft Endpoint Manager configuration profile list. Can pull individual profile based upon GUID
    async getDeviceConfig(GUID?: string): Promise<MicrosoftGraphBeta.DeviceConfiguration[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the device configuration page so that it is available to callers.
            let deviceConfigPage: PageCollection;

            // If a GUID is specified, return the specified device configurations.
            if (validateGUID(GUID)) {
                // Grab the specified device configuration.
                return [await (await this.client).api("/deviceManagement/deviceConfigurations/" + GUID).get()];
                // If no GUID is specified, return all configs
            } else if (typeof GUID === "undefined") {
                // Grab all device configs.
                deviceConfigPage = await (await this.client).api("/deviceManagement/deviceConfigurations").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input", "GraphClient - getDeviceConfig - Input Validation");
            };

            // Process the page collection to its base form (DeviceConfiguration)
            const deviceConfigList: MicrosoftGraphBeta.DeviceConfiguration[] = await this.iteratePage(deviceConfigPage);

            // Return the processed data.
            return deviceConfigList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getDeviceConfig - catch statement");
            };
        };
    };

    // Remove the specified Device Configuration
    async removeDeviceConfig(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to delete the device configuration
            try {
                // Send the delete command for the specified GUID
                await (await this.client).api("/deviceManagement/deviceConfigurations/" + GUID).delete();

                // Return true for a successful operation
                return true;
            } catch (error) {
                // Check to see if the error parameter is an instance of the Error class.
                if (error instanceof Error) {
                    // Return the error in a well known format using the Internal App Error class
                    throw new InternalAppError(error.message, error.name, error.stack);
                } else {
                    // Return the unknown error in a known format
                    throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - removeDeviceConfig - catch statement");
                };
            };
        } else {
            // If the GUID is not in the right format, throw an error
            throw new InternalAppError("The GUID specified is not a proper GUID!", "Invalid Input", "GraphClient - removeDeviceConfig - Input Validation");
        };
    };

    // TODO: finish the CRUD operations for Admin Template policies
    async newDeviceGroupPolicyConfig() { }

    // TODO: finish the CRUD operations for Admin Template policies
    // Retrieve Microsoft Endpoint Manager Group Policy configuration list. Can pull individual policy based upon GUID
    async getDeviceGroupPolicyConfig(GUID?: string): Promise<MicrosoftGraphBeta.GroupPolicyConfiguration[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the device configuration page so that it is available to callers.
            let deviceGPConfigPage: PageCollection;

            // If no GUID is specified, return all device GPO configurations.
            if (validateGUID(GUID)) {
                // Grab the specified device configuration.
                return [await (await this.client).api("/deviceManagement/groupPolicyConfigurations/" + GUID).get()];
            } else if (typeof GUID === "undefined") {
                // Grab all device configs.
                deviceGPConfigPage = await (await this.client).api("/deviceManagement/groupPolicyConfigurations").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input");
            };

            // Process the page collection to its base form (GroupPolicyConfiguration)
            const deviceGPConfigList: MicrosoftGraphBeta.GroupPolicyConfiguration[] = await this.iteratePage(deviceGPConfigPage);

            // Return the processed data.
            return deviceGPConfigList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getDeviceGroupPolicyConfig - catch statement");
            };
        };
    };

    // TODO: finish the CRUD operations for Admin Template policies
    async updateDeviceGroupPolicyConfig() { }
    async removeDeviceGroupPolicyConfig() { }

    // Retrieve an Azure Active Directory user list. Can pull individual users based upon GUID or the UPN.
    async getAADUser(ID?: string): Promise<MicrosoftGraphBeta.User[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the user page so that it is available to callers.
            let userPage: PageCollection;

            // If no GUID is specified, return all users.
            if (typeof ID === "undefined") {
                // Grab all users.
                userPage = await (await this.client).api("/users").get();
                // If a GUID or UPN is specified, return that user.
            } else if (validateGUID(ID) || validateEmail(ID)) {
                // Grab the specified user.
                return [await (await this.client).api("/users/" + ID).get()];
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The ID parameter is not a valid GUID or UPN!", "Invalid Input", "GraphClient - getAADUser - Input Validation");
            };

            // Process the page collection to its base form (User)
            const userList: MicrosoftGraphBeta.User[] = await this.iteratePage(userPage);

            // Return the processed data.
            return userList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADUser - catch statement");
            };
        };
    };

    // Create a new security group with the specified options
    async newAADGroup(name: string, description?: string, roleAssignable?: boolean): Promise<MicrosoftGraphBeta.Group> {
        // Validate name length is not too long for the graph
        if (typeof name !== "string") { throw new InternalAppError("The type of name is not a string!", "Invalid Input", "GraphClient - newAADGroup - Input Validation") };
        if (name.length > 120) { throw new InternalAppError("The name is too long, can't be longer than 120 chars!", "Invalid Input", "GraphClient - newAADGroup - Input Validation") };

        // These characters cannot be used in the mailNickName: @()\[]";:.<>,SPACE
        const nicknameRegex = /[\\\]\]@()";:.<>,\s]+/gm;

        // Filter out the non-valid chars from the group name to build a valid nickname
        const nickName = name.replace(nicknameRegex, "");

        // Build the graph client post body
        let postBody: MicrosoftGraphBeta.Group = {
            displayName: name,
            mailNickname: nickName,
            mailEnabled: false,
            securityEnabled: true
        };

        // Check to make sure that the description is defined, if it is, configure the description of the group
        if (typeof description === "string") {
            // Validate that the description is of the correct length
            if (description.length > 1024) { throw new InternalAppError("The description cannot be longer than 1024 characters!", "Invalid Input", "GraphClient - newAADGroup - Set Description") };

            // Set the description of the new group
            postBody.description = description;
        }

        // Validate the role assignable param
        if (typeof roleAssignable === "boolean") {
            // If the param is present and the correct type, set the post body value for the role assignable
            postBody.isAssignableToRole = roleAssignable;
        };

        // Catch any error on group creation
        try {
            // Create the group and return the result
            return await (await this.client).api("/groups").post(postBody);
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - newAADGroup - catch statement");
            };
        };
    };

    // Retrieve Azure Active Directory (AAD) group list. Can pull individual groups based upon the group's GUID
    async getAADGroup(GUID?: string): Promise<MicrosoftGraphBeta.Group[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the device configuration page so that it is available to callers.
            let groupPage: PageCollection;

            // If a GUID is specified, return the specified group.
            if (validateGUID(GUID)) {
                // Grab and return the specified group.
                return [await (await this.client).api("/groups/" + GUID).get()];
                // If no GUID is specified, return all groups.
            } else if (typeof GUID === "undefined") {
                // Grab all device configs.
                groupPage = await (await this.client).api("/groups").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input", "GraphClient - getAADGroup - Input Validation");
            };

            // Process the page collection to its base form (DeviceConfiguration)
            const groupList: MicrosoftGraphBeta.Group[] = await this.iteratePage(groupPage);

            // Return the processed data.
            return groupList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADGroup - catch statement");
            };
        };
    };

    // Update the specified group
    async updateAADGroup(GUID: string, name: string, description?: string): Promise<boolean> {
        // Validate Input
        if (!validateGUID(GUID)) { throw new InternalAppError("The specified GUID is not a valid GUID!", "Invalid Input", "GraphClient - updateAADGroup - Input Validation") };
        if (typeof name !== "string") { throw new InternalAppError("The Name parameter is not a string!", "Invalid Input", "GraphClient - updateAADGroup - Input Validation") };
        if (name.length > 120) { throw new InternalAppError("The name is too long, can't be longer than 120 chars!", "Invalid Input", "GraphClient - updateAADGroup - Input Validation") };

        // These characters cannot be used in the mailNickName: @()\[]";:.<>,SPACE
        const nicknameRegex = /[\\\]\]@()";:.<>,\s]+/gm;

        // Filter out the non-valid chars from the group name to build a valid nickname
        const nickName = name.replace(nicknameRegex, "");

        // Build the patch request body
        const patchBody: MicrosoftGraphBeta.Group = {
            displayName: name,
            mailNickname: nickName
        };

        // Check to make sure that the description is defined, if it is, configure the description of the group
        if (typeof description === "string") {
            // Validate that the description is of the correct length
            if (description.length > 1024) { throw new InternalAppError("The description cannot be longer than 1024 characters!", "Invalid Input", "GraphClient - updateAADGroup - Description Configuration") };

            // Set the description of the group
            patchBody.description = description;
        };

        // Attempt to update a group
        try {
            // Send update command and new values to the specified api endpoint
            await (await this.client).api("/groups/" + GUID).patch(patchBody);

            // Return true for successful
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - newMEMScopeTag - catch statement");
            };
        };
    };

    // Delete the specified Security Group
    async removeAADGroup(GUID: string): Promise<boolean> {
        // Validate Input
        if (!validateGUID(GUID)) { throw new InternalAppError("The specified GUID is not a valid GUID!", "Invalid Input", "GraphClient - removeAADGroup - Input Validation") };

        // Attempt to delete the group
        try {
            // Send the delete command for the specified GUID
            await (await this.client).api("/groups/" + GUID).delete();

            // Return true for a successful operation
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - removeAADGroup - catch statement");
            };
        };
    };

    // Add a principal to an AAD Group
    async newAADGroupMember(groupGUID: string, addGUID: string, isDeviceID?: boolean): Promise<boolean> {
        // Validate Input
        if (!validateGUID(groupGUID) || !validateGUID(addGUID)) { throw new InternalAppError("The specified GUID is not a valid GUID!", "Invalid Input", "GraphClient - newAADGroupMember - Input Validation") };
        if (typeof isDeviceID !== "undefined" && typeof isDeviceID !== "boolean") { throw new InternalAppError("The isDeviceID Parameter has to be a boolean!", "Invalid Input", "GraphClient - newAADGroupMember - Input Validation") }

        // Grab the specified group membership from AAD
        try {
            // If the GUID to add is a device ID, convert it to an Object ID for the below query.
            if (isDeviceID) {
                // Get the first device object based on it's device ID and extract its Object ID into a variable
                const objectID = (await this.getAADDevice(addGUID))[0].id;

                // If the objectID is not returned, throw an error
                if (typeof objectID !== "string") {
                    // Throw an error
                    throw new InternalAppError("Missing Data", "Unknown", "GraphClient - newAADGroupMember - DeviceID to Object ID conversion");
                };

                // Set the value of the addGUID parameter to be the objectID value just retrieved
                addGUID = objectID
            };

            // Build the post body
            const newMemberBody = {
                "@odata.id": "https://graph.microsoft.com/beta/directoryObjects/" + addGUID
            };

            // Add the specified principal to the specified AAD Group.
            await (await this.client).api("/groups/" + groupGUID + "/members/$ref").post(newMemberBody);

            // Return the processed data.
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - newAADGroupMember - catch statement");
            };
        };
    };

    // List the members of a AAD Group.
    // Overloads are used when filtering to the requested type.
    async getAADGroupMember(groupGUID: string, type: "microsoft.graph.user"): Promise<MicrosoftGraphBeta.User[]>;
    async getAADGroupMember(groupGUID: string, type: "microsoft.graph.device"): Promise<MicrosoftGraphBeta.Device[]>;
    async getAADGroupMember(groupGUID: string, type: "microsoft.graph.group"): Promise<MicrosoftGraphBeta.Group[]>;
    async getAADGroupMember(groupGUID: string, type?: string): Promise<MicrosoftGraphBeta.DirectoryObject[]>;
    async getAADGroupMember(groupGUID: string, type?: string) {
        // Validate GUID is a proper GUID
        if (!validateGUID(groupGUID)) { throw new InternalAppError("The GUID specified is not a proper GUID!", "Invalid Input", "GraphClient - getAADGroupMember - Input Validation") };

        // Validate the type parameter value is expected
        if (type === "microsoft.graph.user" || type === "microsoft.graph.device" || type === "microsoft.graph.group") {
            // Set the type filter value to the type specified with the required URI modifier
            var typeFilter = "/" + type;
        } else { // If the type param it not any of the pre-defined types, don't set the type filter
            var typeFilter = "";
        };

        // Grab the specified group membership from AAD
        try {
            // Grab the specified group membership based on the group's GUID.
            // The type filter will be added on the end if one is specified. The type filter automatically adds a slash if necessary
            const groupMemberPage: PageCollection = await (await this.client).api("/groups/" + groupGUID + "/members" + typeFilter).get();

            // Process the page collection to its base form (DirectoryObject[])
            const groupMemberList: MicrosoftGraphBeta.DirectoryObject[] = await this.iteratePage(groupMemberPage);

            // Return the processed data.
            return groupMemberList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADGroupMember - catch statement");
            };
        };
    };

    // Remove the specified group member from the specified AAD group
    async removeAADGroupMember(groupGUID: string, removeGUID: string, isDeviceID?: boolean): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (!validateGUID(groupGUID)) { throw new InternalAppError("The groupGUID specified is not a proper GUID!", "Invalid Input", "GraphClient - removeAADGroupMember - Input Validation") };
        if (!validateGUID(removeGUID)) { throw new InternalAppError("The removeGUID specified is not a proper GUID!", "Invalid Input", "GraphClient - removeAADGroupMember - Input Validation") };
        if (typeof isDeviceID !== "undefined" && typeof isDeviceID !== "boolean") { throw new InternalAppError("The isDeviceID Parameter has to be a boolean!", "Invalid Input", "GraphClient - removeAADGroupMember - Input Validation") }

        // Grab the specified group membership from AAD
        try {
            // If the GUID to add is a device ID, convert it to an Object ID for the below query.
            if (isDeviceID) {
                // Get the first device object based on it's device ID and extract its Object ID into a variable
                const objectID = (await this.getAADDevice(removeGUID))[0].id;

                // If the objectID is not returned, throw an error
                if (typeof objectID !== "string") {
                    // Throw an error
                    throw new InternalAppError("Missing Data", "Unknown", "GraphClient - newAADGroupMember - DeviceID to Object ID conversion");
                };

                // Set the value of the addGUID parameter to be the objectID value just retrieved
                removeGUID = objectID
            };

            // Remove the specified group member from the group
            await (await this.client).api("/groups/" + groupGUID + "/members/" + removeGUID + "/$ref/").delete();

            // Return that the operation was successful
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - removeAADGroupMember - catch statement");
            };
        };
    };

    // TODO: Write new AU creator
    async newAADAdminUnit(name: string, description?: string) { }

    // Retrieve Azure Active Directory Administrative Unit (AU) list. Can pull individual AUs based upon GUID.
    async getAADAdminUnit(GUID?: string): Promise<MicrosoftGraphBeta.AdministrativeUnit[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the administrative unit page so that it is available to callers.
            let adminUnitPage: PageCollection;

            // If a GUID is specified, return the specified AU.
            if (validateGUID(GUID)) {
                // Grab the specified device configuration.
                return [await (await this.client).api("/administrativeUnits/" + GUID).get()];
                // If no GUID is specified, return all AUs
            } else if (typeof GUID === "undefined") {
                // Grab all device configs.
                adminUnitPage = await (await this.client).api("/administrativeUnits").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input", "GraphClient - getAADAdminUnit - Input Validation");
            };

            // Process the page collection to its base form (AdministrativeUnit)
            const adminUnitList: MicrosoftGraphBeta.AdministrativeUnit[] = await this.iteratePage(adminUnitPage);

            // Return the processed data.
            return adminUnitList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADAdminUnit - catch statement");
            };
        };
    };

    // TODO: write the AU updater
    async updateAADAdminUnit(GUID: string, name: string, description?: string) { }

    // Remove the specified Administrative united based on the GUID
    async removeAADAdminUnit(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (!validateGUID(GUID)) { throw new InternalAppError("The GUID specified is not a proper GUID!", "Invalid Input", "GraphClient - removeAADAdminUnit - Input Validation") };

        // Attempt to delete the AU
        try {
            // Send the delete command for the specified GUID
            await (await this.client).api("/administrativeUnits/" + GUID).delete();

            // Return true for a successful operation
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADAdminUnit - catch statement");
            };
        };
    };

    // Create a new settings catalog with the specified settings
    async newSettingsCatalog(name: string, description: string, roleScopeTagID: string[], settings: MicrosoftGraphBeta.DeviceManagementConfigurationSetting[]): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicy> {
        // Validate input
        if (typeof name !== "string" || name.length > 1000) { throw new InternalAppError("The name is too long, can't be longer than 1000 chars!", "Invalid Input", "GraphClient - newSettingsCatalog - Input Validation") };
        if (typeof description !== "string" || description.length > 1000) { throw new InternalAppError("The description is too long, can't be longer than 1000 chars!", "Invalid Input", "GraphClient - newSettingsCatalog - Input Validation") };
        if (typeof roleScopeTagID !== "object" || roleScopeTagID.length == 0) { throw new InternalAppError("The role scope tag IDs must be an array of numbers in string format and not be empty!", "Invalid Input", "GraphClient - newSettingsCatalog - Input Validation") };
        // TODO: Convert to scope tag name instead of the ID of the tag
        // Loop through each of the indexes and ensure that they are parsable to numbers
        for (let index = 0; index < roleScopeTagID.length; index++) {
            // Expose a specific ID
            const ID = roleScopeTagID[index];
            // Parse the string to a number
            const parsedNum = Number.parseInt(ID);

            // Check to make sure the string is a parsable number
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) { throw new InternalAppError("Please specify a number for the role scope tag IDs!", "Invalid Input", "GraphClient - newSettingsCatalog - Input Validation") };
        }
        if (typeof settings !== "object" || settings.length == 0 || !validateSettingCatalogSettings(settings)) { throw new InternalAppError("The settings object is not in the right format, please use the correct format!", "Invalid Input", "GraphClient - newSettingsCatalog - Input Validation") }

        // Build the post body for the new setting catalog object
        let postBody: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy = {
            name: name,
            description: description,
            roleScopeTagIds: roleScopeTagID,
            platforms: "windows10",
            technologies: "mdm",
            settings: settings
        };

        // Catch any error on catalog creation
        try {
            // Create the catalog and return the result
            return await (await this.client).api("/deviceManagement/configurationPolicies").post(postBody);
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - newSettingsCatalog - catch statement");
            };
        };
    };

    // Retrieve Endpoint Manager Settings Catalog list. Can pull individual catalogs based upon GUID.
    async getSettingsCatalog(GUID?: string): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicy[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the settings catalog page so that it is available to callers.
            let settingsCatalogPage: PageCollection;

            // If a GUID is specified, return the specified settings catalog.
            if (validateGUID(GUID)) {
                // Grab and return the specified settings catalog.
                return [await (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).expand("settings").get()];
                // If no GUID is specified, return all settings catalogs.
            } else if (typeof GUID === "undefined") {
                // Grab all device configs.
                settingsCatalogPage = await (await this.client).api("/deviceManagement/configurationPolicies").expand("settings").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input", "GraphClient - getSettingsCatalog - Input Validation");
            };

            // Process the page collection to its base form (DeviceManagementConfigurationPolicy)
            const settingsCatalogList: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy[] = await this.iteratePage(settingsCatalogPage);

            // Return the processed data.
            return settingsCatalogList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getSettingsCatalog - catch statement");
            };
        };
    };

    // Update the specified setting catalog's metadata.
    // The settings are updated in the method "updateSettingsCatalogSettings()".
    // This is because of how the GraphAPI is designed, two posts are needed to update a settings catalog as the settings property is a nav property instead of an entity.
    async updateSettingsCatalog(GUID: string, name: string, description: string, roleScopeTagID: string[], settings: MicrosoftGraphBeta.DeviceManagementConfigurationSetting[]): Promise<boolean> {
        // Validate input
        if (!validateGUID(GUID)) { throw new InternalAppError("The GUID is not in the correct format!", "Invalid Input", "GraphClient - updateSettingsCatalog - Input Validation") };
        if (typeof name !== "string" || name.length > 1000) { throw new InternalAppError("The name is too long, can't be longer than 1000 chars!", "Invalid Input", "GraphClient - updateSettingsCatalog - Input Validation") };
        if (typeof description !== "string" || description.length > 1000) { throw new InternalAppError("The description is too long, can't be longer than 1000 chars!", "Invalid Input", "GraphClient - updateSettingsCatalog - Input Validation") };
        if (!validateStringArray(roleScopeTagID)) { throw new InternalAppError("The role scope tag IDs must be an array of numbers in string format and not be empty!", "Invalid Input", "GraphClient - updateSettingsCatalog - Input Validation") }
        if (!validateSettingCatalogSettings(settings)) { throw new InternalAppError("The Settings Catalog Settings aren't in the right format!", "Invalid Input", "GraphClient - updateSettingsCatalog - Input Validation") };
        // TODO: change to scope tag name instead of the ID
        // Loop through each of the indexes and ensure that they are parsable to numbers
        for (let index = 0; index < roleScopeTagID.length; index++) {
            // Expose a specific ID
            const ID = roleScopeTagID[index];
            // Parse the string to a number
            const parsedNum = Number.parseInt(ID);

            // Check to make sure the string is a parsable number
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) { throw new InternalAppError("Please specify a number for the role scope tag IDs!", "Invalid Input", "GraphClient - updateSettingsCatalog - Input Validation") };
        };

        // Build the post body for the new setting catalog object
        let patchBody: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy = {
            name: name,
            description: description,
            roleScopeTagIds: roleScopeTagID,
            platforms: "windows10",
            technologies: "mdm",
            settings: settings
        }

        // Catch any error on catalog update
        try {
            // Send the updated settings catalog 
            await (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).put(patchBody);

            // Return true to indicate a successful operation
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - updateSettingsCatalog - catch statement");
            };
        };
    };

    // Remove a settings catalog based on its GUID
    async removeSettingsCatalog(GUID: string): Promise<boolean> {
        // Validate input
        if (!validateGUID(GUID)) { throw new InternalAppError("The GUID is not in the correct format!", "Invalid Input", "GraphClient - removeSettingsCatalog - Input Validation") };

        // Attempt to delete the settings catalog
        try {
            // Send the delete command for the specified GUID
            await (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).delete();

            // Return true for a successful operation
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - removeSettingsCatalog - catch statement");
            };
        };
    };

    // Assign the specified device configuration in Endpoint Manager
    async updateConfigurationAssignment(configType: "Settings Catalog", configGUID: string, includeGUID?: string[], excludeGUID?: string[]): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicyAssignment>
    async updateConfigurationAssignment(configType: "Setting Template", configGUID: string, includeGUID?: string[], excludeGUID?: string[]): Promise<MicrosoftGraphBeta.DeviceConfigurationAssignment>
    async updateConfigurationAssignment(configType: "Admin Template", configGUID: string, includeGUID?: string[], excludeGUID?: string[]): Promise<MicrosoftGraphBeta.GroupPolicyConfigurationAssignment>
    async updateConfigurationAssignment(configType: string, configGUID: string, includeGUID?: string[], excludeGUID?: string[]) {
        // Validate inputs
        if (typeof configType !== "string" && configType !== "Settings Catalog" && configType !== "Setting Template" && configType !== "Admin Template") { throw new InternalAppError("The config type parameter only accepts the strings: 'Settings Catalog', 'Device', and 'Admin Template' as values.", "Invalid Input", "GraphClient - updateConfigurationAssignment - Input Validation") };
        if (!validateGUID(configGUID)) { throw new InternalAppError("The specified GUID for the config GUID is not valid!", "Invalid Input", "GraphClient - updateConfigurationAssignment - Input Validation") }
        if (typeof includeGUID !== "undefined" && !validateGUIDArray(includeGUID)) { throw new InternalAppError("The specified array of included group GUIDs is not valid!", "Invalid Input", "GraphClient - updateConfigurationAssignment - Input Validation") };
        if (typeof excludeGUID !== "undefined" && !validateGUIDArray(excludeGUID)) { throw new InternalAppError("The specified array of excluded group GUIDs is not valid!", "Invalid Input", "GraphClient - updateConfigurationAssignment - Input Validation") };

        // Build the assignment object post body
        const postBody = endpointGroupAssignmentTarget(includeGUID, excludeGUID);

        // Attempt execution and catch errors gracefully
        try {
            // Route execution based on the config type to be assigned
            switch (configType) {
                case "Settings Catalog":
                    // Assign the specified settings catalog
                    return await (await this.client).api("/deviceManagement/configurationPolicies/" + configGUID + "/assign").post(postBody);
                case "Setting Template":
                    // Assign the specified device settings
                    return await (await this.client).api("/deviceManagement/deviceConfigurations/" + configGUID + "/assign").post(postBody);
                case "Admin Template":
                    // Assign the specified administrative template (GPO)
                    return await (await this.client).api("/deviceManagement/groupPolicyConfigurations/" + configGUID + "/assign").post(postBody);
                default:
                    throw new InternalAppError("The switch stopped at the default statement, this should not have happened. configType: " + configType, "Unknown", "GraphClient - updateConfigurationAssignment - switch statement - default case");
            };
            // If error occurred, return error to sender.
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - updateConfigurationAssignment - catch statement");
            };
        };
    };

    // Create an Azure AD Conditional Access Policy using the specified settings.
    async newAADCAPolicy(name: string, settings: MicrosoftGraphBeta.ConditionalAccessPolicy, state: "enabled" | "disabled" | "enabledForReportingButNotEnforced"): Promise<MicrosoftGraphBeta.ConditionalAccessPolicy> {
        // Validate inputs
        if (name.length > 256 && typeof name !== "string") { throw new InternalAppError("The length of the name can't be longer than 256 characters or the data is not a string!", "Invalid Input", "GraphClient - newAADCAPolicy - Input Validation") };
        if (!validateConditionalAccessSetting(settings) && typeof settings !== "object") { throw new InternalAppError("The settings object is not in the correct format!", "Invalid Input", "GraphClient - newAADCAPolicy - Input Validation") };
        if (state !== "enabled" && state !== "disabled" && state !== "enabledForReportingButNotEnforced") { throw new InternalAppError("The state parameter must be one of the following values: enabled, disabled, enabledForReportingButNotEnforced!", "Invalid Input", "GraphClient - newAADCAPolicy - Input Validation") };

        // Set the name of the CA Policy
        settings.displayName = name;

        // Set the state of the CA Policy
        settings.state = state;

        // Attempt the CA Policy creation.
        try {
            // Execute the post method against the graph using the specified post body (settings)
            return await (await this.client).api("/identity/conditionalAccess/policies").post(settings);
            // Catch any error thrown from the AJAX post call
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - newAADCAPolicy - catch statement");
            };
        };
    };

    // Retrieve Azure AD Conditional Access Policy list. Can pull individual policies based upon GUID.
    async getAADCAPolicy(GUID?: string): Promise<MicrosoftGraphBeta.ConditionalAccessPolicy[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the AAD CA page so that it is available to callers.
            let aadCAPage: PageCollection;

            // If a GUID is specified, return the specified AAD CA policy.
            if (validateGUID(GUID)) {
                // Grab and return the specified CA Policy.
                return [await (await this.client).api("/identity/conditionalAccess/policies/" + GUID).get()];
                // If no GUID is specified, return all AAD CA policies.
            } else if (typeof GUID === "undefined") {
                // Grab all AAD CA policies.
                aadCAPage = await (await this.client).api("/identity/conditionalAccess/policies").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input", "GraphClient - getAADCAPolicy - Input Validation");
            };

            // Process the page collection to its base form (ConditionalAccessPolicy)
            const aadCAList: MicrosoftGraphBeta.ConditionalAccessPolicy[] = await this.iteratePage(aadCAPage);

            // Return the processed data.
            return aadCAList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADCAPolicy - catch statement");
            };
        };
    };

    // Update the specified Conditional Access Policy.
    async updateAADCAPolicy(GUID: string, name: string, settings: MicrosoftGraphBeta.ConditionalAccessPolicy, state: "enabled" | "disabled" | "enabledForReportingButNotEnforced"): Promise<boolean> {
        // Validate inputs
        if (!validateGUID(GUID) || typeof GUID !== "string") { throw new InternalAppError("The specified ID is not a valid GUID!", "Invalid Input", "GraphClient - updateAADCAPolicy - Input Validation") };
        if (name.length > 256 || typeof name !== "string") { throw new InternalAppError("The length of the name can't be longer than 256 characters or the data is not a string!", "Invalid Input", "GraphClient - updateAADCAPolicy - Input Validation") };
        if (!validateConditionalAccessSetting(settings) && typeof settings !== "object") { throw new InternalAppError("The settings object is not in the correct format!", "Invalid Input", "GraphClient - updateAADCAPolicy - Input Validation") };
        if (state !== "enabled" && state !== "disabled" && state !== "enabledForReportingButNotEnforced") { throw new InternalAppError("The state parameter must be one of the following values: enabled, disabled, enabledForReportingButNotEnforced!", "Invalid Input", "GraphClient - updateAADCAPolicy - Input Validation") };

        // Set the name of the CA Policy
        settings.displayName = name;

        // Set the state of the CA Policy
        settings.state = state;

        // Attempt the CA Policy creation.
        try {
            // Execute the post method against the graph using the specified post body (settings)
            await (await this.client).api("/identity/conditionalAccess/policies/" + GUID).patch(settings);

            // Return true if successful (the try catch will catch unsuccessful patch methods)
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - updateAADCAPolicy - catch statement");
            };
        }
    };

    // Remove the specified Conditional Access Policy.
    async removeAADCAPolicy(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (!validateGUID(GUID)) { throw new InternalAppError("The specified GUID is not a valid GUID!", "Invalid Input", "GraphClient - removeAADCAPolicy - Input Validation") };

        // Attempt to delete the conditional access policy
        try {
            // Send the delete command for the specified GUID
            await (await this.client).api("/identity/conditionalAccess/policies/" + GUID).delete();

            // Return true for a successful operation
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - removeAADCAPolicy - catch statement");
            };
        };
    };

    // Get the specified Microsoft Endpoint Manager Device
    async getMEMDevice(deviceID?: string): Promise<MicrosoftGraphBeta.ManagedDevice[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the AAD CA page so that it is available to callers.
            let memDevicePage: PageCollection;

            // If a GUID is specified, return the specified AAD CA policy.
            if (validateGUID(deviceID)) {
                // Grab and return the specified CA Policy.
                memDevicePage = await (await this.client).api("/deviceManagement/managedDevices").filter("azureADDeviceId eq '" + deviceID + "'").get();
                // If no GUID is specified, return all AAD CA policies.
            } else if (typeof deviceID === "undefined") {
                // Grab all AAD CA policies.
                memDevicePage = await (await this.client).api("/deviceManagement/managedDevices").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is not a string and a valid GUID!", "Invalid Input", "GraphClient - getMEMDevice - Input Validation");
            };

            // Process the page collection to its base form (ManagedDevice)
            const memDeviceList: MicrosoftGraphBeta.ManagedDevice[] = await this.iteratePage(memDevicePage);

            // Return the processed data.
            return memDeviceList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getMEMDevice - catch statement");
            };
        };
    };

    // Returns the device ID from the
    async getAADDevice(deviceID?: string): Promise<MicrosoftGraphBeta.Device[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the device page so that it is available to callers.
            let devicePage: PageCollection;

            // Check the presence of the device ID parameter
            if (typeof deviceID === "undefined") { // If no device ID is specified, return all devices
                // Grab an initial device page collection
                devicePage = await (await this.client).api("/devices").get();
            } else if (validateGUID(deviceID)) {
                // Grab the specified device based on its AAD Device ID.
                devicePage = await (await this.client).api("/devices").filter("deviceId eq '" + deviceID + "'").get();
            } else {
                // If the deviceID is specified and it isn't a GUID, throw an error
                throw new InternalAppError("The Object ID is not a valid GUID!", "Invalid Input", "GraphClient - getAADDevice - Input Validation")
            };

            // Process the page collection to its base form (Device)
            const deviceList: MicrosoftGraphBeta.RoleScopeTag[] = await this.iteratePage(devicePage);

            // Return the processed data.
            return deviceList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAADDevice - catch statement");
            };
        };
    };

    // Sets extension attribute 1's value on the specified AAD device's device ID
    async updateAADDeviceExtensionAttribute(deviceID: string, value?: string): Promise<boolean> {
        // Validate Input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The Device ID is not a valid GUID!", "Invalid Input", "GraphClient - updateAADDeviceExtensionAttribute - Input Validation") };
        if (typeof value !== "string") { value = "" };

        // initialize variables
        let aadDeviceObject: MicrosoftGraphBeta.Device[];


        // Build the patch body for the XHR to use
        let patchBody: MicrosoftGraphBeta.Device = {
            "extensionAttributes": {
                "extensionAttribute1": value
            }
        };

        // Write debug info
        writeDebugInfo(deviceID, "Extension Attribute device ID:");
        writeDebugInfo(patchBody, "Extension Attribute Patch Body:");

        // Kill execution errors
        try {
            // Convert the Object ID to a Device ID
            aadDeviceObject = await this.getAADDevice(deviceID);
        } catch (error) {
            // Throw an error
            throw new InternalAppError("Unable to get device object", "Request Failed", "GraphClient - updateAADDeviceExtensionAttribute - Get AAD Device Object");
        };

        // Catch execution errors
        try {
            // Write debug info
            writeDebugInfo(aadDeviceObject, "AAD Device Object:");

            // Update the Extension Attribute for the specified device
            await (await this.client).api("/devices/" + aadDeviceObject[0].id).patch(patchBody);
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - updateAADDeviceExtensionAttribute - API PATCH Operation");
            };
        };

        // Return true for successful operation
        return true;
    };

    // Get all only the specified Autopilot Device from Endpoint Manager
    async getAutopilotDevice(AADDeviceID?: string): Promise<MicrosoftGraphBeta.WindowsAutopilotDeviceIdentity[]> {
        // Attempt to execute and catch errors
        try {
            // Pre-define the Autopilot device page so that it is available to callers.
            let autopilotDevicePage: PageCollection;

            // Route the Graph API calls based on the AAD Device ID presence.
            if (typeof AADDeviceID === "undefined") { // If no GUID is specified.
                // Request all Autopilot Devices.
                autopilotDevicePage = await (await this.client).api("/deviceManagement/windowsAutopilotDeviceIdentities").get();
            } else if (validateGUID(AADDeviceID)) { // If a GUID is specified.
                // Grab and return the specified Autopilot device.
                autopilotDevicePage = await (await this.client).api("/deviceManagement/windowsAutopilotDeviceIdentities").filter("azureActiveDirectoryDeviceId eq '" + AADDeviceID + "'").get();
            } else {
                // Input is unexpected, throw an error and halt execution.
                throw new InternalAppError("The GUID parameter is a valid GUID!", "Invalid Input", "GraphClient - getAutopilotDevice - Input Validation");
            };

            // Process the page collection to its base form (WindowsAutopilotDeviceIdentity)
            const autopilotDeviceList: MicrosoftGraphBeta.WindowsAutopilotDeviceIdentity[] = await this.iteratePage(autopilotDevicePage);

            // Return the processed data.
            return autopilotDeviceList;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - getAutopilotDevice - catch statement");
            };
        };
    };

    // Wipe the specified device using Endpoint Manager (this specific wipe is an Autopilot reset)
    async wipeMEMDevice(deviceID: string): Promise<boolean> {
        // Validate input
        if (!validateGUID(deviceID)) { throw new InternalAppError("The GUID specified is not a proper GUID!", "Invalid Input", "GraphClient - wipeMEMDevice - Input Validation") };

        // Attempt to wipe the device
        try {
            // Get MS Endpoint Manager's internal device object from the specified Azure AD Device ID
            const memDeviceObject = await this.getMEMDevice(deviceID);

            // Check to make sure we have an expected MEM Device Object and it is not empty or has more than one
            if (memDeviceObject.length === 0) { // If no devices were returned, don't execute
                // Throw an error
                throw new InternalAppError("The specified device does not exist", "Retrieval Error", "GraphClient - wipeMEMDevice - mem Device Count Check");
            } else if (memDeviceObject.length > 1) { // Check for more than one mem device on the aad device id
                // Throw an error
                throw new InternalAppError("There was more than one device mapped to that device ID", "Retrieval Error", "GraphClient - wipeMEMDevice - mem Device Count Check");
            };

            // Extract the ID from the mem device object
            const memDeviceID = memDeviceObject[0].id;

            // Define the type of wipe that will take place
            const wipeConfig = {
                "keepEnrollmentData": true,
                "keepUserData": false,
                "useProtectedWipe": true
            }

            // Send the delete command for the specified MEM Device ID (Not ot be confused with MEM Device ID)
            await (await this.client).api("/deviceManagement/managedDevices/" + memDeviceID + "/wipe").post(wipeConfig);

            // Return true for a successful operation
            return true;
        } catch (error) {
            // Check to see if the error parameter is an instance of the Error class.
            if (error instanceof Error) {
                // Return the error in a well known format using the Internal App Error class
                throw new InternalAppError(error.message, error.name, error.stack);
            } else {
                // Return the unknown error in a known format
                throw new InternalAppError("Thrown error is not an error", "Unknown", "GraphClient - wipeMEMDevice - catch statement");
            };
        };
    };
};