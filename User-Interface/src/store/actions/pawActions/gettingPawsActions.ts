import { IPawItem } from '../../../models';
import { PawService } from '../../../services';
import { GETTING_PAWS_REQUEST,
    GETTING_PAWS_SUCCESS,
    GETTING_PAWS_FAILURE
} from './types';

const gettingPawsRequest = () => ({
    type: GETTING_PAWS_REQUEST,
});
const gettingPawsSuccess = (paws: IPawItem[]) => ({
    type: GETTING_PAWS_SUCCESS,
    payload: paws
});
const gettingPawsFailure = (error: Error) => ({
    type: GETTING_PAWS_FAILURE,
    payload: error
});

export const getPaws = () => {
    return async (dispatch) => {
        dispatch(gettingPawsRequest());
        PawService.getPaws()
        .then(paws => dispatch(gettingPawsSuccess(paws)))
        .catch(error => dispatch(gettingPawsFailure(error)))
    };
}