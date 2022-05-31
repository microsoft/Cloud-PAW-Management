// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import express from "express";
import helmet from "helmet";
import * as path from "path";
import { DebugRouter } from "./Routes/DebugRoute";
import { LifecycleRouter } from "./Routes/LifecycleManagement";
import { SwaggerUI } from "./Routes/OpenAPI";
import { MSAzureAccessCredential } from "./Startup/Authentication";
import { ConfigurationEngine } from "./Startup/ConfigEngine";
import { AppGraphClient, writeDebugInfo } from "./Utility";

// Import environmental variables
const port = process.env.PORT || 3000;
const debugMode = process.env.PSM_Debug || "false"
const headlessOperation = process.env.PSM_Headless || "false"

// Generate an authentication session that can create access tokens.
// This will automatically use available credentials available in Managed Identity, Key Vault or environmental vars.
const azureAuthSession = new MSAzureAccessCredential();

// Initialize the graph client
const graphClient = new AppGraphClient(azureAuthSession.credential);

// Initialize the configuration engine
const configEngine = new ConfigurationEngine(graphClient);

// Initialize Express
const webServer = express();

// Parse the request bodies so that they can be used as objects instead of raw text
webServer.use(express.json());

// TODO: Properly config the CSP settings so they are react compatible to bring more security
// Quick configure Express to be more secure, disabling the CSP because it breaks react
webServer.use(helmet({ "contentSecurityPolicy": false }));

// Check to see if the UI has been suppressed.
if (headlessOperation !== "true") {
    // Serve up the UI directory
    webServer.use(express.static(path.join(__dirname, "UI")));
    webServer.use("/devices", express.static(path.join(__dirname, "UI")));
    webServer.use("/devices/:DeviceId", express.static(path.join(__dirname, "UI")));

    // Write the info about the static files being served
    writeDebugInfo(path.join(__dirname, "UI"), "Static file path:");
};

// If debug mode is enabled, enable the debug routes
if (debugMode === "true") {
    // Instantiate an instance of the debug router which will add of the debugging routes
    new DebugRouter(webServer, graphClient, configEngine, azureAuthSession.credential);

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

    // Instantiate an instance of the OpenAPI docs engine
    new SwaggerUI(webServer);
};

// Initialize the core business logic routes
new LifecycleRouter(webServer, graphClient, configEngine);

// Set the startup indicator as false to indicate that the app is no longer starting up
configEngine.startup = false;

// Start the web server
const serverInstance = webServer.listen(port, () => {
    writeDebugInfo("Running on port: " + port, "Server Started");
});