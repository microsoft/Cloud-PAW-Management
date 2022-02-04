// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { combineReducers } from 'redux';
import { getDevices } from './gettingDevicesReducer';

export const devices = combineReducers({
    getDevices,
});
