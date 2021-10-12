
export interface IPawItem {
    pawId: string,
    pawType: string, // TODO: list of options/types
    commissionDate: string, // UTC time
    parentDeviceId?: string,
}