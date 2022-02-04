// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { combineReducers } from 'redux';
import { commissionPaws } from './commissionPawReducer';
import { getPaws } from './gettingPawsReducer';
import { assignPaw } from "./assignmentPawReducer";

export const paw = combineReducers({
    assignPaw,
    commissionPaws,
    getPaws
});
