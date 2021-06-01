import express from "express";
import { MSAzureAccessCredential } from "./Authentication";
import { MSGraphClient } from "./GraphClient";

// Import environmental variables
const port = process.env.PORT || 3000;
const debugMode = process.env.Debug || "false"

// Generate an authentication session that can create access tokens.
// This will automatically use available credentials available in Managed Identity, Key Vault or environmental vars.
const azureAuthSession = new MSAzureAccessCredential();

// Initialize the graph client
const graphClient = new MSGraphClient(azureAuthSession.credential);

// Initialize Express
const webServer = express();

// If debug mode is enabled, add additional routes
if (debugMode === "true") {
    // List access token to manually web request as the app
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
    webServer.get('/envVar', (request, response) => {
        response.send(process.env)
    });

    // Configure the role scope tag endpoint
    webServer.get('/roleScopeTag', async (request, response) => {
        // Initialize the Microsoft Graph client
        response.send(await graphClient.getEndpointScopeTag());
    })
};

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});