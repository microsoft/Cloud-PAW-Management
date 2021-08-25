import type { MSGraphClient } from "./GraphClient";
import { endpointPAWUserRightsSettings, conditionalAccessPAWUserAssignment } from "./RequestGenerator";
import { parseScopeTag, ScopeTagData } from "./Utility";
import type express from "express";

export class CoreRouter {
    // Define the properties that will be available to the class
    private webServer: express.Express;
    private graphClient: MSGraphClient;
    private configData: Promise<ScopeTagData>;

    // Define how the class should be instantiated
    constructor(webServer: express.Express, graphClient: MSGraphClient) {

        // Make the express instance available to the class
        this.webServer = webServer;

        // Make the graph client instance available to the class
        this.graphClient = graphClient;

        // Initialize the config data that will be used on all of the core routes
        this.configData = this.configInit();

        // Initialize the routes
        this.initRoutes();
    }

    // Initialize the configuration for the app
    private async configInit(): Promise<ScopeTagData> {
        // Validate environmental variable
        if (typeof process.env.Scope_Tag !== "string") { throw new Error("The Scope_Tag env var is not a string or not defined!") };

        // Grab a copy of the main scope tag data
        const scopeTagDescription = (await this.graphClient.getMEMScopeTag(process.env.Scope_Tag))[0].description

        // validate that there is data for the scope tag description
        if (typeof scopeTagDescription !== "string") { throw new Error("The scope tag data is not a string: config init") }

        // Return the parsed data
        return parseScopeTag(scopeTagDescription);   
    }

    // Initialize the routes
    private initRoutes() {

        // Assign a PAW to a user or set of users
        this.webServer.post('/AssignPAW', async (request, response, next) => {
            // Catch execution errors
            try {
                // Data from client software
                request.body.pawDeviceGUID
                request.body.userGUID

                // Generated post bodies for auto assignment
                // endpointPAWUserRightsSettings()
                // conditionalAccessPAWUserAssignment()

                // Graph client operations
                // this.graphClient.newAADGroup("PAW SG")
                // this.graphClient.newAADGroup("User SG")
                // this.graphClient.newSettingsCatalog("Windows User Rights Assignment")
                // this.graphClient.newAADCAPolicy("Cloud User Rights Assignment")

                // Send the results
                response.send("Did something!");
            } catch (error) {
                // Send the error details if something goes wrong
                next(error);
            };
        });
    }
}