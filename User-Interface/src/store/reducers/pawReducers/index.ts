import { combineReducers } from 'redux';
import { commissionPaws } from './commissionPawReducer';
import { getPaws } from './gettingPawsReducer';

export const paw = combineReducers({
    commissionPaws,
    getPaws
});
