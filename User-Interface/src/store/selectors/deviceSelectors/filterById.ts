// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export const filterById = (state, id) => {
    const filteredById = state.devices.getDevices.devices.filter(device => device.azureAdDeviceId.indexOf(id)>=0);
    return filteredById;
};