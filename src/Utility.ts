// Create a GUID validation function to ensure GUID data is in correct format
export function validateGUID(GUIDToTest: string): boolean {
    // Take the input and run a GUID string regex match against it and store the results.
    const results = GUIDToTest.match("/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i")

    // Check to see if any match was found and if a match was found, check to make sure it was only one.
    if (results !== null && results.length === 1) {
        // If a match was found, we have a valid GUID and should return true
        return true
    } else {
        // If no or more than one matches were found, return false as it is not a valid single GUID.
        return false
    }
}