import { IDeviceItem } from "../models";
import { devices } from './mocks/deviceMocks';

export interface IDeviceService {
    getDevices: () => Promise<IDeviceItem[]>,
}
export class DeviceService {
    public static async getDevices(): Promise<IDeviceItem[]> {
        return devices.map((device) => {
            return {
                displayName: device.displayName,
                deviceId: device.id,
            };
        });
    }
}