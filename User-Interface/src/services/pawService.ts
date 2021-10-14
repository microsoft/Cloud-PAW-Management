import dateformat from 'dateformat';
import { IDeviceItem, IPawItem } from "../models";
import { paws } from './mocks/pawMocks';

export interface IPawService {
    getPaws: () => Promise<IPawItem[]>,
    commissionPaw: (paw: IPawItem) => Promise<void>,
    decommissionPaw: (paws: IPawItem[]) => Promise<string[]>, // return list of decommissioned Paws
}
export class PawService {
    public static async getPaws(): Promise<IPawItem[]> {
        return paws.map((paw) => {
            return {
                displayName: paw.DisplayName,
                pawId: paw.id,
                pawType: paw.Type,
                commissionDate: dateformat(paw.CommissionedDate,'yyyy/mm/dd H:mm'),
                parentDeviceId: paw.ParentDevice,
            };
        });
    }
    public static commissionPaw = async (items: IDeviceItem[]) => {
        // call api
        // get response
    }
}