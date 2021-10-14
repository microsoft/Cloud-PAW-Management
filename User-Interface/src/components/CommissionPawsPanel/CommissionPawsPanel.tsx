import { Panel, PanelType } from "@fluentui/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getDevices } from "../../store/actions/deviceActions";
import { CommissionPawsPanelContent } from "./CommissionPawsPanelContent/CommissionPawsPanelContent";
import { CommissionPawsPanelFooter } from "./CommissionPawsPanelFooter/CommissionPawsPanelFooter";

interface ICommissionPawsPanelProps {
    isOpen: boolean;
    onDismissPanel?: () => void;
}
export const CommissionPawsPanel = ({ isOpen, onDismissPanel}: ICommissionPawsPanelProps) => {
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(getDevices());
    }, [dispatch]);

    const onRenderFooterContent = React.useCallback(
        () => <CommissionPawsPanelFooter onDismissPanel={onDismissPanel} />,
        [onDismissPanel],
      );
    return (
        <Panel
        isOpen={isOpen}
        onDismiss={onDismissPanel}
        type={PanelType.medium}
        // customWidth={panelType === PanelType.custom || panelType === PanelType.customNear ? '888px' : undefined}
        closeButtonAriaLabel="Close"
        headerText="Commission PAW"
        onRenderFooterContent={onRenderFooterContent}
        isFooterAtBottom={true}
      >
          <CommissionPawsPanelContent />
      </Panel>
    );
};
