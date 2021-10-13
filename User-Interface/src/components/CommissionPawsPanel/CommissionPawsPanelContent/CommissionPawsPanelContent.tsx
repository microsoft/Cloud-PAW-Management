import React, { useState } from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react/lib/Stack';
import { SelectedItems } from './SelectedItems/SelectedItems';
import { FocusZone, FocusZoneDirection, getFocusStyle, getTheme, IconButton, ITheme, Label, List, mergeStyleSets } from '@fluentui/react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { filterById } from '../../../store/selectors';
import { IDeviceItem } from '../../../models';

export const CommissionPawsPanelContent = () => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState();
    // const filteredDevices = useSelector(state => filterById(state, searchTerm));
    const filteredDevices: IDeviceItem[] = useSelector((state: RootStateOrAny) => state.devices.getDevices.devices);
    const stackTokens: Partial<IStackTokens> = { childrenGap: 20 };

    const onSearch = (newValue) => {
      console.log('search term', newValue);
      console.log('filteredItems', filteredDevices);
      setSearchTerm(newValue);
    };
    const containerStyles: IStackStyles = {
      root: {
        marginTop: 20
      },
    };
    const theme: ITheme = getTheme();
    const { palette, semanticColors, fonts } = theme;
    const classNames = mergeStyleSets({
      itemCell: [
        getFocusStyle(theme, { inset: -1 }),
        {
          minHeight: 54,
          padding: 10,
          boxSizing: 'border-box',
          borderBottom: `1px solid ${semanticColors.bodyDivider}`,
          display: 'flex',
          selectors: {
            '&:hover': { background: palette.neutralLight },
          },
        },
      ],});
  const onRenderCell = (item?: IDeviceItem) => {
    return (
      <div data-is-focusable={true} className={classNames.itemCell}>
      <Stack horizontal>
        <IconButton iconProps={{ iconName: 'Devices3' }} title="Add" ariaLabel="Add" />  
        <Stack>
          <Stack.Item><Label>{item?.displayName}</Label></Stack.Item>
          <Stack.Item>{item?.deviceId}</Stack.Item>
        </Stack>
      </Stack>
    </div>
    );
  };
  const onDeviceSelected = (item: IDeviceItem) => {
    dispatch({
      type: 'ADD_SELECTED_DEVICE',
      payload: item,
    });
  };
  return (
    <>
      <Stack tokens={stackTokens} styles={containerStyles}>
      <FocusZone direction={FocusZoneDirection.vertical}>
        <SearchBox placeholder="Search" onSearch={onSearch} />
        <List items={filteredDevices || []} onRenderCell={onRenderCell} />
      </FocusZone>
        <SelectedItems />
      </Stack>
    </>
  );
};
