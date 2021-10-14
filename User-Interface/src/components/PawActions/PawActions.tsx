import React, { useCallback, useMemo } from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { useBoolean } from '@fluentui/react-hooks'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { decommissionPaws } from '../../store/actions/pawActions';

interface IPawActionsProps {
  onCommissionPaws: () => void;
  onDecommissionPaws?: () => void;
}
export const PawActions = (props: IPawActionsProps) => {
  const pawsToDecommission = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.pawsToDecommission);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const dispatch = useDispatch();

  const decommissionSelectedPaw = useCallback(() => {
      dispatch(decommissionPaws(pawsToDecommission));
  }, [dispatch, pawsToDecommission]);


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
      onClick: () => {toggleHideDialog()},
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      onClick: () => console.log('Refreshing PAW'),
    },
  ];


  const modalProps = React.useMemo(
    () => ({
      isBlocking: true,
      styles: { main: { maxWidth: 450 } },
    }),
    [],
  );

  const DecommissionPawDialog = useMemo(() => {
    const dialogContentProps = {
      type: DialogType.normal,
      title: 'Decommissioning PAW(s)',
      subText: `Do you want to decommission selected(${pawsToDecommission.length}) PAWs?`,
    };  
    return (
      <Dialog
      hidden={hideDialog}
      onDismiss={toggleHideDialog}
      dialogContentProps={dialogContentProps}
      modalProps={modalProps}
    >
      <DialogFooter>
        <Stack horizontal tokens={{childrenGap: 25}}>
          <PrimaryButton onClick={decommissionSelectedPaw} text="Decommission" />
          <DefaultButton onClick={toggleHideDialog} text="Cancel" />
        </Stack>
      </DialogFooter>
    </Dialog>
    );
  }, [decommissionSelectedPaw, hideDialog, modalProps, pawsToDecommission.length, toggleHideDialog]);

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
        {DecommissionPawDialog}
      </div>
    );
  };
  