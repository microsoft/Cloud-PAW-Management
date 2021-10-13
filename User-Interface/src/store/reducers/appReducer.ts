import { combineReducers } from 'redux';
import { paw } from './pawReducers';
export const appReducer = combineReducers({
    paw,
});

