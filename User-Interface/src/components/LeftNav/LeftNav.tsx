import * as React from 'react';
import { Nav, INavStyles, INavLinkGroup } from '@fluentui/react/lib/Nav';

const navStyles: Partial<INavStyles> = { root: { width: 300 } };

const navLinkGroups: INavLinkGroup[] = [
  {
    name: 'Main',
    expandAriaLabel: 'Expand Main section',
    collapseAriaLabel: 'Collapse Main section',
    links: [
      {
        key: 'All PAWs',
        name: 'All PAWs',
        url: '/',
      },
      {
        key: 'Diagnose and solve problems',
        name: 'Diagnose and solve problems',
        url: '#',
      }
    ],
  },
  {
    name: 'Settings',
    expandAriaLabel: 'Expand Settings section',
    collapseAriaLabel: 'Collapse Settings section',
    links: [
      {
        key: 'General',
        name: 'General',
        url: '#',
      },
      {
        key: 'Naming Format',
        name: 'Naming Format',
        url: '#',
      }
    ],
  },
  {
    name: 'Troubleshooting + Support',
    expandAriaLabel: 'Expand Troubleshooting + Support section',
    collapseAriaLabel: 'Collapse Troubleshooting + Support section',
    links: [
      {
        key: 'New support request',
        name: 'New support request',
        url: 'mailto:elliot.huffman@microsoft.com',
      }
    ],
  },
];

export const LeftNav: React.FunctionComponent = () => {
  return (
    <Nav styles={navStyles} ariaLabel="Nav example similar to one found in this demo page" groups={navLinkGroups} />
  );
};
