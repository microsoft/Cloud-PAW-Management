import { DefaultPalette, IStackStyles, Stack, StackItem } from '@fluentui/react';
import React from 'react';
import { Header } from '../Header/Header';

export const PawLanding = () => {
    const stackStyles: IStackStyles = {
        root: {
          background: DefaultPalette.themeTertiary,
        },
      };
    return (
    <>
    <Stack><Header/></Stack>
    <Stack styles={stackStyles} horizontal>
        <Stack.Item>
            <h1>Menu</h1>
        </Stack.Item>
        <Stack.Item>
            <Stack>
                <Stack.Item>PawActions</Stack.Item>
                <Stack.Item>List of Paws</Stack.Item>
            </Stack>
        </Stack.Item>
    </Stack>
    </>
    );
};
