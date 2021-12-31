// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { appVersion } from "../Startup/ConfigEngine";
import type { JsonObject } from "swagger-ui-express";

// Create the OpenAPI specification document that the render uses for the Swagger UI system
export const swaggerDocument: JsonObject = {
    "openapi": "3.0.3",
    "info": {
        "title": "Cloud PAW Management",
        "description": "Microsoft Endpoint Manager (Intune) Cloud Privileged Access Workstation (PAW) Lifecycle Management and Deployment App.",
        "contact": {
          "email": "elliot.huffman@microsoft.com"
        },
        "license": {
          "name": "MIT",
          "url": "https://github.com/microsoft/Cloud-PAW-Management/blob/main/LICENSE"
        },
        "version": appVersion
      },
      "externalDocs": {
        "description": "Official Documentation",
        "url": "https://github.com/microsoft/Cloud-PAW-Management/wiki"
      },
      "servers": [
        {
          "url": "https://<your.domain.here>/"
        }
      ],
      "tags": [
        {
          "name": "Lifecycle Management",
          "description": "Everything about your Pets",
          "externalDocs": {
            "description": "Read the wiki page",
            "url": "https://github.com/microsoft/Cloud-PAW-Management/wiki/PAW-Lifecycle-Management-API-Endpoints"
          }
        },
        {
          "name": "Infrastructure Deployment",
          "description": "Coming soon!",
          "externalDocs": {
              "description": "Read the wiki page",
              "url": "https://github.com/microsoft/Cloud-PAW-Management/wiki/Infrastructure-Deployment-API-Endpoints"
          }
        },
        {
          "name": "Debug Mode",
          "description": "Endpoints that are exposed only in debug mode. You can use these to see as the app sees.",
          "externalDocs": {
            "description": "Read the wiki page",
            "url": "https://github.com/microsoft/Cloud-PAW-Management/wiki/Debug-API-Endpoints"
          }
        }
      ],
      "paths": {
          "/Docs/API": {
              "get": {
                  "tags": [
                      "Debug Mode"
                  ],
                  "summary": "Render this Swagger UI",
                  "description": "Runs the Swagger UI render to render the OpenAPI spec that you are viewing now."
              }
          }
      }
}