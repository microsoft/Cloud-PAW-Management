import React from "react";
import { DetailsList, IColumn, IconButton, Label, Stack, Selection } from "@fluentui/react";
import { useDispatch } from "react-redux";
import { IDeviceItem } from "../../../../models";
import { SELECT_DEVICES_TO_COMMISSION_PAW } from "../../../../store/actions/pawActions";

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
      <DetailsList
      items={items.slice(0,4) || []}
      columns={[deviceSummaryColumn]}
      selection={selection}
      getKey={getKey}
      selectionPreservedOnEmptyClick={true}
      />
    )
};
