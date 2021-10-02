// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { MSGraphClient } from "./GraphClient";
import { InternalAppError, validateGUID, writeDebugInfo } from "./Utility";

// Define the Endpoint Manager Role Scope Tag data format.
interface CloudSecConfigIncomplete {
    "PAWSecGrp"?: string,
    "UsrSecGrp"?: string,
    "SiloRootGrp"?: string,
    "BrkGls"?: string,
    "UsrTag"?: string
};

interface CloudSecConfig {
    "PAWSecGrp": string,
    "UsrSecGrp": string,
    "SiloRootGrp": string,
    "BrkGls": string,
    "UsrTag": string
};

// Expose a configuration engine that interfaces with the
export class ConfigurationEngine {
    // Define the properties available in the class
    private graphClient: MSGraphClient;
    private configScratchSpace: CloudSecConfigIncomplete;
    private scopeTagName: string;
    configInitialized: boolean;
    config: CloudSecConfig | undefined;

    // Initialize the class
    constructor(graphClient: MSGraphClient) {
        // Initialize the properties
        this.graphClient = graphClient;
        this.configInitialized = false;
        this.configScratchSpace = {};

        // Write debug info
        writeDebugInfo("Initialized standard class properties");

        // Write debug info
        writeDebugInfo(process.env.Scope_Tag, "Scope_Tag environmental variable value:");

        // Check to make sure the scope_tag variable is present
        if (typeof process.env.Scope_Tag !== "string") {
            // Write debug info
            writeDebugInfo((typeof process.env.Scope_Tag), "Scope_Tag env var is not a string:");

            // If it isn't set the scope tag name to a predefined tag name
            this.scopeTagName = "Priv Sec Mgmt App"
        } else {
            // If it is present, set the scope tag name to the specified tag name
            this.scopeTagName = process.env.Scope_Tag;

            // Write debug info
            writeDebugInfo(this.scopeTagName, "Set scopeTagName:");
        };

        // Execute configuration read to populate the initialization state to the scratch space.
        // Use a .then() so that the functions execute in order of operation
        this.readConfig().then((value) => {
            // Validate the scratch space status and go live if valid.
            this.validateTagConfig();
        });
    };

    // Read the scope tag that the config engine uses;
    private async readConfig(): Promise<void> {
        // Write debug info
        writeDebugInfo("Get Scope Tag Object from MEM");

        // Get the MEM Scope Tag based on the scopeTagName property that was configured previously.
        const scopeTagObject = (await this.graphClient.getMEMScopeTag(this.scopeTagName))[0];

        // Write debug info
        writeDebugInfo(scopeTagObject, "Scope Tag Object Data:");

        // Check the presence of the description field of the MEM Scope Tag
        if (typeof scopeTagObject.description === "string") {
            // Parse the description field into something useable.
            this.configScratchSpace = this.parseTagConfigString(scopeTagObject.description);
        };
    };

    // Validates the scratch space and moves it to the live config if valid.
    private async validateTagConfig(): Promise<boolean> {
        // Grab a copy of the scratch space so that other actors can't inject code during validation
        // This type of json object copy eliminates complex types and executables from the object being copied
        const scratchSpaceInstance: any = JSON.parse(JSON.stringify(this.configScratchSpace));

        // Validate object structure by checking the properties exist and the values of the object is what is expected
        // Validate the Break Glass property
        if (typeof scratchSpaceInstance.BrkGls === "undefined" || !(validateGUID(scratchSpaceInstance.BrkGls))) {
            // If validation fails, return false
            return false;
            // Validate the PAW Security Group property
        } else if (typeof scratchSpaceInstance.PAWSecGrp === "undefined" || !(validateGUID(scratchSpaceInstance.PAWSecGrp))) {
            // If validation fails, return false
            return false;
            // Validate the SILO Root Group property
        } else if (typeof scratchSpaceInstance.SiloRootGrp === "undefined" || !(validateGUID(scratchSpaceInstance.SiloRootGrp))) {
            // If validation fails, return false
            return false;
            // Validate the User Root Group property
        } else if (typeof scratchSpaceInstance.UsrSecGrp === "undefined" || !(validateGUID(scratchSpaceInstance.UsrSecGrp))) {
            // If validation fails, return false
            return false;
            // Validate the User Tagging property
        } else if (typeof scratchSpaceInstance.UsrTag === "undefined" || !(validateGUID(scratchSpaceInstance.UsrTag))) {
            // If validation fails, return false
            return false;
        } else {
            // Set the config to be the value of the
            this.config = scratchSpaceInstance;

            // Set the config initialized flag to be true
            this.configInitialized = true;

            // Return true to the caller to symbolize successful execution
            return true;
        };
    };

    // Parse and validate the string data that should be in the config format
    private parseTagConfigString(configString: string): CloudSecConfigIncomplete {
        // Validate input
        if (typeof configString !== "string") { throw new InternalAppError("The data is not in string format!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Input Validation") };

        // Create the returned object
        let parsedConfig: CloudSecConfigIncomplete = {}

        // Check to see if the role scope tag exists but has a blank description
        if (configString === "") {
            // Return an empty and incomplete cloud config object to the caller
            return parsedConfig;
        };

        // Split out each line
        const newLines = configString.split("\n");

        // Loop through all of the lines and add it to the output after validating the data
        for (const line in newLines) {
            // Separate the two parts of the 
            const splitLine = newLines[line].split("=");

            // Validate keys/values and assign if the key matches
            switch (splitLine[0]) {
                case "PAWSecGrp":
                    // Validate the value in the line split
                    if (!validateGUID(splitLine[1])) { throw new InternalAppError("The value associated with the PAWSecGrp scope tag key is not a valid GUID!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Switch -> GUID Validation") };

                    // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                    parsedConfig.PAWSecGrp = splitLine[1];

                    // Stop switch execution
                    break;
                case "UsrSecGrp":
                    // Validate the value in the line split
                    if (!validateGUID(splitLine[1])) { throw new InternalAppError("The value associated with the UsrSecGrp scope tag key is not a valid GUID!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Switch -> GUID Validation") };

                    // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                    parsedConfig.UsrSecGrp = splitLine[1];
                    break;
                case "SiloRootGrp":
                    // Validate the value in the line split
                    if (!validateGUID(splitLine[1])) { throw new InternalAppError("The value associated with the SiloRootGrp scope tag key is not a valid GUID!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Switch -> GUID Validation") };

                    // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                    parsedConfig.SiloRootGrp = splitLine[1];

                    // Stop switch execution
                    break;
                case "BrkGls":
                    // Validate the value in the line split
                    if (!validateGUID(splitLine[1])) { throw new InternalAppError("The value associated with the BrkGls scope tag key is not a valid GUID!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Switch -> GUID Validation") };

                    // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                    parsedConfig.BrkGls = splitLine[1];

                    // Stop switch execution
                    break;
                case "UsrTag":
                    // Validate the value in the line split
                    if (!validateGUID(splitLine[1])) { throw new InternalAppError("The value associated with the UsrTag scope tag key is not a valid GUID!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Switch -> GUID Validation") };

                    // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                    parsedConfig.UsrTag = splitLine[1];

                    // Stop switch execution
                    break;
                default:
                    // Write debug info
                    writeDebugInfo(splitLine);

                    // A key provided was not matched to the allowed data format, stop execution and throw an error
                    throw new InternalAppError("The given data is not in the correct format! Please see: https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Scope-Tag-Data-Format", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Switch -> Default Statement");
            };
        };

        // Set the parsed and validated data into the scratch space property
        return parsedConfig;
    };

    // Deploy the core security groups
    async deployConfigTag(userConcent: boolean): Promise<void> {

        // Validate user concent
        if (!userConcent) { throw new InternalAppError("User has not consented to the deployment!", "Invalid Input", "ConfigEngine -> deployConfig -> User Concent") };

        // If the Break glass property is not configured, deploy a new BG SG
        if (typeof this.configScratchSpace.BrkGls === "undefined") {
            // Create the Break Glass security group
            const newBGgroup = await this.graphClient.newAADGroup("Break Glass", "Used by the Cloud PAW Management App to exclude the emergency access accounts from being caught in an outage.");

            // Update the Scratch space to reflect the GUID from the new SG that was just created
            this.configScratchSpace.BrkGls = newBGgroup.id

            // If the PAW Device root group is not configured, deploy a new SG
        } else if (typeof this.configScratchSpace.PAWSecGrp === "undefined") {
            // Create the PAW Devices security group
            const newPAWDevGroup = await this.graphClient.newAADGroup("PAW Devices", "Used by the Cloud PAW Management App to contain the PAW device's Security Group and device hierarchy.");

            // Update the Scratch space to reflect the GUID from the new SG that was just created
            this.configScratchSpace.PAWSecGrp = newPAWDevGroup.id

            // If the SILO Root group doesn't exist, deploy it
        } else if (typeof this.configScratchSpace.SiloRootGrp === "undefined") {
            // Create the SILO Root Group
            const newSILOGroup = await this.graphClient.newAADGroup("SILO Root", "Used by the Cloud PAW management app to contain the SILO Security Group hierarchy.");

            // Update the Scratch Space SILO Root group data with the new GUID
            this.configScratchSpace.SiloRootGrp = newSILOGroup.id;

            // If the Privileged Users root group does not exist, deploy a new SG for it.
        } else if (typeof this.configScratchSpace.UsrSecGrp === "undefined") {
            // Create the Priv Users Sec Group
            const newPrivUserGroup = await this.graphClient.newAADGroup("Privileged Users", "Used by the Cloud PAW Management App to contain the Priv Users' Security Group and user hierarchy.");

            // Configure the scratch space Priv Users root group with the new GUID provided
            this.configScratchSpace.UsrSecGrp = newPrivUserGroup.id;

            // If the Priv Users tagging group doesn't exist, deploy the PAG.
        } else if (typeof this.configScratchSpace.UsrTag === "undefined") {
            // Create a new PAG
            const newUserTagging = await this.graphClient.newAADGroup("Privileged Users - Tagging", "Used to tag priv users to enforce credential partitioning.", true);

            // Configure the UsrTag property of the scratch space with the new GUID provided
            this.configScratchSpace.UsrTag = newUserTagging.id;
        };

        // After deploying the needed groups, execute validation.
        await this.validateTagConfig();

        // Write the new data to the MEM scope tag.
        await this.updateConfigTag();
    };

    // Update the core role scope tag with the settings in the config property
    private async updateConfigTag(): Promise<boolean> {

        // Write debug info
        writeDebugInfo(this.configInitialized, "Config Initialization flag value:");
        writeDebugInfo(this.config, "Config property contents:")

        // Validate that the config is initialized and that the config is not empty
        if (this.configInitialized && typeof this.config !== "undefined") {
            // Build the tag description to be sent to the scope tag
            const tagDescription = "PAWSecGrp=" + this.config.PAWSecGrp + "\nUsrSecGrp=" + this.config.UsrSecGrp + "\nSiloRootGrp=" + this.config.SiloRootGrp + "\nBrkGls=" + this.config.BrkGls + "\nUsrTag=" + this.config.UsrTag;

            // Write debug info
            writeDebugInfo(tagDescription, "Constructed tag description:");

            // Update the scope tag with the specified options
            const updateResults = await this.graphClient.updateMEMScopeTag(this.scopeTagName, tagDescription);

            // Write debug info
            writeDebugInfo(updateResults, "Results of the MEM Scope Tag update operation:");

            // Return that the operation was successful
            return true;

        } else { // If the config is not initialized, execute the below contents
            // Return false if the config is not initialized
            return false;
        };
    };
};