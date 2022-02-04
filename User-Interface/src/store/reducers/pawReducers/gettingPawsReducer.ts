// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    GETTING_PAWS_REQUEST,
    GETTING_PAWS_SUCCESS,
    GETTING_PAWS_FAILURE,
} from '../../actions/pawActions';

const initialState = {
    paws: [],
    isGettingPaws: false,
    error: undefined,
};
export const getPaws = (state = initialState, action: any) => {
    switch(action.type) {
        case GETTING_PAWS_REQUEST:
            return {
                ...state,
                isGettingPaws: true
            };
            case GETTING_PAWS_SUCCESS:
                return {
                    ...state,
                    isGettingPaws: false,
                    paws: action.payload,
                    error: undefined,
                };
            case GETTING_PAWS_FAILURE:
                return {
                    ...state,
                    isGettingPaws: false,
                    error: action.payload
                };
            default:
                return state;
    }
};
