// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createStore, applyMiddleware } from 'redux';
import { configureStore } from "@reduxjs/toolkit";
import thunk from 'redux-thunk';
import { appReducer } from './reducers/appReducer';

// TODO: Legacy implementation to be migrated to the toolkit
export const store = createStore(appReducer, applyMiddleware(thunk));