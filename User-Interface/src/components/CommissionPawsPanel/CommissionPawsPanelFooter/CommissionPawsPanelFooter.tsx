import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/components/Button';
import { IStackTokens, Stack } from '@fluentui/react/lib/components/Stack';
import React, { useCallback } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { commissionPaws } from '../../../store/actions/pawActions';

export const CommissionPawsPanelFooter = () => {
    const stackTokens: Partial<IStackTokens> = { childrenGap: 20 };
    const selectedItems = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.devicesToCommission);
    const pawTypeToCommission = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.pawTypeToCommission);

    const dispatch = useDispatch();

    const dismissPanel = () => {

    };
    const onCommissionPaws = useCallback(() => {
        dispatch(commissionPaws(selectedItems, pawTypeToCommission))
    }, [dispatch, selectedItems, pawTypeToCommission]);

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