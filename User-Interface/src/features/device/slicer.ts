// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"
import { PsmDeviceList } from "../../models/mocks";
import type { RootState } from "../../store/store"
import type { IPsmDevice } from "../../models"

// Create an empty device list to satisfy the type checker
const emptyDeviceList: IPsmDevice[] = [];

// Create the device slicer
export const deviceSlice = createSlice({
    // Domain of device
    name: 'device',
    // Initially empty
    initialState: { deviceList: emptyDeviceList },
    // Actions that can be performed on this data structure
    reducers: {
        // Set the list of devices, this is usually called when the get devices API is called. Can completly replace all devices
        setDeviceList: (state, action: PayloadAction<IPsmDevice[]>) => {
            state.deviceList = action.payload;
        },
        // Create a new device from an existing autopilot device
        commissionDevice: (state, action: PayloadAction<IPsmDevice>) => {
            // Add a new device to the beginning of the array
            state.deviceList.unshift(action.payload);
        },
        // Remove the specified device
        decommissionDevice: (state, action: PayloadAction<string>) => {
            // Return the specified device by ID
            state.deviceList.filter((device) => { return device.id !== action.payload });
        },
    }
})

// Expose the reducer's actions
export const { setDeviceList, commissionDevice, decommissionDevice } = deviceSlice.actions

// Get the list of devices from the server's API
// TODO: finish async retrieval later
export function getDeviceList() {
    setTimeout(
        (dispatch) => {
            dispatch(setDeviceList(PsmDeviceList))
        },
        1000
    );
}

// Configure a selector for the device list
export function selectDevice(state: RootState) {
    return state.device.deviceList
}