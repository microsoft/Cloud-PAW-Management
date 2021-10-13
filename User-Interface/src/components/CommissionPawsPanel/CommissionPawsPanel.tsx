import { Panel, PanelType } from "@fluentui/react";
import React from "react";
import { CommissionPawsPanelContent } from "./CommissionPawsPanelContent/CommissionPawsPanelContent";
import { CommissionPawsPanelFooter } from "./CommissionPawsPanelFooter/CommissionPawsPanelFooter";

interface ICommissionPawsPanelProps {
    isOpen: boolean;
    onDismissPanel?: () => void;
}
export const CommissionPawsPanel = ({ isOpen, onDismissPanel}: ICommissionPawsPanelProps) => {
    const onRenderFooterContent = React.useCallback(
        () => <CommissionPawsPanelFooter />,
        [],
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
