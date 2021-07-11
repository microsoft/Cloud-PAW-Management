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
    if (!validateStringArray(emailArray)) {return false};
    
    // Loop over all of the indexes and validate they are email addresses
    for (let index = 0; index < emailArray.length; index++) {
        // Extract the string at the specified index
        const extractedIndex = emailArray[index];

        // Validate the string is an email address
        if (validateEmail(extractedIndex)) {return false};
    };

    // If everything checks out, return true
    return true;
}

// Validate an array of strings
export function validateStringArray(stringArray: string[]): boolean {
    // Validate input is an array
    if (typeof stringArray !== "object" || stringArray.length == 0) {return false};
    
    // Loop over all of the indexes and validate they are strings
    for (let index = 0; index < stringArray.length; index++) {
        // Extract the object at the specified index
        const extractedIndex = stringArray[index];

        // Validate the object is a string
        if (typeof extractedIndex !== "string") {return false};
    };

    // If everything checks out, return true
    return true;
};

// Validates an array contains only GUIDs at each index
export function validateGUIDArray(GUIDArray: string[]): boolean {
    // Validate input is a string array
    if (!validateStringArray(GUIDArray)) {return false};
    
    // Loop over all of the indexes and validate they are GUIDs
    for (let index = 0; index < GUIDArray.length; index++) {
        // Extract the string at the specified index
        const extractedIndex = GUIDArray[index];

        // Validate the string is a GUID
        if (validateGUID(extractedIndex)) {return false};
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
    if (typeof settingsToValidate === "object" && settingsToValidate.length > 0) {
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