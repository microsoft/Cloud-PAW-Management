// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { combineReducers } from 'redux';
import { paw } from './pawReducers';
import { devices } from './deviceReducers';

export const appReducer = combineReducers({
    paw,
    devices
});

