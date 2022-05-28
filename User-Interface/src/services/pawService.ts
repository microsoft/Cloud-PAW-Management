import type { User } from "@microsoft/microsoft-graph-types-beta";
import type { IPsmAutopilotDevice, IPsmDevice } from "../models";
// import { PsmDeviceList } from '../models/mocks';

export interface IPawService {
    getPaws: () => Promise<IPsmDevice[]>,
    commissionPaw: (paw: IPsmAutopilotDevice) => Promise<void>,
    decommissionPaw: (paws: IPsmDevice[]) => Promise<string[]>, // return list of decommissioned Paws
}
export class PawService {
    // Get the current host name and port (if there is a port)
    public static API_BASE_URL = document.location.origin;

    // Get a list of PAW devices from the Server's Lifecycle API
    public static async getPaws(): Promise<IPsmDevice[]> {
        // Build the URL to run the API request against
        const getPawsUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW`;

        // Run the Get request against the specified endpoint
        const response = await fetch(getPawsUrl);

        // Parse the response body into JSON (the API always returns an array, an empty one if no PAWs are commissioned)
        const result: Array<any> = await response.json();

        // rename the object's keys to match what is used throughout the rest of the app
        return result.map((device: IPsmDevice) => {
            // For each object in the array, replace it's contents with the below object structure
            return {
                DisplayName: device.DisplayName,
                id: device.id,
                Type: device.Type,
                CommissionedDate: new Date(device.CommissionedDate).toUTCString(),
                ParentDevice: device.ParentDevice,
                GroupAssignment: device.GroupAssignment,
                UserAssignment: device.UserAssignment,
                ParentGroup: device.ParentGroup
            };
        });
        /*
            Uncomment the below code to work with the mock, and also uncomment paws mock import
        */
        // return PsmDeviceList.map((device: IPsmDevice) => {
        //     return {
        //         DisplayName: device.DisplayName,
        //         id: device.id,
        //         Type: device.Type,
        //         CommissionedDate: new Date(device.CommissionedDate).toUTCString(),
        //         ParentDevice: device.ParentDevice,
        //         GroupAssignment: device.GroupAssignment,
        //         ParentGroup: device.ParentGroup,
        //         UserAssignment: device.UserAssignment
        //     };
        // });
    };

    // Commission the specified autopilot device by using the lifecycle API
    public static commissionPaw = async (deviceList: IPsmAutopilotDevice[], pawTypeToCommission: string) => {
        // Loop through each device in the list of autopilot devices
        for (const device of deviceList) {
            // Build the URL for the specified unique autopilot device
            const commissionPawUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW/${device.azureAdDeviceId}/Commission`;

            // Build the post body
            const postBody = {
                type: pawTypeToCommission,
            };

            // make the web request with the required options and the previously built post body
            await fetch(commissionPawUrl, {
                method: 'POST',
                mode: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postBody)
            });
        };
    };

    // Decommission the specified PAW device by using the lifecycle API
    public static decommissionPaw = async (deviceList: IPsmDevice[]) => {
        // Loop through all of the specified PAWs and decommission them
        for (const device of deviceList) {
            // Build the web request url dynamically
            const commissionPawUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW/${device.id}/Commission`;

            // Make the request to decommission the PAW with the specified options
            await fetch(commissionPawUrl, {
                method: 'DELETE',
                mode: 'same-origin'
            });
        };
    };

    // Get the User Assignments for the specified PAW device
    public static async getPawAssignment(psmDevice: IPsmDevice): Promise<User[]> {
        // Build the request url
        const getAssignmentURL = `${this.API_BASE_URL}/API/Lifecycle/PAW/${psmDevice.id}/Assign`;

        // Run the Get request against the specified endpoint
        const response = await fetch(getAssignmentURL);

        // Parse the response body into JSON (the API always returns an array, an empty one if no users are assigned)
        const result: User[] = await response.json();

        // Returned the processed results
        return result;
    };

    public static async setPawAssignment(psmDevice: IPsmDevice, upnList: string[]): Promise<User[]> {
        // Build the request url
        const postAssignmentURL = `${this.API_BASE_URL}/API/Lifecycle/PAW/${psmDevice.id}/Assign`;

        // Build the post body to be used in the web request
        const postBody = {
            userList: upnList
        };

        // Run the Get request against the specified endpoint
        const response = await fetch(postAssignmentURL, {
            method: "POST",
            mode: "same-origin",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postBody)
        });

        // Parse the response body into JSON (the API always returns an array, an empty one if no users are assigned)
        const result: User[] = await response.json();

        // Returned the processed results
        return result;
    };

    public static async removePawAssignment(psmDevice: IPsmDevice, upnList: string[]): Promise<User[]> {
        // Build the request url
        const deleteAssignmentURL = `${this.API_BASE_URL}/API/Lifecycle/PAW/${psmDevice.id}/Assign`;

        // Build the delete body to be used in the web request
        const deleteBody = {
            userList: upnList
        };

        // Run the Get request against the specified endpoint
        const response = await fetch(deleteAssignmentURL, {
            method: "DELETE",
            mode: "same-origin",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteBody)
        });

        // Parse the response body into JSON (the API always returns an array, an empty one if no users are assigned)
        const result: User[] = await response.json();

        // Returned the processed results
        return result;
    };
};