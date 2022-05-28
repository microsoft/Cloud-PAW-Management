// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { FocusZone, FocusZoneDirection, IStackStyles, IStackTokens, SearchBox, Selection, Stack } from '@fluentui/react';
import React, { useMemo, useState } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { IPsmAutopilotDevice } from '../../../models';
import { SELECT_DEVICES_TO_COMMISSION_PAW } from '../../../store/actions/pawActions';
import { FilteredItems } from './FilteredItems/FilteredItems';
import { SelectedItems } from './SelectedItems/SelectedItems';

export const CommissionPawsPanelContent = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const devices: IPsmAutopilotDevice[] = useSelector((state: RootStateOrAny) => state.devices.getDevices.devices);
  const stackTokens: Partial<IStackTokens> = { childrenGap: 0 };

  const selection = new Selection({
    onSelectionChanged: () => {
      onDeviceSelected(selection.getSelection() as IPsmAutopilotDevice[])
    },
  });

  const onSearch = (newValue: string) => {
    setSearchTerm(newValue.toLowerCase());
  };

  const containerStyles: IStackStyles = {
    root: {
      marginTop: 20
    },
  };


  const onDeviceSelected = (deviceItems: IPsmAutopilotDevice[]) => {
    dispatch({
      type: SELECT_DEVICES_TO_COMMISSION_PAW,
      payload: deviceItems,
    });
  };

  const FilteredItemsMemo = useMemo(
    () => {
      if (searchTerm === "") {
        var filteredDevices = devices;
      } else {
        filteredDevices = devices.filter((device) => {
          if (device.azureAdDeviceId.toLowerCase().includes(searchTerm) || device.displayName?.toLowerCase().includes(searchTerm)) {
            return true
          } else {
            return false
          } 
        });
      }
      return <FilteredItems items={filteredDevices} />;
    },
    [devices, searchTerm]
  );

  return (
    <>
      <Stack tokens={stackTokens} styles={containerStyles}>
        <FocusZone direction={FocusZoneDirection.vertical}>
          <SearchBox placeholder="Search Autopilot Devices" onSearch={onSearch} />
          {
            FilteredItemsMemo
          }
        </FocusZone>
        <SelectedItems />
      </Stack>
    </>
  );
};
