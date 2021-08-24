import express from "express";
import { MSAzureAccessCredential } from "./Authentication";
import { MSGraphClient } from "./GraphClient";
import { DebugRouter } from "./DebugRoute";
import { CoreRouter } from "./CoreRouter";

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

// Parse the request bodies so that they can be used as objects instead of raw text
webServer.use(express.json());

// If debug mode is enabled, enable the debug routes
if (debugMode === "true") {
    // Instantiate an instance of the debug router which will add of the debugging routes
    const debugRoutes = new DebugRouter(webServer, graphClient, azureAuthSession.credential);

    // Stop the server if the stop command is issued
    // This can't be in the debug routes as the server instance can't be exposed there.
    webServer.get('/stop', (request, response) => {
        // Notify the caller
        response.send("Stopping Server...");

        // Log to console the server stop status
        console.log("Stopping Server...");

        // Stop the server
        serverInstance.close();
    });
}

// Initialize the core business logic routes
const coreRouter = new CoreRouter(webServer, graphClient);

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});