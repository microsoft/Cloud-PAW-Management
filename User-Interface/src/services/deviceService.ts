import { IDeviceItem } from "../models";
// import { devices } from './mocks/deviceMocks';

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

        // return devices.map((device) => {
        //     return {
        //         displayName: device.displayName,
        //         deviceId: device.azureActiveDirectoryDeviceId,
        //     };
        // });
    }
}