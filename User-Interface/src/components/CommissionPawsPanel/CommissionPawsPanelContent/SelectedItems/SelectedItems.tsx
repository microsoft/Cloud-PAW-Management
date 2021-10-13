import React from "react";
import { DetailsList, Label, Text } from "@fluentui/react";
import { RootStateOrAny, useSelector } from "react-redux";

export const SelectedItems = () => {
    const selectedItems = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.selectedItems);

    return (
    <div style={{position: 'relative', bottom: 0}}>
        <Label>Selected Items</Label>
        {selectedItems ? <DetailsList items={selectedItems || []} />
        : <Text>No Item selected</Text>}
    </div>
    )
};
