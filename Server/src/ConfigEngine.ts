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
    private configScratchSpace: Promise<CloudSecConfigIncomplete>;
    private scopeTagName: string;
    configInitialized: boolean;
    config: Promise<CloudSecConfig> | undefined;

    // Initialize the class
    constructor(graphClient: MSGraphClient) {
        // Initialize the properties
        this.graphClient = graphClient;
        this.configInitialized = false;

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

        // Execute configuration read to populate the initialization state
        this.configScratchSpace = this.readConfig();
    };

    // Read the scope tag that the config engine uses;
    private async readConfig(): Promise<CloudSecConfigIncomplete> {
        // Write debug info
        writeDebugInfo("Get Scope Tag Object from MEM");

        // Get the MEM Scope Tag based on the scopeTagName property that was configured previously.
        const scopeTagObject = (await this.graphClient.getMEMScopeTag(this.scopeTagName))[0];

        // Write debug info
        writeDebugInfo(scopeTagObject, "Scope Tag Object Data:");

        // Check the presence of the description field of the MEM Scope Tag
        if (typeof scopeTagObject.description === "string") {
            // Parse the description field into something useable.
            return this.parseConfigString(scopeTagObject.description);
        } else {
            // Build an awaited empty "CloudSecConfigIncomplete" to satisfy typescript's type checker
            const emptyConfig: CloudSecConfigIncomplete = await {};
            
            // Return an empty config to the property
            return emptyConfig;
        };
    };

    // Parse and validate the string data that should be in the config format
    private parseConfigString(configString: string): CloudSecConfigIncomplete {
        // Validate input
        if (typeof configString !== "string") { throw new InternalAppError("The data is not in string format!", "Invalid Input", "ConfigEngine -> ConfigurationEngine -> parseConfigString -> Input Validation") };

        // Create the returned object
        let parsedConfig: CloudSecConfigIncomplete = {}

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
};