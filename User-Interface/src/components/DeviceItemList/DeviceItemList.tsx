// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CheckboxVisibility, DetailsList, Selection, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { IPsmAutopilotDevice, IPsmDevice } from '../../models';
import { IPawItemListProps } from './DeviceItemList.types';
import { DECOMMISSIONING_PAW_SELECTED } from '../../store/actions/pawActions'; 
export const DeviceItemList = (props: IPawItemListProps) => {
    const dispatch = useDispatch();
    const [isCompactMode, ] = useState(false);
    const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
      };
      const pawDisplayNameColumn: IColumn =       {
        key: 'pawDisplayName',
        name: 'Display Name',
        fieldName: 'DisplayName',
        minWidth: 100,
        maxWidth: 120,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };
    const pawIdColumn: IColumn =       {
        key: 'pawId',
        name: 'PAW ID',
        fieldName: 'id',
        minWidth: 275,
        maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };

      const pawTypeColumn: IColumn = {
        key: 'pawType',
        name: 'PAW Type',
        fieldName: 'Type',
        minWidth: 100,
        maxWidth: 100,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };

      const commissionDateColumn: IColumn = {
        key: 'commissionDate',
        name: 'Commission Date',
        fieldName: 'CommissionedDate',
        minWidth: 210,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };

      const parentDeviceIdColumn: IColumn =       {
        key: 'parentDeviceId',
        name: 'Parent Device',
        fieldName: 'ParentDevice',
        minWidth: 275,
        // maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };

    const columns: IColumn[] = [pawDisplayNameColumn, pawIdColumn, pawTypeColumn, commissionDateColumn, parentDeviceIdColumn];

    const  onPawSelected = (item: IPsmDevice[]) => {
      dispatch({
        type: DECOMMISSIONING_PAW_SELECTED,
        payload: item
      })
    };

    const selection = new Selection({
      onSelectionChanged: () => {
        onPawSelected(selection.getSelection() as IPsmDevice[])
      },
    });

    const getKey = (item: IPsmAutopilotDevice, index?: number): string => {
      return item.azureActiveDirectoryDeviceId;
    };

    return <DetailsList
                items={props.items}
                checkboxVisibility={CheckboxVisibility.always}
                selection={selection}
                compact={isCompactMode}
                columns={columns}
                selectionMode={SelectionMode.multiple}
                getKey={getKey}
                setKey="none"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
            />;
};