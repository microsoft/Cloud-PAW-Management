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