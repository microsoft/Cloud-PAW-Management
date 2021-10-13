import { combineReducers } from 'redux';
import { getDevices } from './gettingDevicesReducer';

export const devices = combineReducers({
    getDevices,
});
