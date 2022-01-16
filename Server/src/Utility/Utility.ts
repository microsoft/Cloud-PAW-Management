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