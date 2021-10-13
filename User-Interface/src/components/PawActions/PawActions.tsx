import React from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { RootStateOrAny, useSelector } from 'react-redux';

interface IPawActionsProps {
  onCommissionPaws: () => void;
  onDecommissionPaws?: () => void;
}
export const PawActions = (props: IPawActionsProps) => {
  const pawsToDecommission = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.pawsToDecommission);

  const _items: ICommandBarItemProps[] = [
    {
      key: 'addGroup',
      text: 'Commission PAW',
      iconProps: { iconName: 'AddGroup' },
      onClick: () => props.onCommissionPaws(),
    },
    {
      key: 'delete',
      text: 'Decommission Selected PAW',
      iconProps: { iconName: 'Delete' },
      disabled: !(pawsToDecommission?.length > 0),
      onClick: () => console.log('Decommissioning PAW'),
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      onClick: () => console.log('Refreshing PAW'),
    },
  ];
    return (
      <div>
        <CommandBar
          items={_items}
          overflowItems={[]}
          overflowButtonProps={{}}
          farItems={[]}
          ariaLabel="Inbox actions"
          primaryGroupAriaLabel="PAW actions"
          farItemsGroupAriaLabel="More actions"
        />
      </div>
    );
  };
  