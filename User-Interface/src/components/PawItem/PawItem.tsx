import { IPawItemProps } from './PawItem.types';
import { Checkbox, IStackTokens, Label, Stack, Text } from '@fluentui/react';

const itemAlignmentsStackTokens: IStackTokens = {
    childrenGap: 5,
    padding: 10,
  };
export const PawItem = (props: IPawItemProps) => {
    const { item } = props;
    return (
        <Stack horizontal tokens={itemAlignmentsStackTokens}>
            <Checkbox label='' boxSide="end" />
            <Label>{item.pawId}</Label>
            <Label>{item.pawType}</Label>
            <Label>{item.commissionDate}</Label>
            <Label>{item.parentDeviceId}</Label>
        </Stack>
    );
};