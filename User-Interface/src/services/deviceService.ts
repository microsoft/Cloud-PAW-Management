import { IDeviceItem } from "../models";
// import { autopilotDeviceList } from '../models/mocks/autopilotDeviceMock';

export interface IDeviceService {
    getDevices: () => Promise<IDeviceItem[]>,
}
export class DeviceService {
    public static API_BASE_URL = document.location.origin;
    public static async getDevices(): Promise<IDeviceItem[]> {
        const getDevicesUrl = `${this.API_BASE_URL}/API/Lifecycle/AutopilotDevice`
        const response = await fetch(getDevicesUrl);
        const result = await response.json();
        return result.map((device) => {
            return {
                displayName: device.displayName,
                deviceId: device.azureActiveDirectoryDeviceId,
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