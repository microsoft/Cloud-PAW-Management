// TODO: enhance debug console output with time stamps and other valuable data
// Write debug data to the console if debug mode is turned on
export function writeDebugInfo(object: any, message?: any): void {
    // Gather the debug mode setting from the current environmental variable set
    const debugMode = process.env.Debug || "false";

    // If the debug mode value is "true" write to the console
    if (debugMode === "true") {
        // If the message parameter is not left blank, write it
        if (typeof message !== "undefined") {
            // Write the specified message to the console
            console.log("\n" + message);
        } else {
            // If no message was specified, write a whitespace to separate the object from the line above it
            console.log("\n");
        };
        // The the specified object to the console
        console.log(object);
    };
};

// Create a GUID validation function to ensure GUID data is in correct format
export function validateGUID(GUIDToTest: any): boolean {
    // If the data is undefined, it is not a GUID
    if (typeof GUIDToTest === "undefined" || GUIDToTest === null) {
        // Return false since it is not a GUID
        return false;
    } else {
        // Define the GUID pattern
        const GUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/gi;

        // Test the value to ensure it is in the right format and return the results
        return GUIDRegex.test(GUIDToTest.toString());
    };
};

// Validate the specified email address to ensure it is in the correct format
export function validateEmail(emailToTest: any): boolean {
    // If the data is undefined, it is not an email
    if (typeof emailToTest === "undefined" || emailToTest === null) {
        // Return false since it is not an email
        return false;
    } else {
        // Define the email regex pattern
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        // Test the value to ensure it is in the right format and return the results
        return emailRegex.test(emailToTest.toString());
    };
};

// Validates an array contains only an email address at each index
export function validateEmailArray(emailArray: string[]): boolean {
    // Validate input is a string array
    if (!validateStringArray(emailArray)) { return false };

    // Loop over all of the indexes and validate they are email addresses
    for (let index = 0; index < emailArray.length; index++) {
        // Extract the string at the specified index
        const extractedIndex = emailArray[index];

        // Validate the string is an email address
        if (validateEmail(extractedIndex)) { return false };
    };

    // If everything checks out, return true
    return true;
}

// Validate an array of strings
export function validateStringArray(stringArray: string[]): boolean {
    // Validate input is an array
    if (!(stringArray instanceof Array) || stringArray.length == 0) { return false };

    // Loop over all of the indexes and validate they are strings
    for (let index = 0; index < stringArray.length; index++) {
        // Extract the object at the specified index
        const extractedIndex = stringArray[index];

        // Validate the object is a string
        if (typeof extractedIndex !== "string") { return false };
    };

    // If everything checks out, return true
    return true;
};

// Validates an array contains only GUIDs at each index
export function validateGUIDArray(GUIDArray: string[]): boolean {
    // Validate input is a string array
    if (!validateStringArray(GUIDArray)) { return false };

    // Loop over all of the indexes and validate they are GUIDs
    for (let index = 0; index < GUIDArray.length; index++) {
        // Extract the string at the specified index
        const extractedIndex = GUIDArray[index];

        // Validate the string is a GUID
        if (!validateGUID(extractedIndex)) { return false };
    };

    // If everything checks out, return true
    return true;
}

// TODO: Rebuild generator as a validator of data
// Validate a settings catalog settings object
export function validateSettingCatalogSettings(settingsToValidate: any[]): boolean {

    // interface temp {
    //     settingInstance: {
    //         "settingDefinitionId": string,
    //         [index: string]: {
    //             "value": string,
    //             "child"?: [temp]
    //         }[]
    //     }
    // }

    // Validate input is an array
    if ((settingsToValidate instanceof Array) && settingsToValidate.length > 0) {
        // Loop over every item in the array
        for (let index = 0; index < settingsToValidate.length; index++) {
            // Extract the current setting element
            const settingElement = settingsToValidate[index];

            // do more validation here...
        }
        return true;
    } else {
        return false;
    }
}

// TODO: build validator for device configurations
export function validateDeviceConfigurationSettings(settingsToValidate: any[]): boolean {
    return true
}

// TODO: Continue building out the validator to be more complete
// Validate the structure of a conditional access policy.
export function validateConditionalAccessSetting(settingToValidate: any): boolean {
    // Ensure that the setting being validated is the correct type
    if (typeof settingToValidate === "object") {
        // Loop through all of the keys in the settings to validate object
        for (const key in settingToValidate) {
            // Validate the 
            switch (key) {
                case "displayName":
                    // Validate string here
                    break;
                case "conditions":
                    // Validate sub-structure here
                    break;
                case "grantControls":
                    // Validate sub-structure here
                    break;
                case "sessionControls":
                    // Validate sub-structure here
                    break;
                case "state":
                    // If the key name is "state", validate the contents and ensure that it is one of the below values.
                    if (settingToValidate[key] !== "enabled" && settingToValidate[key] !== "disabled" && settingToValidate[key] !== "enabledForReportingButNotEnforced") { return false };
                    break;
                default:
                    // If the case is not matched, an un-known property is present, reject the validation.
                    return false;
            }
        }

        // If all of the above validation is successful, return true to indicate success
        return true
        // If it is not the correct type, return false
    } else {
        return false;
    }
}

// Define the Endpoint Manager Role Scope Tag data format.
export interface ScopeTagDataIncomplete {
    "PAWSecGrp"?: string,
    "UsrSecGrp"?: string,
    "SiloRootGrp"?: string,
    "BrkGls"?: string,
    "UsrTag"?: string
};

// Define a complete set of data for the Endpoint Manager Role Scope Tag data format.
export interface ScopeTagData {
    "PAWSecGrp": string,
    "UsrSecGrp": string,
    "SiloRootGrp": string,
    "BrkGls": string,
    "UsrTag": string
};

// Parse, validate, and return the Scope Tag data in a well defined object.
export function parseScopeTag(description: string): ScopeTagDataIncomplete {

    // Validate input
    if (typeof description !== "string") { throw new Error("The data is not in string format!") };

    // Create the returned object
    let parsedScopeTag: ScopeTagDataIncomplete = {}

    // Split out each line
    const newLines = description.split("\n");

    // Loop through all of the lines and add it to the output after validating the data
    for (const line in newLines) {
        // Separate the two parts of the 
        const splitLine = newLines[line].split("=");

        // Validate keys/values and assign if the key matches
        switch (splitLine[0]) {
            case "PAWSecGrp":
                // Validate the value in the line split
                if (!validateGUID(splitLine[1])) { throw new Error("The value associated with the PAWSecGrp scope tag key is not a valid GUID!") };

                // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                parsedScopeTag.PAWSecGrp = splitLine[1];

                // Stop switch execution
                break;
            case "UsrSecGrp":
                // Validate the value in the line split
                if (!validateGUID(splitLine[1])) { throw new Error("The value associated with the UsrSecGrp scope tag key is not a valid GUID!") };

                // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                parsedScopeTag.UsrSecGrp = splitLine[1];
                break;
            case "SiloRootGrp":
                // Validate the value in the line split
                if (!validateGUID(splitLine[1])) { throw new Error("The value associated with the SiloRootGrp scope tag key is not a valid GUID!") };

                // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                parsedScopeTag.SiloRootGrp = splitLine[1];

                // Stop switch execution
                break;
            case "BrkGls":
                // Validate the value in the line split
                if (!validateGUID(splitLine[1])) { throw new Error("The value associated with the BrkGls scope tag key is not a valid GUID!") };

                // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                parsedScopeTag.BrkGls = splitLine[1];

                // Stop switch execution
                break;
            case "UsrTag":
                // Validate the value in the line split
                if (!validateGUID(splitLine[1])) { throw new Error("The value associated with the UsrTag scope tag key is not a valid GUID!") };

                // Pull the key from the split line and assign the associated value to the corresponding parsed scope tag data
                parsedScopeTag.UsrTag = splitLine[1];

                // Stop switch execution
                break;
            default:
                // Write debug info
                writeDebugInfo(splitLine);

                // A key provided was not matched to the allowed data format, stop execution and throw an error
                throw new Error("The given data is not in the correct format! Please see: https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Scope-Tag-Data-Format");
        };
    };

    // Return the parsed and validated data
    return parsedScopeTag;
};

// Define the custom error structure for the app so that error handling can be well structured and in the future, automated.
export class InternalAppError extends Error {
    // Define the initialization code for the class
    constructor(message: string, name?: string, trace?: string) {
        // Satisfy the requirements of the parent class by passing the error message to it upon initialization
        super(message)

        // If present, set the values
        if (typeof name === "string") {this.name = name};
        if (typeof trace === "string") {this.stack = trace};

        // Log the error on error creation/instantiation
        this.logError();
    };

    // TODO: Add an error reporting engine
    private reportError() {};

    // TODO: Write the error logging logic (console/disk/wherever)
    private logError() {
        console.error(this.message)
    };
};