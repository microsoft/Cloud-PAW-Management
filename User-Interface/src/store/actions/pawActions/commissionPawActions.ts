import { IDeviceItem, IPawItem } from '../../../models';
import { PawService } from '../../../services';
import {
    COMMISSIONING_PAWS_REQUEST,
    COMMISSIONING_PAWS_SUCCESS,
    COMMISSIONING_PAWS_FAILURE
} from './types';

const commissioningPawsRequest = () => ({
    type: COMMISSIONING_PAWS_REQUEST,
});
const commissioningPawsSuccess = (paws: IPawItem[]) => ({
    type: COMMISSIONING_PAWS_SUCCESS,
    payload: paws
});
const commissioningPawsFailure = (error: Error) => ({
    type: COMMISSIONING_PAWS_FAILURE,
    payload: error
});

export const commissionPaws = (paws: IDeviceItem[], pawTypeToCommission: string) => {
    return async (dispatch) => {
        dispatch(commissioningPawsRequest());
        PawService.commissionPaw(paws, pawTypeToCommission) // Implement this please
        .then(paws => dispatch(commissioningPawsSuccess([])))
        .catch(error => dispatch(commissioningPawsFailure(error)))
    };
}