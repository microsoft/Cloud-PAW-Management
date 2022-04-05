import { CommandBar, DefaultButton, Dialog, DialogFooter, DialogType, ICommandBarItemProps, PrimaryButton, Spinner, Stack } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React, { useCallback, useMemo } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { decommissionPaws, getPaws } from '../../store/actions/pawActions';

interface IPawActionsProps {
  onCommissionPaws: () => void;
  onDecommissionPaws?: () => void;
}
export const PawActions = (props: IPawActionsProps) => {
  const pawsToDecommission = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.pawsToDecommission);
  const isPawDecommissioning = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.isPawDecommissioning);
  const isPawCommissioning = useSelector((state: RootStateOrAny) => state.paw.commissionPaws.isPawCommissioning);
  const isGettingPaws = useSelector((state: RootStateOrAny) => state.paw.getPaws.isGettingPaws);

  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const dispatch = useDispatch();

  const decommissionSelectedPaw = useCallback(() => {
    dispatch(decommissionPaws(pawsToDecommission));
    toggleHideDialog()
  }, [dispatch, pawsToDecommission, toggleHideDialog]);

  const onRefershPaws = useCallback(() => {
    dispatch(getPaws())
  }, [dispatch]);

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
      onClick: () => { toggleHideDialog() },
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      onClick: () => { onRefershPaws() },
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
          <Stack horizontal tokens={{ childrenGap: 25 }}>
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
      {isPawDecommissioning && <Spinner styles={{ root: { minWidth: 400 } }} label="Decommissioning PAW" />}
      {isPawCommissioning && <Spinner styles={{ root: { minWidth: 400 } }} label="Commissioning PAW" />}
      {isGettingPaws && <Spinner styles={{ root: { minWidth: 400 } }} label="Getting PAWs" />}
    </div>
  );
};
