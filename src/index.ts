import express from "express";
import { MSAzureAccessCredential } from "./Authentication"
import { MSGraphClient } from "./GraphClient";

// Import environmental variables
const clientID = process.env.Client_GUID || "None"
const clientSecret = process.env.Client_Secret || "None"
const tenantID = process.env.Tenant_ID || "None"
const port = process.env.PORT || 3000;

// Validate environmental variable input to ensure that the input is as expected
if (clientID === "None") {
    throw new Error("Client ID is not configured!");
};
if (clientSecret === "None") {
    throw new Error("Client Secret is not configured!");
};
if (tenantID === "None") {
    throw new Error("Tenant ID is not configured!");
};

// Log into Azure AD
const azureAuthSession = new MSAzureAccessCredential(clientID, clientSecret, tenantID);

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