// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useMemo, useState } from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react/lib/Stack';
import { SelectedItems } from './SelectedItems/SelectedItems';
import { Selection, FocusZone, FocusZoneDirection } from '@fluentui/react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { IDeviceItem } from '../../../models';
import { SELECT_DEVICES_TO_COMMISSION_PAW } from '../../../store/actions/pawActions';
import { FilteredItems } from './FilteredItems/FilteredItems';

export const CommissionPawsPanelContent = () => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const devices: IDeviceItem[] = useSelector((state: RootStateOrAny) => state.devices.getDevices.devices);
    const stackTokens: Partial<IStackTokens> = { childrenGap: 0 };

    const selection = new Selection({
      onSelectionChanged: () => {
        onDeviceSelected(selection.getSelection() as IDeviceItem[])
      },
    });

    const onSearch = (newValue) => {
      setSearchTerm(newValue);
    };

    const containerStyles: IStackStyles = {
      root: {
        marginTop: 20
      },
    };
  

  const onDeviceSelected = (deviceItems: IDeviceItem[]) => {
    dispatch({
      type: SELECT_DEVICES_TO_COMMISSION_PAW,
      payload: deviceItems,
    });
  };

  const FilteredItemsMemo = useMemo(() => {
    const filteredDevices = devices.filter((device) => device.deviceId.indexOf(searchTerm) >=0 );
    return <FilteredItems items={filteredDevices}/>;
  }, [devices, searchTerm]);

  return (
    <>
      <Stack tokens={stackTokens} styles={containerStyles}>
      <FocusZone direction={FocusZoneDirection.vertical}>
        <SearchBox placeholder="Search by AAD Device ID" onSearch={onSearch} />
        {
        FilteredItemsMemo
        }
      </FocusZone>
        <SelectedItems />
      </Stack>
    </>
  );
};
