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
webServer.get('/accessToken', (request, response) => {
    azureAuthSession.credential.then((credObject) => {
        credObject.getToken("https://graph.microsoft.com/.default").then((token) => {
            if (token !== null) {
                response.send(token);
            } else {
                response.send("no token returned :(");
            };
        });
    });
});

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});