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
} from "./types";
import { PawService } from "../../../services";
import type { IPawItem } from "../../../models"
import type { User } from "@microsoft/microsoft-graph-types-beta";

// Define the redux store action for the start of the request
function getAssignedUserRequest() {
    return {
        type: GETTING_PAW_ASSIGNMENT_REQUEST,
    };
};

// Define the redux store action for the successful completion of the request
function getAssignedUserSuccess(userList: User[]) {
    return {
        type: GETTING_PAW_ASSIGNMENT_SUCCESS,
        payload: userList
    };
};

// Define the redux store action for the unsuccessful completion of the request
function getAssignedUserFailure(error: Error) {
    // Return the redux action object
    return {
        type: GETTING_PAW_ASSIGNMENT_FAILURE,
        payload: error
    };
};

// Execute the retrieval command async while updating the UI's state in redux when the command resolves
export function getPawAssignedUserList(pawDevice: IPawItem) {
    // Return a thunk object on execution
    return async function(dispatch): Promise<void> {
        // Set the UI state to be in the retrieval mode
        dispatch(getAssignedUserRequest());
        // Execute the get assignment command
        PawService.getPawAssignment(pawDevice)
            // After successful execution, update the UI's state with the new data
            .then(userList => dispatch(getAssignedUserSuccess(userList)))
            // After unsuccessful execution, update the UI's state with the error details
            .catch(error => dispatch(getAssignedUserFailure(error)))
    };
};

// Define the redux store action for the start of the request
function setAssignedUserRequest() {
    return {
        type: ASSIGN_PAW_REQUEST,
    };
};

// Define the redux store action for the successful completion of the request
function setAssignedUserSuccess(userList: User[]) {
    return {
        type: ASSIGN_PAW_SUCCESS,
        payload: userList
    };
};

// Define the redux store action for the unsuccessful completion of the request
function setAssignedUserFailure(error: Error) {
    // Return the redux action object
    return {
        type: ASSIGN_PAW_FAILURE,
        payload: error
    };
};

// Execute the add assignment command async while updating the UI's state in redux when the command resolves
export function setPawAssignedUserList(pawDevice: IPawItem, upnList: string[]) {
    // Return a thunk object on execution
    return async function(dispatch): Promise<void> {
        // Set the UI state to be in the addition mode
        dispatch(setAssignedUserRequest());
        // Execute the add assignment command
        PawService.setPawAssignment(pawDevice, upnList)
            // After successful execution, update the UI's state with the new data
            .then(userList => dispatch(setAssignedUserSuccess(userList)))
            // After unsuccessful execution, update the UI's state with the error details
            .catch(error => dispatch(setAssignedUserFailure(error)))
    };
};

// Define the redux store action for the start of the request
function removeAssignedUserRequest() {
    return {
        type: UNASSIGN_PAW_REQUEST,
    };
};

// Define the redux store action for the successful completion of the request
function removeAssignedUserSuccess(userList: User[]) {
    return {
        type: UNASSIGN_PAW_SUCCESS,
        payload: userList
    };
};

// Define the redux store action for the unsuccessful completion of the request
function removeAssignedUserFailure(error: Error) {
    // Return the redux action object
    return {
        type: UNASSIGN_PAW_FAILURE,
        payload: error
    };
};

// Execute the un-assignment command async while updating the UI's state in redux when the command resolves
export function removePawAssignedUserList(pawDevice: IPawItem, upnList: string[]) {
    // Return a thunk object on execution
    return async function(dispatch): Promise<void> {
        // Set the UI state to be in the removal mode
        dispatch(removeAssignedUserRequest());
        // Execute the remove assignment command
        PawService.removePawAssignment(pawDevice, upnList)
            // After successful execution, update the UI's state with the new data
            .then(userList => dispatch(removeAssignedUserSuccess(userList)))
            // After unsuccessful execution, update the UI's state with the error details
            .catch(error => dispatch(removeAssignedUserFailure(error)))
    };
};