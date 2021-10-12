import { IPawItem } from "../models";
import { paws } from './mocks';

export interface IPawService {
    getPaws: () => Promise<IPawItem[]>
}
export class PawService {
    public static async getPaws(): Promise<IPawItem[]> {
        return paws.map((paw) => {
            return {
                pawId: paw.id,
                pawType: paw.Type,
               commissionDate: paw.CommissionedDate,
               parentDeviceId: paw.ParentDevice,
            };
        });
    }
}