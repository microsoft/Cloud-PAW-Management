// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { IDeviceItem } from '../../../models';

import {
    DECOMMISSIONING_PAW_SELECTED,
    DECOMMISSIONING_PAWS_REQUEST,
    DECOMMISSIONING_PAWS_SUCCESS,
    DECOMMISSIONING_PAWS_FAILURE,
    SELECT_DEVICES_TO_COMMISSION_PAW,
    REMOVE_DEVICE_FROM_COMMISSION_PAW_LIST,
    SELECT_PAW_TYPE_TO_COMMISSION,
    COMMISSIONING_PAWS_REQUEST,
    COMMISSIONING_PAWS_SUCCESS,
    COMMISSIONING_PAWS_FAILURE
} from '../../actions/pawActions';

const initialState = {
    pawsToDecommission: [],
    devicesToCommission: [],
    pawTypeToCommission: undefined,
    isPawCommissioning: false,
    isPawDecommissioning: false,
    message: undefined,
    error: undefined,
};

export const commissionPaws = (state = initialState, action: any) => {
    switch (action.type) {
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
        case SELECT_PAW_TYPE_TO_COMMISSION:
            return {
                ...state,
                pawTypeToCommission: action.payload
            };
        case COMMISSIONING_PAWS_REQUEST:
            return {
                ...state,
                isPawCommissioning: true,
            };
        case COMMISSIONING_PAWS_SUCCESS:
            return {
                ...state,
                message: 'Commissioning success',
                isPawCommissioning: false,
            };
        case COMMISSIONING_PAWS_FAILURE:
            return {
                ...state,
                isPawCommissioning: false,
                error: action.payload,
                message: undefined,
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
