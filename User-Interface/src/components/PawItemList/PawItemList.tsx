import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react';
import { useState } from 'react';
import { IPawItemListProps } from './PawItemList.types';

export const PawItemList = (props: IPawItemListProps) => {
    const [isCompactMode, ] = useState(false);
    const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
      };
      const pawDisplayNameColumn: IColumn =       {
        key: 'pawDisplayName',
        name: 'Display Name',
        fieldName: 'displayName',
        minWidth: 100,
        maxWidth: 150,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };
    const pawIdColumn: IColumn =       {
        key: 'pawId',
        name: 'PAW ID',
        fieldName: 'pawId',
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
        fieldName: 'pawType',
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
        fieldName: 'commissionDate',
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
        fieldName: 'parentDeviceId',
        minWidth: 275,
        // maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        onColumnClick: onColumnClick,
        data: 'string',
        isPadded: true,
      };

    const columns: IColumn[] = [pawDisplayNameColumn, pawIdColumn, pawTypeColumn, commissionDateColumn, parentDeviceIdColumn];

    return <DetailsList
                items={props.items}
                compact={isCompactMode}
                columns={columns}
                selectionMode={SelectionMode.multiple}
                // getKey={getKeyItemKey}
                setKey="none"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                // onItemInvoked={onItemInvoked} // could be used if a pecial behaviour is needed on pressEnter
            />
};