import React from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';

const _items: ICommandBarItemProps[] = [
    {
      key: 'addGroup',
      text: 'Commission PAW',
      iconProps: { iconName: 'AddGroup' },
      onClick: () => console.log('Commissioning PAW'),
    },
    {
      key: 'delete',
      text: 'Decommission Selected PAW',
      iconProps: { iconName: 'Delete' },
      onClick: () => console.log('Decommissioning PAW'),
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      onClick: () => console.log('Refreshing PAW'),
    },
  ];

  
export const PawActions: React.FunctionComponent = () => {
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
  