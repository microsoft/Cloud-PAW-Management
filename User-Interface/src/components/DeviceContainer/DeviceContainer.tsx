// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DefaultPalette, IStackStyles, Stack, ThemeProvider } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import React, { useEffect } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { getPaws } from '../../store/actions/pawActions';
import { darkTheme } from '../../themes';
import { CommissionPawsPanel } from '../CommissionPawsPanel';
import { DeviceItemList } from '../DeviceItemList/DeviceItemList';
import { Header } from '../Header/Header';
import { LeftNav } from '../LeftNav/LeftNav';
import { PawActions } from '../PawActions';

initializeIcons(/* optional base url */);

export const DeviceContainer = () => {
  const dispatch = useDispatch();
  const paws = useSelector((state: RootStateOrAny) => state.paw.getPaws.paws);
  const [isCommissionPawsPanelOpen, { setTrue: openCommissionPawsPanel, setFalse: dismissCommissionPawsPanel }] = useBoolean(false);

  useEffect(() => {
    dispatch(getPaws())
  }, [dispatch]);
  const stackStyles: IStackStyles = {
    root: {

    },
  };
  const leftNavStyles: IStackStyles = {
    root: {
      //background: DefaultPalette.themeDark,
      color: DefaultPalette.white,
      minWidth: '300px',
      display: 'grid'
    },
  };
  const contentStyles: IStackStyles = {
    root: {
      //color: DefaultPalette.white,
      width: '100%',
      minWidth: '900px',
      display: 'grid'
    },
  };
  return (
    <ThemeProvider
      applyTo="body"
      theme={darkTheme}
    >
      <Stack><Header /></Stack>
      <Stack styles={stackStyles} horizontal>
        <Stack.Item styles={leftNavStyles}>
          <h1><LeftNav /></h1>
        </Stack.Item>
        <Stack.Item>
          <Stack styles={contentStyles}>
            <Stack>
              <PawActions onCommissionPaws={openCommissionPawsPanel} />
            </Stack>
            <Stack styles={contentStyles}>
              <DeviceItemList items={paws} />
            </Stack>
          </Stack>
        </Stack.Item>
      </Stack>
      <CommissionPawsPanel isOpen={isCommissionPawsPanelOpen} onDismissPanel={dismissCommissionPawsPanel} />
    </ThemeProvider>
  );
};
