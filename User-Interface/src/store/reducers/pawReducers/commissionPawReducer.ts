import {
    DECOMMISSIONING_PAW_SELECTED,
    DECOMMISSIONING_PAWS_REQUEST,
    DECOMMISSIONING_PAWS_SUCCESS,
    DECOMMISSIONING_PAWS_FAILURE
} from '../../actions/pawActions';

const initialState = {
    pawsToDecommission: [],
    isPawCommissioning: false,
    isPawDecommissioning: false,
    message: undefined,
    error: undefined,
};
export const commissionPaws = (state = initialState, action: any) => {
    switch(action.type) {
        case DECOMMISSIONING_PAW_SELECTED:
            return {
                ...state,
                pawsToDecommission: [...state.pawsToDecommission, action.payload],
            };
        case DECOMMISSIONING_PAWS_REQUEST:
            return {
                ...state,
                isPawDecommissioning: true,
            };
        case DECOMMISSIONING_PAWS_SUCCESS:
            return {
                ...state,
                message: 'Decomissioning success',
                isPawDecommissioning: false,
            };
        case DECOMMISSIONING_PAWS_FAILURE:
            return {
                ...state,
                isPawDecommissioning: false,
                error: action.payload,
                message: undefined,
            };
        default:
            return state;
    }
};
