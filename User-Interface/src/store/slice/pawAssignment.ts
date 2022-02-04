// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@microsoft/microsoft-graph-types-beta";

// Define the structure of the initial state and its metadata
export interface PawAssignmentState {
    isGettingAssignmentList: boolean,
    isAssigning: boolean,
    isRemovingAssignment: boolean,
    assignedUserList: User[],
    addUpnList: User[],
    removeUpnList: string[],
    message: string | undefined,
    error: any | undefined
}

// Define the initial state of the assignment store
const initialState: PawAssignmentState = {
    isGettingAssignmentList: false,
    isAssigning: false,
    isRemovingAssignment: false,
    assignedUserList: [],
    addUpnList: [],
    removeUpnList: [],
    message: undefined,
    error: undefined
};

// Define the thunk for the PAW Assignment List action
export const getPawAssignmentListThunk = createAsyncThunk(
    'pawAssignment/getAssignmentList',
    async (pawId, thunkAPI): Promise<User[] | any> => {
        // Catch errors during execution
        try {
            // Do something here
            const response = await fetch(`${document.location.origin}/API/Lifecycle/PAW/${pawId}/Assign`);

            // Parse the response body into JSON (the API always returns an array, an empty one if no PAWs are commissioned)
            const result: User[] = await response.json();

            // Return the results
            return result
        } catch (error) { // if an error was thrown
            // Reject the thunk and return the execution of the 
            thunkAPI.rejectWithValue(error);
        }
    }
);

// Create the slice and export it to the caller
export const pawAssignmentSlice = createSlice({
    // Name the slice internally in redux
    name: "pawAssignment",

    // Define the initial state of the slice
    initialState,

    // Define the reducers for the slice
    reducers: {},
    extraReducers: (builder) => {
        // Operate on the reducer builder parameter
        builder
            // Create a thunk reducer to set the state when a request starts
            .addCase(getPawAssignmentListThunk.pending, (state) => {
                // Set the state to indicate that a request is in progress
                state.isGettingAssignmentList = true;

                // Set the status message for the state
                state.message = "Getting User Assignments...";
            })
            // Create a thunk reducer to set the state when a request finishes successfully
            .addCase(getPawAssignmentListThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
                /// Set the state to indicate that a request is not in progress
                state.isGettingAssignmentList = false;

                // Clear the status message
                state.message = undefined;

                // Populate the PAW's assigned user list state with the results of the action
                state.assignedUserList = action.payload;

                // Because the operation was successful, clear the error state
                state.error = undefined;
            })
            // Create a thunk reducer to set the state when a request fails
            .addCase(getPawAssignmentListThunk.rejected, (state, action: PayloadAction<any>) => {
                // Set the state to indicate that a request is not in progress
                state.isGettingAssignmentList = false;

                // Set the state to contain the results of the error
                state.error = action.payload;

                // Clear the current status message
                state.message = undefined;
            })
    }
});

// Export the actions of the slice
// export const {  } = pawAssignmentSlice.actions;

// Export the reducers by default
export default pawAssignmentSlice.reducer;