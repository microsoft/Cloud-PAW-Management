// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
    // Domain of slicer
    name: 'ui',
    // Initially empty
    initialState: { commissionMode: false },
    // Actions that can be performed on this data structure
    reducers: {}
});