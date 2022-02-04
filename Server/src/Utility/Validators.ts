// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

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
    if (GUIDToTest === undefined || GUIDToTest === null) {
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
    if (emailToTest === undefined || emailToTest === null) {
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
    for (const email of emailArray) {
        // Validate the string is an email address
        if (!validateEmail(email)) { return false };
    };

    // If everything checks out, return true
    return true;
};

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

// Validate an array of strings
export function validateOmaStringObjectArray(omaArray: any[]): boolean {
    // Validate input is an array
    if (!(omaArray instanceof Array) || omaArray.length == 0) { return false };

    // Loop through the objects in the array
    for (const object of omaArray) {
        // Check to see if the objects are actually OMA objects
        if (!validateOmaStringObject(object)) { // If they aren't
            // Return false to indicate not working out...
            return false;
        };
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
export function validateOmaStringObject(omaObject: any): boolean {
    if (typeof omaObject !== "object") {
        return false;
    };

    // Ensure the required OData Type is present as the GraphAPI won't know how to handle an object that doesn't have this property and value.
    if (omaObject["@odata.type"] !== "#microsoft.graph.omaSettingString") {
        return false;
    };

    // Check to make sure that the displayName (required) is a string.
    if (typeof omaObject.displayName !== "string") {
        // Return false if the displayName present and not a string
        return false;
    } else if (typeof omaObject.displayName !== "undefined" && omaObject.displayName.length > 1000) {
        // Return false if the displayName is present and over 1000 chars
        return false;
    };

    // Check to make sure that if the description (optional) is specified, that it is a string.
    if (typeof omaObject.description !== "undefined" && typeof omaObject.description !== "string") {
        // Return false if the description is present and not a string
        return false;
    } else if (typeof omaObject.description !== "undefined" && omaObject.description.length > 1000) {
        // Return false if the description is present and over 1000 chars
        return false;
    };

    // Check to make sure that the omaUri (required) is a string.
    if (typeof omaObject.omaUri !== "string") {
        // Return false if the omaUri present and not a string
        return false;
    } else if (typeof omaObject.omaUri !== "undefined" && omaObject.omaUri.length > 1000) {
        // Return false if the omaUri is not present and over 1000 chars
        return false;
    };

    // Check to make sure that the OMA value (required) is a string.
    if (typeof omaObject.value !== "string") {
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