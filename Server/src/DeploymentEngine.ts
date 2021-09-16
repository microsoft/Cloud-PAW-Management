// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { MSGraphClient } from "./GraphClient";
import { validateGUIDArray, parseScopeTag, ScopeTagDataIncomplete, writeDebugInfo, InternalAppError } from "./Utility";
import type express from "express";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

class DeploymentEngineRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: MSGraphClient;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: MSGraphClient) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Initialize the routes
        this.initRoutes();
    };

    private initRoutes(): void {
        // API stuff here
    }
};