import React from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';

const _items: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Commission PAW',
      iconProps: { iconName: 'Share' },
      onClick: () => console.log('Share'),
    },
    {
      key: 'delete',
      text: 'Decommission Selected PAW',
      iconProps: { iconName: 'Delete' },
      onClick: () => console.log('Decommissioning PAW'),
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
          primaryGroupAriaLabel="Email actions"
          farItemsGroupAriaLabel="More actions"
        />
      </div>
    );
  };
  