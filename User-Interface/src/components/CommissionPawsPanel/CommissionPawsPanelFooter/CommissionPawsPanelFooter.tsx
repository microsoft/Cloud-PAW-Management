import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/components/Button';
import { IStackTokens, Stack } from '@fluentui/react/lib/components/Stack';
import React from 'react';

export const CommissionPawsPanelFooter = () => {
    const stackTokens: Partial<IStackTokens> = { childrenGap: 20 };
    const dismissPanel = () => {

    };
    return (
        <Stack tokens={stackTokens} horizontal>
            <PrimaryButton onClick={dismissPanel}>
                Commission PAW
            </PrimaryButton>
            <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
        </Stack>
    );
};