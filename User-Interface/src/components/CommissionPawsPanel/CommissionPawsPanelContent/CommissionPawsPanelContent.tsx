import React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react/lib/Stack';
import { SelectedItems } from './SelectedItems/SelectedItems';

export const CommissionPawsPanelContent = () => {
    const stackTokens: Partial<IStackTokens> = { childrenGap: 20 };
    const containerStyles: IStackStyles = {
      root: {
        marginTop: 20
      },
    };
  return (
    <>
      <Stack tokens={stackTokens} styles={containerStyles}>
        <SearchBox placeholder="Search" onSearch={newValue => console.log('value is ' + newValue)} />
        <SelectedItems />
      </Stack>
    </>
  );
};
