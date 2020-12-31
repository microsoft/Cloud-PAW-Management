import express from "express";
import { MSAzureAccessCredential } from "./Authentication"

// Import environmental variables
const port = process.env.PORT || 3000;
const userAssignedManagedIdentityID = process.env.MANAGED_IDENT_GUID || "none";

// Log into Azure AD
const credential = new MSAzureAccessCredential(userAssignedManagedIdentityID);

// Initialize the Microsoft Graph client


// Initialize Express
const webServer = express();

// Configure Express

// Define the management API

// Start the web server
const serverInstance = webServer.listen(port, ()=> {
    console.log("Server running on port: " + port);
});