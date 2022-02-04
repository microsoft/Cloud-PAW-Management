// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { DetailsList, IColumn, IconButton, Label, Stack } from "@fluentui/react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { IDeviceItem } from "../../../../models";
import { REMOVE_DEVICE_FROM_COMMISSION_PAW_LIST } from "../../../../store/actions/pawActions";

export const SelectedItems = () => {
    const selectedItems = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.devicesToCommission);
    const dispatch = useDispatch();

    const onRemoveSelectedDevice = (deviceItem: IDeviceItem) => {
        dispatch({
            type: REMOVE_DEVICE_FROM_COMMISSION_PAW_LIST,
            payload: deviceItem
        })
    };

    const deviceSummaryColumn: IColumn = {
        key: 'deviceId',
        name: 'Selected Items',
        fieldName: 'deviceId',
        minWidth: 150,
        maxWidth: 200,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
        onRender: (item: IDeviceItem) => {
          return (
            <Stack horizontal>
              <IconButton iconProps={{ iconName: 'Devices3' }} title="Autopilot Device" ariaLabel="Autopilot Device" />  
              <Stack>
                <Stack.Item><Label>{item?.displayName}</Label></Stack.Item>
                <Stack.Item>{item?.deviceId}</Stack.Item>
              </Stack>
              <Stack style={{position: 'absolute', right: 0}}>
                <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    title="Remove" ariaLabel="Remove"
                    onClick={() => onRemoveSelectedDevice(item)}
                />  
              </Stack>
            </Stack>
          );
        },
        isPadded: false,
      };
    return (
    <div style={{position: 'relative', top: 50}}>
        {(selectedItems && selectedItems.length > 0)
        ? <DetailsList items={selectedItems || []} columns={[deviceSummaryColumn]}/>
        : <Label>No Item selected</Label>
        }
    </div>
    )
};
