// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useCallback, useMemo } from "react";
import { DetailsList, IColumn, IconButton, Label, Stack, Selection, Dropdown, FocusZone } from "@fluentui/react";
import { useDispatch } from "react-redux";
import { IPsmAutopilotDevice } from "../../../../models";
import { SELECT_DEVICES_TO_COMMISSION_PAW, SELECT_PAW_TYPE_TO_COMMISSION } from "../../../../store/actions/pawActions";

interface IFilteredItemsProps {
  items: IPsmAutopilotDevice[];
}

export const FilteredItems = ({ items }: IFilteredItemsProps) => {
  const dispatch = useDispatch();

  const getKey = (item: IPsmAutopilotDevice, index?: number): string => {
    return item.azureAdDeviceId;
  };

  const onDeviceSelected = (deviceItems: IPsmAutopilotDevice[]) => {
    dispatch({
      type: SELECT_DEVICES_TO_COMMISSION_PAW,
      payload: deviceItems,
    });
  };

  const selection = new Selection({
    onSelectionChanged: () => {
      onDeviceSelected(selection.getSelection() as IPsmAutopilotDevice[])
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
      { key: 'Tactical', text: 'Tactical' },
    ]}
    onChange = {onPawTypeChange}
    styles={dropdownStyles}
  />;
  }, [onPawTypeChange])
  const deviceSummaryColumn: IColumn = {
    key: 'azureAdDeviceId',
    name: 'Select to commission',
    fieldName: 'azureAdDeviceId',
    minWidth: 150,
    maxWidth: 200,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    onRender: (item: IPsmAutopilotDevice) => {
      return (
        <Stack horizontal>
          <IconButton iconProps={{ iconName: 'Devices3' }} title="Add" ariaLabel="Add" />  
          <Stack>
            <Stack.Item><Label>{item?.displayName}</Label></Stack.Item>
            <Stack.Item>{item?.azureAdDeviceId}</Stack.Item>
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
