// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { hostname } from "os";
import * as swaggerUI from "swagger-ui-express"
import { appVersion } from "../Startup/ConfigEngine";
import * as openAPIDoc from "../JSON/openAPI.json";
import type express from "express";

// Define the Swagger UI class that 
export class SwaggerUI {
    // Define the properties that will be available to the class
    private webServer: express.Express;

    // Define how the class should be instantiated
    constructor(webServer: express.Express) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Initialize the route
        this.initSwaggerUI();
    };

    // Initialize the Swagger UI middleware
    initSwaggerUI(): void {

        // Import environmental variables
        const port = process.env.PORT || 3000;

        // Set the app version in the API Doc
        openAPIDoc.info.version = appVersion;

        // Set the two host names in the API Doc
        openAPIDoc.servers[0].url = "https://" + hostname + ":" + port + "/"
        openAPIDoc.servers[1].url = "http://" + hostname + ":" + port + "/"

        // Initialize the Swagger UI middleware on the API endpoint
        this.webServer.use('/Docs', swaggerUI.serve);

        // Set the Swagger UI engine's default options
        const swaggerOptions: swaggerUI.SwaggerUiOptions = {
            // customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "Cloud PAW Management - API Docs"
        };

        // Specify the document to be served up on the SwaggerUI endpoint using the specified options
        this.webServer.get('/Docs', swaggerUI.setup(openAPIDoc, swaggerOptions));
    }
}