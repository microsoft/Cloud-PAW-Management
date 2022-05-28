// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { configureStore } from "@reduxjs/toolkit"
import { deviceSlice } from "../features/device"

// Configure the default store for the app
export const store = configureStore({
    reducer: {
        device: deviceSlice.reducer
    }
});

// Export the compiled RootState from the store
export type RootState = ReturnType<typeof store.getState>

// Export the compiled dispatch data
export type AppDispatch = typeof store.dispatch