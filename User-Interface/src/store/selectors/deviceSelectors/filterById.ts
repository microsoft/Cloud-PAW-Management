//
export const filterById = (state, id) => {
    const filteredById = state.devices.getDevices.devices.filter(device => device.deviceId.indexOf(id)>=0);
    return filteredById;
}