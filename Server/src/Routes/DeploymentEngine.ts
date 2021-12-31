// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { AppGraphClient } from "../Utility/GraphClient";
import type { ConfigurationEngine } from "../Startup/ConfigEngine";
import { writeDebugInfo, InternalAppError } from "../Utility/Utility";
import type express from "express";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

class DeploymentEngineRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: AppGraphClient;
    private configEngine: ConfigurationEngine;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: AppGraphClient, configEngine: ConfigurationEngine) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Make the config engine instance available to the class
        this.configEngine = configEngine;

        // Initialize the routes
        this.initRoutes();
    };

    // Initialize the web server's deployment routes
    private initRoutes(): void {
        // Trigger the core security group deployment
        this.webServer.post("/API/Deploy", async (request, response, next) => {
            try {
                // Send the boolean response of the deployment operation
                response.send(await this.configEngine.deployConfigTag(request.body.userConcent));
            } catch (error) {
                // Check to see if the error is an error
                if (error instanceof InternalAppError) {
                    if (error.name === "Invalid Input") {
                        // Write debug info.
                        writeDebugInfo(error, "Input Validation Error:");

                        // Send a note back to the client about input.
                        response.send("The expected input is not valid: " + error.message);
                    // Since our errors are safe, return it to the caller
                    } else {
                        // Write debug info
                        writeDebugInfo(error, "One of our other errors:");

                        // Send the error details back
                        response.send("Unhandled custom internal error: " + error.name);
                    }
                // If the error is not our error, it is unhandled as we didn't control the error
                } else {
                    // Write debug info
                    writeDebugInfo(error, "Unhandled error:");

                    // Send a sanitized generic error back to the caller.
                    response.send("An unknown error occurred!");
                };
            };
        });

        // Place holder for the core infrastructure single click to deploy method
        this.webServer.post("/deploy", async (request, response, next) => {});
    };
};