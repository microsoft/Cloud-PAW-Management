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

// debugging entry to list access token to manually web request as the app
webServer.get('/accessToken', (request, response) => {
    const accessToken = azureAuthSession.credential.getToken("https://graph.microsoft.com/.default")
    if (!accessToken) {
        response.send("No access token object present!");
    } else {
        accessToken.then((results) => {
            response.send(results);
        }).catch((error) => {
            response.send(error);
        });
    }
})

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});