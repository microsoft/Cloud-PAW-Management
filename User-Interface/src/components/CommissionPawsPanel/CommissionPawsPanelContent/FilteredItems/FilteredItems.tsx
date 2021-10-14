import React, { useCallback, useMemo } from "react";
import { DetailsList, IColumn, IconButton, Label, Stack, Selection, Dropdown, FocusZone } from "@fluentui/react";
import { useDispatch } from "react-redux";
import { IDeviceItem } from "../../../../models";
import { SELECT_DEVICES_TO_COMMISSION_PAW, SELECT_PAW_TYPE_TO_COMMISSION } from "../../../../store/actions/pawActions";

interface IFilteredItemsProps {
  items: IDeviceItem[];
}

export const FilteredItems = ({ items }: IFilteredItemsProps) => {
  const dispatch = useDispatch();

  const getKey = (item: IDeviceItem, index?: number): string => {
    return item.deviceId;
  };

  const onDeviceSelected = (deviceItems: IDeviceItem[]) => {
    dispatch({
      type: SELECT_DEVICES_TO_COMMISSION_PAW,
      payload: deviceItems,
    });
  };

  const selection = new Selection({
    onSelectionChanged: () => {
      onDeviceSelected(selection.getSelection() as IDeviceItem[])
    },
  });

  const onPawTypeChange = useCallback((event, option) => {
    dispatch({
        type: SELECT_PAW_TYPE_TO_COMMISSION,
        payload: option.key
    })
  }, [dispatch]);

  const PawTypeDropDown = useMemo(() => {
    const dropdownStyles = { dropdown: { marginTop: 20 } };
    return <Dropdown
    placeholder="Select PAW Type"
    options={[
      { key: 'Privileged', text: 'Privileged' },
      { key: 'Developer', text: 'Developer' },
      { key: 'Tactical-CR', text: 'Tactical-CR' },
      { key: 'Tactical-RRR', text: 'Tactical-RRR' },
    ]}
    onChange = {onPawTypeChange}
    styles={dropdownStyles}
  />;
  }, [onPawTypeChange])
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
    // show max of 4 search result
    return (
      <FocusZone>
        <DetailsList
        items={items.slice(0,4) || []}
        columns={[deviceSummaryColumn]}
        selection={selection}
        getKey={getKey}
        selectionPreservedOnEmptyClick={true}
        isHeaderVisible={false}
        />
        <Stack>{PawTypeDropDown}</Stack>
      </FocusZone>
    )
};
