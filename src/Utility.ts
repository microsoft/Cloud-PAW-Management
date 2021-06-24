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

// Define the key value structure for the settings catalog post generator
interface settingValueStructure {
    nameID: string,
    type: string,
    value: [{
        value: string,
        children?: [settingValueStructure]
    }] | {
        value: string,
        children?: [settingValueStructure]
    }
}

// TODO: Add data validation to the utility to ensure no funny business happens
// TODO: Add children support by using recursive function calling itself

// Generate a settings catalog string value object
export function generateSettingCatalogPost(keyValue: settingValueStructure[]): any {
    // Validate input
    if (typeof keyValue === "object" && keyValue.length > 0) {
        // Define the base object to be manipulated by the specified key value pairs
        // type: MicrosoftGraphBeta.DeviceManagementConfigurationPolicy
        let settingsObject: any = {
            settings: []
        }

        // Loop over each setting structure in the array
        for (let index = 0; index < keyValue.length; index++) {
            // Extract a single value structure from the array of value structures
            const valueStructure = keyValue[index];

            // Setting instance
            // type: MicrosoftGraphBeta.DeviceManagementConfigurationSetting
            let settingInstance: any = {
                settingInstance: {
                    settingDefinitionId: valueStructure.nameID
                }
            }
            // Add the type info
            settingInstance.settingInstance[valueStructure.type] = valueStructure.value

            // Push the setting instance into the setting object
            settingsObject.settings.push(settingInstance)
        }
        
        // Return the resulting settings object structure
        return settingsObject;
    } else {
        throw new Error("The provided setting value object is not an array or is empty!");
    }
}