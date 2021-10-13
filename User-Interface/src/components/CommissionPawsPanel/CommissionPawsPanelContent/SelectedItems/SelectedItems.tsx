import { DetailsList } from "@fluentui/react";
import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

export const SelectedItems = () => {
    const selectedItems = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.selectedItems);

    return <DetailsList items={selectedItems || []} />
};
