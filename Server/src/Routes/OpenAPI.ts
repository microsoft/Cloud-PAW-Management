// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as swaggerUI from "swagger-ui-express"
import { swaggerDocument } from "../JSON/swaggerDoc";
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
        // Initialize the Swagger UI middleware on the API endpoint
        this.webServer.use('/Docs/API', swaggerUI.serve);

        // Set the Swagger UI engine's default options
        const swaggerOptions: swaggerUI.SwaggerUiOptions = {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "Cloud PAW Management - API Docs"
        };

        // Specify the document to be served up on the SwaggerUI endpoint using the specified options
        this.webServer.get('/Docs/API', swaggerUI.setup(swaggerDocument, swaggerOptions));
    }
}