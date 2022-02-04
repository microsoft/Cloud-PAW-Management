// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    GETTING_DEVICE_REQUEST,
    GETTING_DEVICE_SUCCESS,
    GETTING_DEVICE_FAILURE
} from '../../actions/deviceActions';

const initialState = {
    devices: [],
    isGettingDevices: false,
    error: undefined,
};
export const getDevices = (state = initialState, action: any) => {
    switch(action.type) {
        case GETTING_DEVICE_REQUEST:
            return {
                ...state,
                isGettingDevices: true
            };
            case GETTING_DEVICE_SUCCESS:
                return {
                    ...state,
                    isGettingDevices: false,
                    devices: action.payload,
                    error: undefined,
                };
            case GETTING_DEVICE_FAILURE:
                return {
                    ...state,
                    isGettingDevices: false,
                    error: action.payload
                };
            default:
                return state;
    }
};
