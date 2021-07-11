import { GraphClientAuthProvider } from "./Authentication";
import { validateGUID, validateEmail, validateSettingCatalogSettings, validateStringArray } from "./Utility";
import { Client, ClientOptions, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client";
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
        const graphAuthProvider = new GraphClientAuthProvider(await credential);

        // Configure teh initialization system to use the custom graph auth provider
        const clientOptions: ClientOptions = {
            // Configure the auth provider property to be the value of the graph auth constant
            authProvider: graphAuthProvider,
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
            throw new Error("Page iterator breakdown :(");
        };
    };

    // Create a new role scope tag in Endpoint Manager
    async newEndpointScopeTag(scopeTagName: string, description?: string): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Validate the name is of appropriate length
        if (scopeTagName.length > 128) {
            // If the name is too long, throw an error
            throw new Error("You can't have a name longer than 128 characters!");
        // Validate that input is the correct type
        } else if (typeof scopeTagName !== "string" || typeof description !== "string") {
            // Throw an error if it is not!
            throw new Error("Parameter input is string only!");
        }

        // Build the Post body that will be used to create the new tag.
        const postBody: MicrosoftGraphBeta.RoleScopeTag = {
            displayName: scopeTagName
        }

        // Ensure there is less than 1024 characters in the nameDesc
        if (typeof description !== "undefined" && typeof description === "string") {
            // Validate the length of the description
            if (description.length > 1024) {
                // If it is too long, throw an error
                throw new Error("You cannot have more than 1024 characters in the description!")
            } else {
                // Otherwise, allow the description and put it into the post body
                postBody.description = description;
            }
        }

        // Catch any error on group creation
        try {
            // Create the scope tag and return the result
            return await (await this.client).api("/deviceManagement/roleScopeTags").post(postBody);
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    }

    // Return the instance of the specified scope tag
    async getEndpointScopeTag(ID?: number): Promise<MicrosoftGraphBeta.RoleScopeTag[]> {
        if (typeof ID === "undefined") {
            // Retrieve a list of Scope Tags from Endpoint Manager
            const tagListPage: PageCollection = await (await this.client).api("/deviceManagement/roleScopeTags").get();

            // Extract the values from the returned list and type it for easier processing
            const tagList: MicrosoftGraphBeta.RoleScopeTag[] = await this.iteratePage(tagListPage);

            // Return the processed data
            return tagList;
        } else {
            if (typeof ID === "number") {
                // Retrieve the specified Scope Tag from Endpoint Manager
                const tagPage: MicrosoftGraphBeta.RoleScopeTag = await (await this.client).api("/deviceManagement/roleScopeTags/" + ID).get();

                // Convert the result to an array for type consistency.
                const tagPageList = [tagPage];

                // Return the processed data
                return tagPageList;
            } else {
                throw new Error("The ID that has been passed is not a number! Only numbers should be passed!");
            }
        }
    }

    // Update the specified role scope tag in Endpoint Manager
    async updateEndpointScopeTag(id: number, name: string, description?: string): Promise<MicrosoftGraphBeta.RoleScopeTag> {
        // Validate input
        if (typeof id !== "number") {
            // throw an error if the ID is not a number
            throw new Error("ID must be a number!");
        } else if (typeof name !== "string") {
            // Throw an error if the name parameter is not a string
            throw new Error("The name parameter must be a string!");
        } else if (name.length > 128) {
            // Throw an error if the name param is longer than 128 characters
            throw new Error("Name must be less than 128 characters long!");
        }

        // Build the patch body
        let patchBody: MicrosoftGraphBeta.RoleScopeTag = {
            displayName: name
        }

        // Validate if the description parameter has been specified
        if (typeof description !== "undefined") {
            // Validate the character count of the description field
            if (description.length > 1024) {
                // Throw an error if the description is too long
                throw new Error("Description cannot be longer than 1024 characters long!");
            } else {
                // Configure the patch request body's description field to be the value of teh description parameter
                patchBody.description = description;
            }
        }

        // Catch error on execution
        try {
            // Update the specified scope tag
            return await (await this.client).api("/deviceManagement/roleScopeTags/" + id).patch(patchBody);
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    }

    // Delete the specified scope tag
    async removeEndpointScopeTag(id: number): Promise<boolean> {
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
    }

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
    }

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
        if (typeof roleAssignable !== "undefined" && typeof roleAssignable === "boolean") {
            // If the param is present and the correct type, set the post body value for the role assignable
            postBody.isAssignableToRole = roleAssignable;
        }

        // Catch any error on group creation
        try {
            // Create the group and return the result
            return await (await this.client).api("/groups").post(postBody);
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    }

    // Retrieve Azure Active Directory user list. Can pull individual users based upon GUID or the UPN
    async getAADUser(ID?: string): Promise<MicrosoftGraphBeta.User[]> {
        if (typeof ID === "undefined") {
            // Grab an initial user page collection
            const userPage: PageCollection = await (await this.client).api("/users").get();

            // Process the page collection to its base form (User)
            const userList: MicrosoftGraphBeta.User[] = await this.iteratePage(userPage);

            // Return the processed data
            return userList;
        } else {
            // Validate the GUID/UPN to ensure no fishy stuff goes on
            if (validateGUID(ID) || validateEmail(ID)) {
                // Retrieve the specified user from AAD
                const userPage: MicrosoftGraphBeta.User = await (await this.client).api("/users/" + ID).get();

                // Convert the result to an array for type consistency.
                const userList = [userPage];

                // Return the processed data
                return userList;
            } else {
                // Notify the caller that the ID isn't right if ID validation fails.
                throw new Error("The parameter specified is not a valid ID!");
            };
        }
    }

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
        }
    }

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
    }

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
    }

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
    }

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
    }

    // Create a new settings catalog with the specified settings
    async newSettingsCatalog(name: string, description: string, roleScopeTagID: string[] , settings: MicrosoftGraphBeta.DeviceManagementConfigurationSetting[]): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicy> {
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
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) {throw new Error("Please specify a number for the role scope tag IDs!")};
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
    }

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
    }

    // Update the specified setting catalog's metadata.
    // The settings are updated in the method "updateSettingsCatalogSettings()".
    // This is because of how the GraphAPI is designed, two posts are needed to update a settings catalog as the settings property is a nav property instead of an entity.
    async updateSettingsCatalog(GUID: string, name: string, description: string, roleScopeTagID: string[]): Promise<MicrosoftGraphBeta.DeviceManagementConfigurationPolicy> {
        // Validate input
        if (!validateGUID(GUID)) {throw new Error("The GUID is not in the correct format!")};
        if (typeof name !== "string" || name.length > 1000) { throw new Error("The name is too long, can't be longer than 1000 chars!") };
        if (typeof description !== "string" || description.length > 1000) { throw new Error("The description is too long, can't be longer than 1000 chars!") };
        if (!validateStringArray(roleScopeTagID)) { throw new Error("The role scope tag IDs must be an array of numbers in string format and not be empty!") }
        // Loop through each of the indexes and ensure that they are parsable to numbers
        for (let index = 0; index < roleScopeTagID.length; index++) {
            // Expose a specific ID
            const ID = roleScopeTagID[index];
            // Parse the string to a number
            const parsedNum = Number.parseInt(ID);

            // Check to make sure the string is a parsable number
            if (typeof parsedNum === "number" && Object.is(parsedNum, NaN)) {throw new Error("Please specify a number for the role scope tag IDs!")};
        }

        // Build the post body for the new setting catalog object
        let patchBody: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy = {
            name: name,
            description: description,
            roleScopeTagIds: roleScopeTagID
        }

        // Catch any error on catalog update
        try {
            return (await this.client).api("/deviceManagement/configurationPolicies/" + GUID).patch(patchBody);
        } catch (error) {
            // If there is an error, return the error details
            return error
        }
    }

    // TODO: write the settings catalog settings updater
    async updateSettingsCatalogSettings(settings: MicrosoftGraphBeta.DeviceManagementConfigurationSetting[]) {
        return false
    }

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
}