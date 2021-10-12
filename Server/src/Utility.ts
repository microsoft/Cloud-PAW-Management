// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

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

// Validate that the specified number, string, or Date object is a valid date and not an invalid object/format.
export function validateDate(dateToTest: string | number | Date): boolean {
    // Check to to see if the object is a Date object
    if (dateToTest instanceof Date) {
        // If it is, place it in the dateObject var for later testing.
        // This is inefficient but reduces the amount of testing code necessary later.
        // Garbage collection will eliminate the waste after done using the function.
        var dateObject = dateToTest;
    } else if (typeof dateToTest === "string" || typeof dateToTest === "number") {
        var dateObject = new Date(dateToTest);
    } else { // If a type was passed that is not a Date, string or number...
        // return false as that would not be supported.
        return false;
    };

    // Check to make sure the dateObject isn't an invalid date
    if (dateObject.toString() === "Invalid Date") {
        // If it is invalid, return false
        return false;
    } else { // If it isn't invalid
        // return true to indicate that it is a valid Date object/format
        return true;
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

// Validate Custom Device configurations using strings for the OMA-URI payload
export function validateOmaString(OmaObject: any): boolean {
    if (typeof OmaObject !== "object") {
        return false;
    };

    // Ensure the required OData Type is present as the GraphAPI won't know how to handle an object that doesn't have this property and value.
    if (OmaObject["@odata.type"] !== "#microsoft.graph.omaSettingString") {
        return false;
    };

    // Check to make sure that the displayName (required) is a string.
    if (typeof OmaObject.displayName !== "string") {
        // Return false if the displayName present and not a string
        return false;
    } else if (typeof OmaObject.displayName !== "undefined" && OmaObject.displayName.length > 1000) {
        // Return false if the displayName is present and over 1000 chars
        return false;
    };

    // Check to make sure that if the description (optional) is specified, that it is a string.
    if (typeof OmaObject.description !== "undefined" && typeof OmaObject.description !== "string") {
        // Return false if the description is present and not a string
        return false;
    } else if (typeof OmaObject.description !== "undefined" && OmaObject.description.length > 1000) {
        // Return false if the description is present and over 1000 chars
        return false;
    };

    // Check to make sure that the omaUri (required) is a string.
    if (typeof OmaObject.omaUri !== "string") {
        // Return false if the omaUri present and not a string
        return false;
    } else if (typeof OmaObject.omaUri !== "undefined" && OmaObject.omaUri.length > 1000) {
        // Return false if the omaUri is not present and over 1000 chars
        return false;
    };

    // Check to make sure that the OMA value (required) is a string.
    if (typeof OmaObject.value !== "string") {
        // Return false if the OMA value present and not a string
        return false;
    };

    // For successful validation, return true
    return true;
};

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
};

// TODO: Validate the structure of a given PAW Object.
export function validatePawObject(objectToValidate: any) {}

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
        console.error(this.message);
    };
};