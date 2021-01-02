import express from "express";
import { validateGUID } from "./Utility";
import { MSAzureAccessCredential } from "./Authentication"
import { MSGraphClient } from "./GraphClient";

// Import environmental variables
const port = process.env.PORT || 3000;

// Check to see if a user assigned managed identity GUID is provided.
// If it is, log into Azure with user assigned MI and app registration credentials.
// If it isn't, Log into Azure with app registration only.
const azureAuthSession = new MSAzureAccessCredential();

// Initialize the Microsoft Graph client
const graphClient = new MSGraphClient(azureAuthSession.credential);

// Initialize Express
const webServer = express();

// Configure Express

// Define the management API

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});