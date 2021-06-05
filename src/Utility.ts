// Create a GUID validation function to ensure GUID data is in correct format
export function validateGUID(GUIDToTest: any): boolean {
    // If the data is undefined, it is not a GUID
    if (typeof GUIDToTest === "undefined" || GUIDToTest === null) {
        // Return false since it is not a GUID
        return false;
    } else {
        // Define the GUID pattern
        const GUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/gi;

        // Test the value to ensure it is in the right format
        return GUIDRegex.test(GUIDToTest.toString());
    };
};

// Create a GUID validation function to ensure GUID data is in correct format
export function validateEmail(emailToTest: any): boolean {
    // If the data is undefined, it is not a GUID
    if (typeof emailToTest === "undefined" || emailToTest === null) {
        // Return false since it is not a GUID
        return false;
    } else {
        // Define the GUID pattern
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        // Test the value to ensure it is in the right format
        return emailRegex.test(emailToTest.toString());
    };
};

// Define the data structure that scope tag update objects use for the graph client library
export interface ScopeTagUpdate {
    name?: string
    description?: string
}