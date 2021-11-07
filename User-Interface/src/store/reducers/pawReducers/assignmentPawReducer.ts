// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    GETTING_PAW_ASSIGNMENT_REQUEST,
    GETTING_PAW_ASSIGNMENT_SUCCESS,
    GETTING_PAW_ASSIGNMENT_FAILURE,
    ASSIGN_PAW_REQUEST,
    ASSIGN_PAW_SUCCESS,
    ASSIGN_PAW_FAILURE,
    UNASSIGN_PAW_REQUEST,
    UNASSIGN_PAW_SUCCESS,
    UNASSIGN_PAW_FAILURE
} from "../../actions/pawActions";

// Define the initial state of the assignment store
const initialState = {
    isGettingAssignmentList: false,
    isAssigning: false,
    isRemovingAssignment: false,
    assignedUserList: [],
    addUpnList: [],
    removeUpnList: [],
    message: undefined,
    error: undefined
};

// TODO: write docs
export function assignPaw(state = initialState, action: any) {
    switch (action.type) {
        case GETTING_PAW_ASSIGNMENT_REQUEST:
            return {
                ...state,
                isGettingAssignmentList: true,
                message: "Getting User Assignments..."
            };
        case GETTING_PAW_ASSIGNMENT_SUCCESS:
            return {
                ...state,
                isGettingAssignmentList: false,
                message: undefined,
                assignedUserList: action.payload,
                error: undefined
            };
        case GETTING_PAW_ASSIGNMENT_FAILURE:
            return {
                ...state,
                isGettingAssignmentList: false,
                error: action.payload,
                message: undefined,
            };
        case ASSIGN_PAW_REQUEST:
            return {
                ...state,
                // do stuff
            };
        case ASSIGN_PAW_SUCCESS:
            return {
                ...state,
                // do stuff
                // Put banner at top for success
            };
        case ASSIGN_PAW_FAILURE:
            return {
                ...state,
                // do stuff
            };
        case UNASSIGN_PAW_REQUEST:
            return {
                ...state,
                // do stuff
            };
        case UNASSIGN_PAW_SUCCESS:
            return {
                ...state,
                // do stuff
                // Put a banner at the top for success
            };
        case UNASSIGN_PAW_FAILURE:
            return {
                ...state,
                // do stuff
            };
        default:
            return state;
    };
};