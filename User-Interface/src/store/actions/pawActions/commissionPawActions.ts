import { IDeviceItem, IPawItem } from '../../../models';
import { PawService } from '../../../services';
import {
    COMMISSIONING_PAWS_REQUEST,
    COMMISSIONING_PAWS_SUCCESS,
    COMMISSIONING_PAWS_FAILURE,
    DECOMMISSIONING_PAWS_SUCCESS,
    DECOMMISSIONING_PAWS_FAILURE,
    DECOMMISSIONING_PAWS_REQUEST
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

const decommissioningPawsRequest = () => ({
    type: DECOMMISSIONING_PAWS_REQUEST,
});

const decommissioningPawsSuccess = (paws: IPawItem[]) => ({
    type: DECOMMISSIONING_PAWS_SUCCESS,
    payload: paws
});

const decommissioningPawsFailure = (error: Error) => ({
    type: DECOMMISSIONING_PAWS_FAILURE,
    payload: error
});

export const decommissionPaws = (paws: IPawItem[]) => {
    return async (dispatch) => {
        dispatch(decommissioningPawsRequest())
        PawService.decommissionPaw(paws)
        .then(paws => dispatch(decommissioningPawsSuccess([])))
        .catch(error => dispatch(decommissioningPawsFailure(error)))
    };
}
