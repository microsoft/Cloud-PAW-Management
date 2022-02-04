// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IDeviceItem } from '../../../models';
import { DeviceService } from '../../../services/deviceService';
import {
    GETTING_DEVICE_REQUEST,
    GETTING_DEVICE_SUCCESS,
    GETTING_DEVICE_FAILURE
} from './types';

const gettingDeviceRequest = () => ({
    type: GETTING_DEVICE_REQUEST,
});
const gettingDevicesSuccess = (devices: IDeviceItem[]) => ({
    type: GETTING_DEVICE_SUCCESS,
    payload: devices
});
const gettingDevicesFailure = (error: Error) => ({
    type: GETTING_DEVICE_FAILURE,
    payload: error
});

export const getDevices = () => {
    return async (dispatch) => {
        dispatch(gettingDeviceRequest());
        DeviceService.getDevices()
        .then(devices => dispatch(gettingDevicesSuccess(devices)))
        .catch(error => dispatch(gettingDevicesFailure(error)))
    };
}