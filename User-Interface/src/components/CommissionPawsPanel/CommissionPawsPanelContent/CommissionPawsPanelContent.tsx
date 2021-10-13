import React, { useState } from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react/lib/Stack';
import { SelectedItems } from './SelectedItems/SelectedItems';
import { DetailsList, Selection, FocusZone, FocusZoneDirection, IColumn, IconButton, Label } from '@fluentui/react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { filterById } from '../../../store/selectors';
import { IDeviceItem } from '../../../models';
import { SELECT_DEVICES_TO_COMMISSION_PAW } from '../../../store/actions/pawActions';

export const CommissionPawsPanelContent = () => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState();
    // const filteredDevices = useSelector(state => filterById(state, searchTerm));
    const filteredDevices: IDeviceItem[] = useSelector((state: RootStateOrAny) => state.devices.getDevices.devices);
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
  const getKey = (item: IDeviceItem, index?: number): string => {
    return item.deviceId;
  };

  const onDeviceSelected = (deviceItems: IDeviceItem[]) => {
    dispatch({
      type: SELECT_DEVICES_TO_COMMISSION_PAW,
      payload: deviceItems,
    });
  };
  const deviceSummaryColumn: IColumn = {
    key: 'deviceId',
    name: 'Select to commission',
    fieldName: 'deviceId',
    minWidth: 150,
    maxWidth: 200,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    onRender: (item: IDeviceItem) => {
      return (
        <Stack horizontal>
          <IconButton iconProps={{ iconName: 'Devices3' }} title="Add" ariaLabel="Add" />  
          <Stack>
            <Stack.Item><Label>{item?.displayName}</Label></Stack.Item>
            <Stack.Item>{item?.deviceId}</Stack.Item>
          </Stack>
        </Stack>
      );
    },
    isPadded: false,
  };
  return (
    <>
      <Stack tokens={stackTokens} styles={containerStyles}>
      <FocusZone direction={FocusZoneDirection.vertical}>
        <SearchBox placeholder="Search" onSearch={onSearch} />
        { filteredDevices?.length > 0 && (
            <DetailsList
              items={filteredDevices || []}
              columns={[deviceSummaryColumn]}
              selection={selection}
              getKey={getKey}
              />
          )
        }
      </FocusZone>
        <SelectedItems />
      </Stack>
    </>
  );
};
