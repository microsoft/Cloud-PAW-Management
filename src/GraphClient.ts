import { validateStringArray, validateGUID, validateGUIDArray, validateEmail, validateSettingCatalogSettings, validateConditionalAccessSetting } from "./Utility";
import { endpointGroupAssignmentTarget } from "./RequestGenerator";
import { Client, ClientOptions, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import "isomorphic-fetch";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";
import type { ChainedTokenCredential } from "@azure/identity"

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
            throw new Error("Page iterator breakdown: " + error);
        };
    };

    // Create a new role scope tag in Endpoint Manager
    async newMEMScopeTag(scopeTagName: string, description?: string): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Validate Inputs
        if (typeof scopeTagName !== "string") { throw new Error("The ScopeTagName has to be a string!") };
        if (scopeTagName.length > 128) { throw new Error("The ScopeTagName can't be longer than 128 chars!") };
        if (typeof description !== "undefined" && typeof description !== "string") { throw new Error("The description must be a string!") };
        if (typeof description === "string" && description.length > 1024) { throw new Error("Description can't be longer than 1024 chars!") };

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
            }

            // Create the scope tag and return the result.
            return await (await this.client).api("/deviceManagement/roleScopeTags").post(scopeTagBody);

        // If something goes wrong, return the error.
        } catch (error) {
            // return the error data to the caller.
            return error;
        }
    };

    // Get the specified scope tag or get all scope tags
    async getMEMScopeTag(name?: string): Promise<MicrosoftGraphBeta.RoleScopeTag[]> {
        // If no name is specified, return all scope tags
        if (typeof name === "undefined") {
            // Grab the list of all Scope Tags from MEM
            try {
                // Grab an initial MEM Scope page collection
                const scopeTagPage: PageCollection = await (await this.client).api("/deviceManagement/roleScopeTags").get();

                // Process the page collection to its base form (RoleScopeTag)
                const scopeTagList: MicrosoftGraphBeta.RoleScopeTag[] = await this.iteratePage(scopeTagPage);

                // Return the processed data.
                return scopeTagList;
            } catch (error) {
                // If there is an error, return the error details to the caller.
                return error;
            }
        } else {
            // Validate the proper data for the name of the scope tag
            if (typeof name === "string" && name.length <= 128) {
                // Grab the specified device from MEM
                try {
                    // Grab the specified MEM Scope based on its unique name.
                    const scopeTagPage: PageCollection = await (await this.client).api("/deviceManagement/roleScopeTags").filter("displayName eq '" + name + "'").get();

                    // Process the page collection to its base form (RoleScopeTag)
                    const scopeTagList: MicrosoftGraphBeta.RoleScopeTag[] = await this.iteratePage(scopeTagPage);

                    // Return the processed data.
                    return scopeTagList;
                } catch (error) {
                    // If there is an error, return the error details to the caller.
                    return error;
                };
            } else {
                // If the string is greater than 128 chars or not a string, throw an error.
                throw new Error("The specified name is not a proper string!");
            };
        };
    };

    // Update the specified role scope tag in Endpoint Manager
    async updateMEMScopeTag(name: string, description?: string, ID?: number): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Validate input
        if (typeof name !== "string" || name.length > 128) { throw new Error("The name is not a valid string or is greater than 128 chars!") };
        if (typeof description === "string" && description.length > 1024) { throw new Error("The description can't be longer than 1024 chars!") };
        if (typeof ID !== "undefined" && typeof ID !== "number") { throw new Error("The ID needs to be a whole number!") };
        if (typeof ID === "number" && (!Number.isInteger(ID) || ID <= 0)) { throw new Error("The ID has to be a whole number above 0") };

        // Build the initial scope tag object for the update process to use
        let scopeTagBody: MicrosoftGraphBeta.RoleScopeTag = {
            "displayName": name
        }

        // If the description is provided, add it to the scope tag body
        if (typeof description === "string") {
            // Create the description property and set it to the function parameter value
            scopeTagBody.description = description
        }

        // Catch execution errors
        try {
            if (typeof ID === "undefined") {
                // Get an instance of the specified scope tag
                const scopeTagInstance = (await this.getMEMScopeTag(name))[0];

                // Update the scope tag with the specified data
                return (await this.client).api("/deviceManagement/roleScopeTags/" + scopeTagInstance.id).patch(scopeTagBody);
            } else {
                // Update the scope tag with the specified data
                return (await this.client).api("/deviceManagement/roleScopeTags/" + ID).patch(scopeTagBody);
            }
        } catch (error) {
            // If an error happens, return the error data
            return error;
        }
    };

    // Delete the specified scope tag
    async removeMEMScopeTag(id: number): Promise<boolean> {
        // Validate the input is a number
        if (typeof id !== "number") {
            // If it isn't a number, throw an error to the caller
            throw new Error("ID must be a number!");
        }

        // Catch error on execution
        try {
            // Delete the specified scope tag
            await (await this.client).api("/deviceManagement/roleScopeTags/" + id).delete();
            // Return true indicating successful operation
            return true
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    };

    // TODO: finish the CRUD operations for normal configs
    async newDeviceConfig(name: string, roleScopeTagID: string[], settingsBase: MicrosoftGraphBeta.DeviceConfiguration, description?: string) {
        // https://docs.microsoft.com/en-us/graph/api/resources/intune-device-cfg-conceptual?view=graph-rest-beta
    }

    // TODO: finish the CRUD operations for normal configs
    // Retrieve Microsoft Endpoint Manager configuration profile list. Can pull individual profile based upon GUID
    async getDeviceConfig(GUID?: string): Promise<MicrosoftGraphBeta.GroupPolicyConfiguration[]> {
        if (typeof GUID === "undefined") {
            // Retrieve a list of device configurations from Endpoint Manager
            const deviceConfigPage: PageCollection = await (await this.client).api("/deviceManagement/deviceConfigurations").get();

            // Process the page collection to its base form (DeviceConfiguration)
            const deviceConfigList: MicrosoftGraphBeta.DeviceConfiguration[] = await this.iteratePage(deviceConfigPage);

            // Return the processed data
            return deviceConfigList;
        } else {
            // Validate user input to ensure they don't slip us a mickey
            if (validateGUID(GUID)) {
                // Retrieve the specified device configurations from Endpoint Manager
                const deviceConfigPage: MicrosoftGraphBeta.DeviceConfiguration = await (await this.client).api("/deviceManagement/deviceConfigurations/" + GUID).get();

                // Convert the result to an array for type consistency.
                const deviceConfigList = [deviceConfigPage];

                // Return the processed data
                return deviceConfigList;
            } else {
                // Notify the caller that the GUID isn't right if GUID validation fails.
                throw new Error("The parameter specified is not a valid GUID!");
            };
        }
    };

    // TODO: finish the CRUD operations for normal configs
    async updateDeviceConfig() { };

    // Remove the specified Device Configuration
    async removeDeviceConfig(GUID: string) {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to delete the device configuration
            try {
                // Send the delete command for the specified GUID
                await (await this.client).api("/deviceManagement/deviceConfigurations/" + GUID).delete();

                // Return true for a successful operation
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller
                return error;
            }
        } else {
            // If the GUID is not in the right format, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        }
    };

    // TODO: finish the CRUD operations for Admin Template policies
    async newDeviceGroupPolicyConfig() { }

    // TODO: finish the CRUD operations for Admin Template policies
    // Retrieve Microsoft Endpoint Manager Group Policy configuration list. Can pull individual policy based upon GUID
    async getDeviceGroupPolicyConfig(GUID?: string): Promise<MicrosoftGraphBeta.GroupPolicyConfiguration[]> {
        if (typeof GUID === "undefined") {
            // Retrieve the specified device configurations from Endpoint Manager
            const deviceGroupPolicyPage: PageCollection = await (await this.client).api("/deviceManagement/groupPolicyConfigurations/").get();

            // Process the page collection to its base form (DeviceConfiguration)
            const deviceGroupPolicyList: MicrosoftGraphBeta.GroupPolicyConfiguration[] = await this.iteratePage(deviceGroupPolicyPage);

            // Return the processed data
            return deviceGroupPolicyList;
        } else {
            // Validate user input to ensure they don't slip us a mickey
            if (validateGUID(GUID)) {
                // Retrieve the specified device configurations from Endpoint Manager
                const deviceGroupPolicyPage: MicrosoftGraphBeta.GroupPolicyConfiguration = await (await this.client).api("/deviceManagement/groupPolicyConfigurations/" + GUID).get();

                // Convert the result to an array for type consistency.
                const deviceGroupPolicyList = [deviceGroupPolicyPage];

                // Return the processed data
                return deviceGroupPolicyList;
            } else {
                // Notify the caller that the GUID isn't right if GUID validation fails.
                throw new Error("The parameter specified is not a valid GUID!");
            };
        }
    }

    // TODO: finish the CRUD operations for Admin Template policies
    async updateDeviceGroupPolicyConfig() { }
    async removeDeviceGroupPolicyConfig() { }

    // Create a new security group with the specified options
    async newAADGroup(name: string, description?: string, roleAssignable?: boolean): Promise<MicrosoftGraphBeta.Group> {

        // Validate name length is not too long for the graph
        if (name.length > 120) { throw new Error("The name is too long, can't be longer than 120 chars!") };

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
        if (typeof description !== "undefined") {
            // Validate that the description is of the correct length
            if (description.length > 1024) { throw new Error("The description cannot be longer than 1024 characters!") };

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
            // If there is an error, return the error details
            return error;
        };
    };

    // Retrieve Azure Active Directory user list. Can pull individual users based upon GUID or the UPN
    async getAADUser(ID?: string): Promise<MicrosoftGraphBeta.User[]> {
        // If no users are specified, list all users
        if (typeof ID === "undefined") {
            // Grab the list of all users from AAD
            try {
                // Grab an initial AAD User page collection
                const aadUserPage: PageCollection = await (await this.client).api("/users").get();

                // Process the page collection to its base form (User)
                const aadUserList: MicrosoftGraphBeta.User[] = await this.iteratePage(aadUserPage);

                // Return the processed data.
                return aadUserList;
            } catch (error) {
                // If there is an error, return the error details to the caller.
                return error;
            }
        } else {
            // Validate the GUID or UPN are proper IDs for AAD users
            if (validateGUID(ID) || validateEmail(ID)) {
                // Grab the specified user from AAD
                try {
                    // Grab the specified user based on its AAD UPN or GUID.
                    const aadUserPage: PageCollection = await (await this.client).api("/users/" + ID).get();

                    // Process the page collection to its base form (User)
                    const aadUserList: MicrosoftGraphBeta.User[] = await this.iteratePage(aadUserPage);

                    // Return the processed data.
                    return aadUserList;
                } catch (error) {
                    // If there is an error, return the error details to the caller.
                    return error;
                };
            } else {
                // If the GUID is not in the right format, throw an error.
                throw new Error("The ID specified is not a proper GUID or UPN!");
            };
        };
    };

    // Retrieve Azure Active Directory (AAD) group list. Can pull individual groups based upon the group's GUID
    async getAADGroup(GUID?: string): Promise<MicrosoftGraphBeta.Group[]> {
        if (typeof GUID === "undefined") {
            // Grab an initial group page collection
            const groupPage: PageCollection = await (await this.client).api("/groups").get();

            // Process the page collection to its base form (Group)
            const groupList: MicrosoftGraphBeta.Group[] = await this.iteratePage(groupPage);

            // Return the processed data
            return groupList;
        } else {
            if (validateGUID(GUID)) {
                // Retrieve the specified group from AAD
                const groupPage: MicrosoftGraphBeta.Group = await (await this.client).api("/groups/" + GUID).get();

                // Convert the result to an array for type consistency.
                const groupList = [groupPage];

                // Return the processed data
                return groupList;
            } else {
                // Notify the caller that the GUID isn't right if GUID validation fails.
                throw new Error("The parameter specified is not a valid GUID!");
            };
        };
    };

    // Update the specified group
    async updateAADGroup(GUID: string, name: string, description?: string): Promise<boolean> {

        // Ensure the specified GUID is valid
        if (validateGUID(GUID)) {
            // Validate name length is not too long for the graph
            if (name.length > 120) { throw new Error("The name is too long, can't be longer than 120 chars!") };

            // These characters cannot be used in the mailNickName: @()\[]";:.<>,SPACE
            const nicknameRegex = /[\\\]\]@()";:.<>,\s]+/gm;

            // Filter out the non-valid chars from the group name to build a valid nickname
            const nickName = name.replace(nicknameRegex, "");

            // Build the patch request body
            const patchBody: MicrosoftGraphBeta.Group = {
                displayName: name,
                mailNickname: nickName
            }

            // Check to make sure that the description is defined, if it is, configure the description of the group
            if (typeof description !== "undefined") {
                // Validate that the description is of the correct length
                if (description.length > 1024) { throw new Error("The description cannot be longer than 1024 characters!") };

                // Set the description of the group
                patchBody.description = description;
            }

            // Attempt to update a group
            try {
                // Send update command and new values to the specified post
                await (await this.client).api("/groups/" + GUID).patch(patchBody);

                // Return true for successful
                return true;
            } catch (error) {
                // If there was an error, return the error details
                return error;
            }
        } else {
            // If the GUID is not valid, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        }
    };

    // Delete the specified Security Group
    async removeAADGroup(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to delete the group
            try {
                // Send the delete command for the specified GUID
                await (await this.client).api("/groups/" + GUID).delete();

                // Return true for a successful operation
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller
                return error;
            }
        } else {
            // If the GUID is not in the right format, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        }
    };

    // Add a principal to an AAD Group
    async newAADGroupMember(groupGUID: string, addGUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(groupGUID) && validateGUID(addGUID)) {
            // Grab the specified group membership from AAD
            try {
                // Build the post body
                const newMemberBody = {
                    "@odata.id": "https://graph.microsoft.com/beta/directoryObjects/" + addGUID
                };

                // Add the specified principal to the specified AAD Group.
                await (await this.client).api("/groups/" + groupGUID + "/members/$ref").post(newMemberBody);

                // Return the processed data.
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller.
                return error;
            };
        } else {
            // If the GUID is not in the right format, throw an error.
            throw new Error("The GUID specified is not a proper GUID!");
        };
    };

    // List the members of a AAD Group
    async getAADGroupMember(groupGUID: string): Promise<MicrosoftGraphBeta.DirectoryObject[]> {
        // Validate GUID is a proper GUID
        if (validateGUID(groupGUID)) {
            // Grab the specified group membership from AAD
            try {
                // Grab the specified group membership based on the group's GUID.
                const groupMemberPage: PageCollection = await (await this.client).api("/groups/" + groupGUID + "/members").get();

                // Process the page collection to its base form (ManagedDevice)
                const groupMemberList: MicrosoftGraphBeta.DirectoryObject[] = await this.iteratePage(groupMemberPage);

                // Return the processed data.
                return groupMemberList;
            } catch (error) {
                // If there is an error, return the error details to the caller.
                return error;
            };
        } else {
            // If the GUID is not in the right format, throw an error.
            throw new Error("The GUID specified is not a proper GUID!");
        };
    };

    // Remove the specified group member from the specified AAD group
    async removeAADGroupMember(groupGUID: string, removeGUID: string): Promise<boolean> {
        // Validate that the GUIDs are proper GUIDs
        if (validateGUID(groupGUID) && validateGUID(removeGUID)) {
            // Grab the specified group membership from AAD
            try {
                // Remove the specified group member from the group
                await (await this.client).api("/groups/" + groupGUID + "/members/" + removeGUID + "/$ref/").delete();

                // Return that the operation was successful
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller.
                return error;
            };
        } else {
            // If the GUID is not in the right format, throw an error.
            throw new Error("The GUID(s) specified is not a proper GUID!");
        };
    };

    // TODO: Write new AU creator
    async newAADAdminUnit(name: string, description?: string) { }

    // Retrieve Azure Active Directory Administrative Unit (AU) list. Can pull individual AUs based upon GUID.
    async getAADAdminUnit(GUID?: string): Promise<MicrosoftGraphBeta.AdministrativeUnit[]> {
        // If no params are specified, return all objects
        if (typeof GUID === "undefined") {
            // Grab an initial AU page collection
            const adminUnitPage: PageCollection = await (await this.client).api("/administrativeUnits").get();

            // Process the page collection to its base form (AdministrativeUnit)
            const adminUnitList: MicrosoftGraphBeta.AdministrativeUnit[] = await this.iteratePage(adminUnitPage);

            // Return the processed data
            return adminUnitList;
        } else {
            // Validate the string input is a GUID
            if (validateGUID(GUID)) {
                // Retrieve the specified AU from AAD
                const adminUnitPage: MicrosoftGraphBeta.AdministrativeUnit = await (await this.client).api("/administrativeUnits/" + GUID).get();

                // Convert the result to an array for type consistency.
                const adminUnitList = [adminUnitPage];

                // Return the processed data
                return adminUnitList;
            } else {
                // Notify the caller that the GUID isn't right if GUID validation fails.
                throw new Error("The parameter specified is not a valid GUID!");
            };
        }
    };

    // TODO: write the AU updater
    async updateAADAdminUnit(GUID: string, name: string, description?: string) { }

    // Remove the specified Administrative united based on the GUID
    async removeAADAdminUnit(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to delete the AU
            try {
                // Send the delete command for the specified GUID
                await (await this.client).api("/administrativeUnits/" + GUID).delete();

                // Return true for a successful operation
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller
                return error;
            }
        } else {
            // If the GUID is not in the right format, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        };
    };

    // Create a new settings catalog with the specified settings
    async newSettingsCatalog(name: string, description: string, roleScopeTagID: string[], settings: MicrosoftGraphBeta.DeviceManagementConfigurationSetting[]): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicy> {
        // Validate input
        if (typeof name !== "string" || name.length > 1000) { throw new Error("The name is too long, can't be longer than 1000 chars!") };
        if (typeof description !== "string" || description.length > 1000) { throw new Error("The description is too long, can't be longer than 1000 chars!") };
        if (typeof roleScopeTagID !== "object" || roleScopeTagID.length == 0) { throw new Error("The role scope tag IDs must be an array of numbers in string format and not be empty!") }
        // Loop through each of the indexes and ensure that they are parsable to numbers
        for (let index = 0; index < roleScopeTagID.length; index++) {
            // Expose a specific ID
            const ID = roleScopeTagID[index];
            // Parse the string to a number
            const parsedNum = Number.parseInt(ID);

            // Check to make sure the string is a parsable number
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) { throw new Error("Please specify a number for the role scope tag IDs!") };
        }
        if (typeof settings !== "object" || settings.length == 0 || !validateSettingCatalogSettings(settings)) { throw new Error("The settings object is not in the right format, please use the correct format!") }

        // Build the post body for the new setting catalog object
        let postBody: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy = {
            name: name,
            description: description,
            roleScopeTagIds: roleScopeTagID,
            platforms: "windows10",
            technologies: "mdm",
            settings: settings
        }

        // Catch any error on catalog creation
        try {
            // Create the catalog and return the result
            return await (await this.client).api("/deviceManagement/configurationPolicies").post(postBody);
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    };

    // Retrieve Endpoint Manager Settings Catalog list. Can pull individual catalogs based upon GUID.
    async getSettingsCatalog(GUID?: string): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicy[]> {
        // If no params are specified, return all objects
        if (typeof GUID === "undefined") {
            // Grab an initial group page collection
            const settingsCatalogPage: PageCollection = await (await this.client).api("/deviceManagement/configurationPolicies").expand("settings").get();

            // Process the page collection to its base form (DeviceManagementConfigurationPolicy)
            const settingsCatalogList: MicrosoftGraphBeta.AdministrativeUnit[] = await this.iteratePage(settingsCatalogPage);

            // Return the processed data
            return settingsCatalogList;
        } else {
            // Validate the string input is a GUID
            if (validateGUID(GUID)) {
                // Retrieve the specified ConfigurationPolicy from Endpoint Manager
                const settingsCatalogPage: MicrosoftGraphBeta.AdministrativeUnit = await (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).expand("settings").get();

                // Convert the result to an array for type consistency.
                const settingsCatalogList = [settingsCatalogPage];

                // Return the processed data
                return settingsCatalogList;
            } else {
                // Notify the caller that the GUID isn't right if GUID validation fails.
                throw new Error("The parameter specified is not a valid GUID!");
            };
        }
    };

    // Update the specified setting catalog's metadata.
    // The settings are updated in the method "updateSettingsCatalogSettings()".
    // This is because of how the GraphAPI is designed, two posts are needed to update a settings catalog as the settings property is a nav property instead of an entity.
    async updateSettingsCatalog(GUID: string, name: string, description: string, roleScopeTagID: string[], settings: MicrosoftGraphBeta.DeviceManagementConfigurationSetting[]): Promise<boolean> {
        // Validate input
        if (!validateGUID(GUID)) { throw new Error("The GUID is not in the correct format!") };
        if (typeof name !== "string" || name.length > 1000) { throw new Error("The name is too long, can't be longer than 1000 chars!") };
        if (typeof description !== "string" || description.length > 1000) { throw new Error("The description is too long, can't be longer than 1000 chars!") };
        if (!validateStringArray(roleScopeTagID)) { throw new Error("The role scope tag IDs must be an array of numbers in string format and not be empty!") }
        if (!validateSettingCatalogSettings(settings)) { throw new Error("The Settings Catalog Settings aren't in the right format!") };
        // Loop through each of the indexes and ensure that they are parsable to numbers
        for (let index = 0; index < roleScopeTagID.length; index++) {
            // Expose a specific ID
            const ID = roleScopeTagID[index];
            // Parse the string to a number
            const parsedNum = Number.parseInt(ID);

            // Check to make sure the string is a parsable number
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) { throw new Error("Please specify a number for the role scope tag IDs!") };
        }

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
            (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).put(patchBody);

            return true;
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    };

    // Remove a settings catalog based on its GUID
    async removeSettingsCatalog(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to delete the settings catalog
            try {
                // Send the delete command for the specified GUID
                await (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).delete();

                // Return true for a successful operation
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller
                return error;
            }
        } else {
            // If the GUID is not in the right format, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        };
    };

    // Assign the specified device configuration in Endpoint Manager
    async updateConfigurationAssignment(configType: "Settings Catalog" | "Setting Template" | "Admin Template", configGUID: string, includeGUID?: string[], excludeGUID?: string[]) {
        // Validate inputs
        if (typeof configType !== "string" && configType !== "Settings Catalog" && configType !== "Setting Template" && configType !== "Admin Template") { throw new Error("The config type parameter only accepts the strings: 'Settings Catalog', 'Device', and 'Admin Template' as values.") };
        if (!validateGUID(configGUID)) { throw new Error("The specified GUID for the config GUID is not valid!") }
        if (typeof includeGUID !== "undefined" && !validateGUIDArray(includeGUID)) { throw new Error("The specified array of included group GUIDs is not valid!") };
        if (typeof excludeGUID !== "undefined" && !validateGUIDArray(excludeGUID)) { throw new Error("The specified array of excluded group GUIDs is not valid!") };

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
                    throw new Error("The switch stopped at the default statement, this should not have happened. configType: " + configType);
            }
            // If error occurred, return error to sender.
        } catch (error) {
            return error;
        }
    };

    // Create an Azure AD Conditional Access Policy using the specified settings.
    async newAADCAPolicy(name: string, settings: MicrosoftGraphBeta.ConditionalAccessPolicy, state: "enabled" | "disabled" | "enabledForReportingButNotEnforced"): Promise<MicrosoftGraphBeta.ConditionalAccessPolicy> {
        // Validate inputs
        if (name.length > 256 && typeof name !== "string") { throw new Error("The length of the name can't be longer than 256 characters or the data is not a string!") };
        if (!validateConditionalAccessSetting(settings) && typeof settings !== "object") { throw new Error("The settings object is not in the correct format!") };
        if (state !== "enabled" && state !== "disabled" && state !== "enabledForReportingButNotEnforced") { throw new Error("The state parameter must be one of the following values: enabled, disabled, enabledForReportingButNotEnforced!") };

        // Set the name of the CA Policy
        settings.displayName = name;

        // Set the state of the CA Policy
        settings.state = state;

        // Attempt the CA Policy creation.
        try {
            // Execute the post method against the graph using the specified post body (settings)
            return await (await this.client).api("/identity/conditionalAccess/policies").post(settings);
        } catch (error) {
            // If an error happened, return the error details
            return error;
        }
    };

    // Retrieve Azure AD Conditional Access Policy list. Can pull individual policies based upon GUID.
    async getAADCAPolicy(GUID?: string): Promise<MicrosoftGraphBeta.ConditionalAccessPolicy[]> {
        // If no params are specified, return all objects
        if (typeof GUID === "undefined") {
            // Grab an initial group page collection
            const conditionalAccessPolicyPage: PageCollection = await (await this.client).api("/identity/conditionalAccess/policies").get();

            // Process the page collection to its base form (ConditionalAccessPolicy)
            const conditionalAccessPolicyList: MicrosoftGraphBeta.ConditionalAccessPolicy[] = await this.iteratePage(conditionalAccessPolicyPage);

            // Return the processed data
            return conditionalAccessPolicyList;
        } else {
            // Validate the string input is a GUID
            if (validateGUID(GUID)) {
                // Retrieve the specified ConfigurationPolicy from Endpoint Manager
                const conditionalAccessPolicy: MicrosoftGraphBeta.ConditionalAccessPolicy = await (await this.client).api("/identity/conditionalAccess/policies/" + GUID).get();

                // Convert the result to an array for type consistency.
                const conditionalAccessPolicyList = [conditionalAccessPolicy];

                // Return the processed data
                return conditionalAccessPolicyList;
            } else {
                // Notify the caller that the GUID isn't right if GUID validation fails.
                throw new Error("The parameter specified is not a valid GUID!");
            };
        }
    };

    // Update the specified Conditional Access Policy.
    async updateAADCAPolicy(GUID: string, name: string, settings: MicrosoftGraphBeta.ConditionalAccessPolicy, state: "enabled" | "disabled" | "enabledForReportingButNotEnforced"): Promise<boolean> {
        // Validate inputs
        if (!validateGUID(GUID) || typeof GUID !== "string") { throw new Error("The specified ID is not a valid GUID!") };
        if (name.length > 256 || typeof name !== "string") { throw new Error("The length of the name can't be longer than 256 characters or the data is not a string!") };
        if (!validateConditionalAccessSetting(settings) && typeof settings !== "object") { throw new Error("The settings object is not in the correct format!") };
        if (state !== "enabled" && state !== "disabled" && state !== "enabledForReportingButNotEnforced") { throw new Error("The state parameter must be one of the following values: enabled, disabled, enabledForReportingButNotEnforced!") };

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
            // If an error happened, return the error details
            return error;
        }
    };

    // Remove the specified Conditional Access Policy.
    async removeAADCAPolicy(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to delete the conditional access policy
            try {
                // Send the delete command for the specified GUID
                await (await this.client).api("/identity/conditionalAccess/policies/" + GUID).delete();

                // Return true for a successful operation
                return true;
            } catch (error) {
                // If there is an error, return the error details to the caller
                return error;
            }
        } else {
            // If the GUID is not in the right format, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        };
    };

    // Get the specified Microsoft Endpoint Manager Device
    async getMEMDevice(AADDeviceID?: string): Promise<MicrosoftGraphBeta.ManagedDevice[]> {
        if (typeof AADDeviceID === "undefined") {
            // Grab the list of all devices from MEM
            try {
                // Grab an initial MEM Device page collection
                const memDevicePage: PageCollection = await (await this.client).api("/deviceManagement/managedDevices/").get();

                // Process the page collection to its base form (ManagedDevice)
                const memDeviceList: MicrosoftGraphBeta.ManagedDevice[] = await this.iteratePage(memDevicePage);

                // Return the processed data.
                return memDeviceList;
            } catch (error) {
                // If there is an error, return the error details to the caller.
                return error;
            }
        } else {
            // Validate GUID is a proper GUID
            if (validateGUID(AADDeviceID)) {
                // Grab the specified device from MEM
                try {
                    // Grab the specified MEM devices based on its AAD Device ID.
                    const memDevicePage: PageCollection = await (await this.client).api("/deviceManagement/managedDevices/").filter("azureADDeviceId eq '" + AADDeviceID + "'").get();

                    // Process the page collection to its base form (ManagedDevice)
                    const memDeviceList: MicrosoftGraphBeta.ManagedDevice[] = await this.iteratePage(memDevicePage);

                    // Return the processed data.
                    return memDeviceList;
                } catch (error) {
                    // If there is an error, return the error details to the caller.
                    return error;
                };
            } else {
                // If the GUID is not in the right format, throw an error.
                throw new Error("The GUID specified is not a proper GUID!");
            };
        };
    };

    // Wipe the specified device using Endpoint Manager (this specific wipe is an autopilot reset)
    async wipeMEMDevice(GUID: string): Promise<boolean> {
        // Validate GUID is a proper GUID
        if (validateGUID(GUID)) {
            // Attempt to wipe the device
            try {
                // Get MS Endpoint Manager's internal device ID from the specified Azure AD Device ID
                const memDeviceID = (await this.getMEMDevice(GUID))[0].id

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
                // If there is an error, return the error details to the caller
                return error;
            }
        } else {
            // If the GUID is not in the right format, throw an error
            throw new Error("The GUID specified is not a proper GUID!");
        };
    };
}