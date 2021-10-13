import React, { useEffect } from 'react';
import { DefaultPalette, IStackStyles, Stack, } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { PawActions } from '../PawActions';
import { PawItemList } from '../PawItemList/PawItemList';
import { Header } from '../Header/Header';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { getPaws } from '../../store/actions/pawActions';
import { CommissionPawsPanel } from '../CommissionPawsPanel';

initializeIcons(/* optional base url */);

export const PawLanding = () => {
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
          background: DefaultPalette.themeDark,
          color: DefaultPalette.white,
          minWidth: '300px',
          display: 'grid'
        },
      };
      const contentStyles: IStackStyles = {
        root: {
          color: DefaultPalette.white,
          width: '100%',
          minWidth: '900px',
          display: 'grid'
        },
      };
    return (
    <>
    <Stack><Header/></Stack>
    <Stack styles={stackStyles} horizontal>
        <Stack.Item styles={leftNavStyles}>
            <h1>Menu</h1>
        </Stack.Item>
        <Stack.Item>
            <Stack styles={contentStyles}>
                <Stack>
                    <PawActions onCommissionPaws={openCommissionPawsPanel} />
                </Stack>
                <Stack styles={contentStyles}>
                    <PawItemList items={paws} />
                </Stack>
            </Stack>
        </Stack.Item>
    </Stack>
    <CommissionPawsPanel isOpen={isCommissionPawsPanelOpen} onDismissPanel={dismissCommissionPawsPanel} />
    </>
    );
};
