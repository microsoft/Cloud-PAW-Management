import express from "express";
import { MSAzureAccessCredential } from "./Authentication";
import { MSGraphClient } from "./GraphClient";
import { DebugRouter } from "./DebugRoute"

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
}

// Start the web server
const serverInstance = webServer.listen(port, () => {
    console.log("Server running on port: " + port);
});