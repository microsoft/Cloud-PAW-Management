
export interface IPawItem {
    displayName: string;
    pawId: string,
    pawType: string, // TODO: list of options/types
    commissionDate: string, // UTC time
    parentDeviceId?: string,
}