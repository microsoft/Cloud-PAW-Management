import express from "express";
import { validateGUID } from "./Utility";
import { MSAzureAccessCredential } from "./Authentication"
import { MSGraphClient } from "./GraphClient";

// Import environmental variables
const clientID = process.env.Client_GUID || "None"
const clientSecret = process.env.Client_Secret || "None"
const tenantID = process.env.Tenant_ID || "None"
const managedIdentGUID = process.env.Managed_ID_GUID || "None"
const port = process.env.PORT || 3000;

// Validate environmental variable input to ensure that the input is as expected and not an injection attempt.
if (validateGUID(clientID)) { throw new Error("Client ID is not configured properly!") };
if (clientSecret === "None") { throw new Error("Client Secret is not configured!") };
if (validateGUID(tenantID)) { throw new Error("Tenant ID is not configured properly!") };
if (!validateGUID(managedIdentGUID) && managedIdentGUID !== "None") { throw new Error("The user assigned managed identity GUID is not a valid GUID!") };

// Check to see if a user assigned managed identity GUID is provided.
// If it is, log into Azure with user assigned MI and app registration credentials.
// If it isn't, Log into Azure with app registration only.
const azureAuthSession = (managedIdentGUID !== "None") ? new MSAzureAccessCredential(clientID, clientSecret, tenantID, managedIdentGUID)
    : new MSAzureAccessCredential(clientID, clientSecret, tenantID);

// Initialize the Microsoft Graph client
const graphClient = new MSGraphClient();
const instance = graphClient.login(azureAuthSession.credential);

// Initialize Express
const webServer = express();

// Configure Express

// Define the management API

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});