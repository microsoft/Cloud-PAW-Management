import dateformat from 'dateformat';
import { IDeviceItem, IPawItem } from "../models";
import { paws } from './mocks/pawMocks';

export interface IPawService {
    getPaws: () => Promise<IPawItem[]>,
    commissionPaw: (paw: IDeviceItem) => Promise<void>,
    decommissionPaw: (paws: IPawItem[]) => Promise<string[]>, // return list of decommissioned Paws
}
export class PawService {
    public static API_BASE_URL = document.location.origin;
    public static async getPaws(): Promise<IPawItem[]> {
        // const getPawsUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW`
        // const response = await fetch(getPawsUrl);
        // const result = await response.json();
        // return result.map((paw) => {
        //     return {
        //         displayName: paw.DisplayName,
        //         pawId: paw.id,
        //         pawType: paw.Type,
        //         commissionDate: dateformat(paw.CommissionedDate,'yyyy/mm/dd H:mm'),
        //         parentDeviceId: paw.ParentDevice,
        //     };   
        // });
        /*
        uncomment the below code to work with the mock, and also uncomment paws mock import
        */
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
    public static commissionPaw = async (deviceItems: IDeviceItem[], pawTypeToCommission: string) => {
        for(const deviceItem of deviceItems) {
            const commissionPawUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW/${deviceItem.deviceId}/Commission`;
            const data = {
                type: pawTypeToCommission,
            };
            const commissionPawResponse = await fetch(commissionPawUrl, {
                method: 'POST',
                mode: 'same-origin',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              });
        }
    }
    public static decommissionPaw = async (pawItems: IPawItem[]) => {
        for(const pawItem of pawItems) {
            const commissionPawUrl = `${this.API_BASE_URL}/API/Lifecycle/PAW/${pawItem.pawId}`;
            const deletePawResponse = await fetch(commissionPawUrl, {
                method: 'DELETE',
                mode: 'same-origin',
            });
        }
    }
}