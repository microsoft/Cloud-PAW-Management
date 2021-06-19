import { GraphClientAuthProvider } from "./Authentication";
import { validateGUID, validateEmail } from "./Utility";
import { Client, ClientOptions, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import type { ScopeTagUpdate } from "./Utility";
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

    // Todo: build the scope tag creation system
    async newEndpointScopeTag(scopeTagName: string, description?: string) {
        // Ensure there is less than 1024 characters in the nameDesc
        if (typeof description !== "undefined" && description.length) {
            throw new Error("You cannot have more than 1024 characters in the description!")
        }
    }

    // Todo: build the scope tag update system
    async updateEndpointScopeTag(id: number, nameDesc: ScopeTagUpdate) {
        // Ensure that the method is not being abused by sending nothing in with the update object
        if (typeof nameDesc.name === "undefined" && typeof nameDesc.description === "undefined") {throw new Error("You cannot send an object that does not contain a name or description!")}
        
        // Ensure there is less than 1024 characters in the nameDesc
        if (typeof nameDesc.description !== "undefined" && nameDesc.description.length) {
            throw new Error("You cannot have more than 1024 characters in the description!")
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

    // Todo: write the code that builds a new login restriction configuration
    async newInteractiveLoginConfiguration() { }

    // Todo: Write the code that updates existing login restriction configurations
    async updateInteractiveLoginConfiguration() { }

    // Todo: Write the code that removes login restriction configurations
    async removeInteractiveLoginConfiguration() { }

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

    // Create a new security group with the specified options
    async newAADGroup(name: string, description?: string, roleAssignable?: boolean): Promise<MicrosoftGraphBeta.Group> {

        // Validate name length is not too long for the graph
        if (name.length > 120) {throw new Error("The name is too long, can't be longer than 120 chars!")};
        
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
            // Validate that the group is of the correct length
            if (description.length > 1024) {throw new Error("The description cannot be longer than 1024 characters!")};
            
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

    // Delete the specified Security Group
    async deleteAADGroup(GUID: string): Promise<boolean> {
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

    // Retrieve Azure Active Directory Administrative Unit list. Can pull individual users based upon GUID.
    async getAADAdminUnit(GUID?: string): Promise<MicrosoftGraphBeta.AdministrativeUnit[]> {
        if (typeof GUID === "undefined") {
            // Grab an initial group page collection
            const adminUnitPage: PageCollection = await (await this.client).api("/administrativeUnits").get();

            // Process the page collection to its base form (Group)
            const adminUnitList: MicrosoftGraphBeta.AdministrativeUnit[] = await this.iteratePage(adminUnitPage);

            // Return the processed data
            return adminUnitList;
        } else {
            if (validateGUID(GUID)) {
                // Retrieve the specified group from AAD
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
}