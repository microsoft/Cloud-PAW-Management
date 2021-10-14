import * as React from 'react';
import { Nav, INavStyles, INavLinkGroup } from '@fluentui/react/lib/Nav';

const navStyles: Partial<INavStyles> = { root: { width: 300 } };

const navLinkGroups: INavLinkGroup[] = [
  {
    name: '',
    expandAriaLabel: 'Expand Basic components section',
    collapseAriaLabel: 'Collapse Basic components section',
    links: [
      {
        key: 'All groups',
        name: 'All groups',
        url: '#',
      },
      {
        key: 'Deleted groups',
        name: 'Deleted groups',
        url: '#',
      },
      {
        key: 'Diagnose and solve problems',
        name: 'Diagnose and solve problems',
        url: '#',
      },
    ],
  },
  {
    name: 'Settings',
    expandAriaLabel: 'Expand Extended components section',
    collapseAriaLabel: 'Collapse Extended components section',
    links: [
      {
        key: 'General',
        name: 'General',
        url: '#',
      },
      {
        key: 'Expiration',
        name: 'Expiration',
        url: '#',
      },
      {
        key: 'Naming policy',
        name: 'Naming policy',
        url: '#',
      },
    ],
  },
  {
    name: 'Activity',
    expandAriaLabel: 'Expand Utilities section',
    collapseAriaLabel: 'Collapse Utilities section',
    links: [
      {
        key: 'Previleged access groups (Preview)',
        name: 'FocusTrapZone',
        url: '#',
      },
      {
        key: 'Access reviews',
        name: 'FocusZone',
        url: '#',
      },
      {
        key: 'Audit logs',
        name: 'MarqueeSelection',
        url: '#',
      },
      {
         key: 'Bulk operation results',
         name: 'MarqueeSelection',
         url: '#',
       }
    ],
  },
  {
   name: 'Troubleshooting + Support',
   expandAriaLabel: 'Expand Utilities section',
   collapseAriaLabel: 'Collapse Utilities section',
   links: [
     {
        key: 'New support request',
        name: 'New support request',
        url: '#',
      }
   ],
 },
];

export const LeftNav: React.FunctionComponent = () => {
  return (
    <Nav styles={navStyles} ariaLabel="Nav example similar to one found in this demo page" groups={navLinkGroups} />
  );
};
