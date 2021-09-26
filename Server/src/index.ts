// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import express from "express";
import helmet from "helmet";
import * as path from "path";
import { MSAzureAccessCredential } from "./Authentication";
import { ConfigurationEngine } from "./ConfigEngine";
import { DebugRouter } from "./DebugRoute";
import { MSGraphClient } from "./GraphClient";
import { LifeCycleRouter } from "./LifeCycleManagement";
import { writeDebugInfo } from "./Utility";

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

// TODO: Properly config the CSP settings so they are react compatible to bring more security
// Quick configure Express to be more secure, disabling the CSP because it breaks react
webServer.use(helmet({"contentSecurityPolicy": false}));

// Serve up the UI directory
webServer.use(express.static(path.join(__dirname, "UI")));

// Write the info about the static files being served
writeDebugInfo(path.join(__dirname, "UI"), "Static file path:")

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
};

// Initialize the core business logic routes
const lifeCycleRouter = new LifeCycleRouter(webServer, graphClient);

// Start the web server
const serverInstance = webServer.listen(port, () => {
    writeDebugInfo("Running on port: " + port, "Server Started");
});