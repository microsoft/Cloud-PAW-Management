import { List } from '@fluentui/react';
import { useCallback } from 'react';
import { PawItem } from '../PawItem/PawItem';
import { IPawItemListProps } from './PawItemList.types';

export const PawItemList = (props: IPawItemListProps) => {
    const onRenderCell = useCallback((pawItem) => {
        return <PawItem item={pawItem} />;
    }, []);
    return <List items={props.items} onRenderCell={onRenderCell} />;
};