// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { IPsmAutopilotDevice } from "../models";
// import { autopilotDeviceList } from '../models/mocks/autopilotDeviceMock';

export interface IDeviceService {
    getDevices: () => Promise<IPsmAutopilotDevice[]>,
}
export class DeviceService {
    public static API_BASE_URL = document.location.origin;
    public static async getDevices(): Promise<IPsmAutopilotDevice[]> {

        /*
         Comment the following code to work with device mocks
        */

        //  Define the URL to query against
        const getDevicesUrl = `${this.API_BASE_URL}/API/Lifecycle/AutopilotDevice`

        // Grab a list of autopilot devices
        const response = await fetch(getDevicesUrl);

        // Parse the JSON return of the API call
        const result = await response.json();

        // Return the specified
        return result.map((device: IPsmAutopilotDevice) => {
            let computedName = "";
            computedName = device.displayName === undefined || device.displayName === "" ? device.serialNumber : device.displayName
            return {
                displayName: computedName,
                azureActiveDirectoryDeviceId: device.azureActiveDirectoryDeviceId,
                azureAdDeviceId: device.azureActiveDirectoryDeviceId,
                serialNumber: device.serialNumber
            };
        });

        /*
         uncomment the following return to work with device mocks, also uncomment devices mock import above
        */

        // Map the mock data to the redux store's device list format
        // return autopilotDeviceList.map((device) => {
        //     if (device.displayName === undefined) { device.displayName = device.serialNumber }
        //     return {
        //         displayName: device.displayName,
        //         azureActiveDirectoryDeviceId: device.azureActiveDirectoryDeviceId,
        //         azureAdDeviceId: device.azureAdDeviceId,
        //         serialNumber: device.serialNumber
        //     };
        // });
    }
}