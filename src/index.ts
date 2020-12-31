import express from "express";
import { Client } from "@microsoft/microsoft-graph-client";
import { DefaultAzureCredential, DefaultAzureCredentialOptions } from "@azure/identity";

// Import environmental variables
const port = process.env.PORT || 3000;
const userAssignedManagedIdentityID = process.env.MANAGED_IDENT_GUID || "none";

// Check if a user assigned managed identity is specified
if (userAssignedManagedIdentityID !== "none") {
    // if one is, build the configuration for the auto login to use it
    const credOptions: DefaultAzureCredentialOptions = {
        managedIdentityClientId: userAssignedManagedIdentityID
    };
    // log in with the user assigned managed identity 
    const credential = new DefaultAzureCredential(credOptions);
// Otherwise use the default configuration for system assigned identities
} else {
    // auto log in with default configuration
    const credential = new DefaultAzureCredential();
};

// Initialize the Microsoft Graph client


// Initialize Express
const webServer = express();

// Configure Express

// Start the web server
const serverInstance = webServer.listen(port, ()=> {
    console.log("Server running on port: " + port);
});