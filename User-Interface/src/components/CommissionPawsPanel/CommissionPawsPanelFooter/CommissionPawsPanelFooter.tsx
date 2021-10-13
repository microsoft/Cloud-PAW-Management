import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/components/Button';
import { IStackTokens, Stack } from '@fluentui/react/lib/components/Stack';
import React from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';

export const CommissionPawsPanelFooter = () => {
    const stackTokens: Partial<IStackTokens> = { childrenGap: 20 };
    const selectedItems = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.devicesToCommission);

    const dismissPanel = () => {

    };
    return (
        <Stack tokens={stackTokens} horizontal>
            <PrimaryButton
                onClick={dismissPanel}
                disabled={!selectedItems || selectedItems.length <= 0 }
                >
                Commission PAW
            </PrimaryButton>
            <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
        </Stack>
    );
};