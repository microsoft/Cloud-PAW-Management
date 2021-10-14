import { IDeviceItem } from '../../../models';
import {
    DECOMMISSIONING_PAW_SELECTED,
    DECOMMISSIONING_PAWS_REQUEST,
    DECOMMISSIONING_PAWS_SUCCESS,
    DECOMMISSIONING_PAWS_FAILURE,
    SELECT_DEVICES_TO_COMMISSION_PAW,
    REMOVE_DEVICE_FROM_COMMISSION_PAW_LIST
} from '../../actions/pawActions';

const initialState = {
    pawsToDecommission: [],
    devicesToCommission: [],
    isPawCommissioning: false,
    isPawDecommissioning: false,
    message: undefined,
    error: undefined,
};
export const commissionPaws = (state = initialState, action: any) => {
    switch(action.type) {
        case DECOMMISSIONING_PAW_SELECTED:
            return {
                ...state,
                pawsToDecommission: [...action.payload],
            };
        case DECOMMISSIONING_PAWS_REQUEST:
            return {
                ...state,
                isPawDecommissioning: true,
            };
        case DECOMMISSIONING_PAWS_SUCCESS:
            return {
                ...state,
                message: 'Decomissioning success',
                isPawDecommissioning: false,
            };
        case DECOMMISSIONING_PAWS_FAILURE:
            return {
                ...state,
                isPawDecommissioning: false,
                error: action.payload,
                message: undefined,
            };
        case SELECT_DEVICES_TO_COMMISSION_PAW:
            return {
                ...state,
                devicesToCommission: [...action.payload]
            };
            case REMOVE_DEVICE_FROM_COMMISSION_PAW_LIST:
                return {
                    ...state,
                    devicesToCommission: state.devicesToCommission.filter((device: IDeviceItem) => device.deviceId !== action.payload.deviceId)
                };
        default:
            return state;
    }
};
