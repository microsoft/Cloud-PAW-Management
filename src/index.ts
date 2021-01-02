import express from "express";
import { MSAzureAccessCredential } from "./Authentication"

// Import environmental variables
const port = process.env.PORT || 3000;

// Check to see if a user assigned managed identity GUID is provided.
// If it is, log into Azure with user assigned MI and app registration credentials.
// If it isn't, Log into Azure with app registration only.
const azureAuthSession = new MSAzureAccessCredential();

// Initialize the Microsoft Graph client
// const graphClient = new MSGraphClient(azureAuthSession.credential);

// Initialize Express
const webServer = express();

// Debugging entry to list access token to manually web request as the app
webServer.get('/accessToken', async (request, response) => {
    try {
        // grab a token and extract its value
        const token = await (await azureAuthSession.credential).getToken("https://graph.microsoft.com/.default");

        // Validate that the token has value
        if (token !== null) {
            // If it does, send its value as a response
            response.send(token);
            // If it does not
        } else {
            // Send a notice to the caller stating that it does not have value.
            response.send("no token data received")
        };
    } catch (error) {
        response.send(error);
    }
});

// Send all environmental vars
webServer.get('/envVar', async (request, response) => {
    response.send(process.env)
});

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});