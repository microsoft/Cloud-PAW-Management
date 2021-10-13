import { IDeviceItem } from "../models";
import { devices } from './mocks/deviceMocks';

export interface IDeviceService {
    sgetDevices: () => Promise<IDeviceItem[]>,
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