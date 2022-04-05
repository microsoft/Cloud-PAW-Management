// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DefaultButton, IStackTokens, PrimaryButton, Stack } from '@fluentui/react';
import React, { useCallback } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { commissionPaws } from '../../../store/actions/pawActions';

export const CommissionPawsPanelFooter = (props) => {
    const stackTokens: Partial<IStackTokens> = { childrenGap: 20 };
    const selectedItems = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.devicesToCommission);
    const pawTypeToCommission = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.pawTypeToCommission);

    const dispatch = useDispatch();

    const dismissPanel = () => {
        props.onDismissPanel();
    };
    const onCommissionPaws = useCallback(() => {
        dispatch(commissionPaws(selectedItems, pawTypeToCommission));
        props.onDismissPanel();
    }, [dispatch, selectedItems, pawTypeToCommission, props]);

    return (
        <Stack tokens={stackTokens} horizontal>
            <PrimaryButton
                onClick={onCommissionPaws}
                disabled={!pawTypeToCommission || !selectedItems || selectedItems.length <= 0 }
                >
                Commission PAW
            </PrimaryButton>
            <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
        </Stack>
    );
};