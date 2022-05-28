import type { User } from "@microsoft/microsoft-graph-types-beta";
import { IDeviceItem, IPawItem } from "../models";
// import { PsmDeviceList } from '../models/mocks';

export interface IPawService {
    getPaws: () => Promise<IPawItem[]>,
    commissionPaw: (paw: IDeviceItem) => Promise<void>,
    decommissionPaw: (paws: IPawItem[]) => Promise<string[]>, // return list of decommissioned Paws
}
export class PawService {
    // Get the current host name and port (if there is a port)
    public static API_BASE_URL = document.location.origin;

    // Get a list of PAW devices from the Server's Lifecycle API
    public static async getPaws(): Promise<IPawItem[]> {
        // Build the URL to run the API request against
        const getPawsUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW`;

        // Run the Get request against the specified endpoint
        const response = await fetch(getPawsUrl);

        // Parse the response body into JSON (the API always returns an array, an empty one if no PAWs are commissioned)
        const result: Array<any> = await response.json();

        // rename the object's keys to match what is used throughout the rest of the app
        return result.map((paw) => {
            // For each object in the array, replace it's contents with the below object structure
            return {
                displayName: paw.DisplayName,
                pawId: paw.id,
                pawType: paw.Type,
                commissionDate: new Date(paw.CommissionedDate).toUTCString(),
                parentDeviceId: paw.ParentDevice,
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
    public static commissionPaw = async (deviceList: IDeviceItem[], pawTypeToCommission: string) => {
        // Loop through each device in the list of autopilot devices
        for (const device of deviceList) {
            // Build the URL for the specified unique autopilot device
            const commissionPawUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW/${device.deviceId}/Commission`;

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
    public static decommissionPaw = async (pawList: IPawItem[]) => {
        // Loop through all of the specified PAWs and decommission them
        for (const paw of pawList) {
            // Build the web request url dynamically
            const commissionPawUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW/${paw.pawId}/Commission`;

            // Make the request to decommission the PAW with the specified options
            await fetch(commissionPawUrl, {
                method: 'DELETE',
                mode: 'same-origin'
            });
        };
    };

    // Get the User Assignments for the specified PAW device
    public static async getPawAssignment(pawDevice: IPawItem): Promise<User[]> {
        // Build the request url
        const getAssignmentURL = `${this.API_BASE_URL}/API/Lifecycle/PAW/${pawDevice.pawId}/Assign`;

        // Run the Get request against the specified endpoint
        const response = await fetch(getAssignmentURL);

        // Parse the response body into JSON (the API always returns an array, an empty one if no users are assigned)
        const result: User[] = await response.json();

        // Returned the processed results
        return result;
    };

    public static async setPawAssignment(pawDevice: IPawItem, upnList: string[]): Promise<User[]> {
        // Build the request url
        const postAssignmentURL = `${this.API_BASE_URL}/API/Lifecycle/PAW/${pawDevice.pawId}/Assign`;

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

    public static async removePawAssignment(pawDevice: IPawItem, upnList: string[]): Promise<User[]> {
        // Build the request url
        const deleteAssignmentURL = `${this.API_BASE_URL}/API/Lifecycle/PAW/${pawDevice.pawId}/Assign`;

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