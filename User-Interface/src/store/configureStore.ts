// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createStore, applyMiddleware } from 'redux';
import { configureStore } from "@reduxjs/toolkit";
import thunk from 'redux-thunk';
import { appReducer } from './reducers/appReducer';

// Legacy implementation to be migrated to the toolkit
export const store = createStore(appReducer, applyMiddleware(thunk));

// Initialize the Redux Toolkit store
export const toolkitStore = configureStore({
    reducer: {}
});

// Exposes the type of the root state of the redux store for typescript to ingest
export type RootState = ReturnType<typeof toolkitStore.getState>

// Export the dispatcher type for the redux store for typescript to ingest
export type AppDispatch = typeof store.dispatch