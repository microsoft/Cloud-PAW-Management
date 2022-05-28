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
        key: 'Home',
        name: 'Home',
        url: '/',
      },
      {
        key: 'All PAWs',
        name: 'All PAWs',
        url: '/devices',
      },
      {
        key: 'User Management',
        name: 'User Management',
        url: '#',
      },
      {
        key: 'Silo Management',
        name: 'Silo Management',
        url: '#',
      },
      {
        key: 'Privileged Secure Score',
        name: 'Privileged Secure Score',
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
        key: "Access control (IAM)",
        name: "Access control (IAM)",
        url: "#"
      },
      {
        key: 'Naming Format',
        name: 'Naming Format',
        url: '#',
      }
    ],
  },
  {
    name: 'Support + troubleshooting',
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
