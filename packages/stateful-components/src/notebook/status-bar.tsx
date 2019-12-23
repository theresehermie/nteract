import React from "react";
import {
  KernelRef,
  ContentRef,
  AppState,
  selectors,
  KernelStatus
} from "@nteract/core";
import { connect } from "react-redux";

interface ComponentProps {
  contentRef: ContentRef;
  children: React.ReactNode;
}

interface StateProps {
  kernelStatus: KernelStatus;
  kernelRef?: KernelRef | null;
  lastSaved?: Date;
  kernelSpecDisplayName?: string;
}

export const StatusBarContext = React.createContext({});

class StatusBar extends React.Component<ComponentProps & StateProps> {
  render() {
    return (
      <div className="nteract-status-bar">
        <StatusBarContext.Provider value={this.props}>
          {this.props.children}
        </StatusBarContext.Provider>
      </div>
    );
  }
}

const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
) => {
  const mapStateToProps = (state: AppState) => {
    const { contentRef } = ownProps;
    const model = selectors.model(state, { contentRef });
    const content = selectors.content(state, { contentRef });
    let kernelRef, lastSaved, kernelSpecDisplayName, kernel;
    let kernelStatus = KernelStatus.NotConnected;
    if (model && model.type === "notebook") {
      /** Retrieve the kernel we are currently connected to for this content. */
      kernelRef = model.kernelRef;
      if (kernelRef) {
        kernel = selectors.kernel(state, { kernelRef });
      }

      /** Update the kernel status if the kernel is connected and it is set. */
      if (kernel && kernel.status !== null) {
        kernelStatus =
          (kernel.status as KernelStatus) || KernelStatus.NotConnected;
      }
      /** Update the kernel display name if we have a kernel spec.. */
      if (kernel && kernel.kernelSpecName) {
        const kernelspec = selectors.kernelspecByName(state, {
          name: kernel.kernelSpecName
        });
        kernelSpecDisplayName = kernelspec
          ? kernelspec.displayName
          : kernel.kernelSpecName;
      } else {
        /** Fall back on the display name in the notebook. */
        kernelSpecDisplayName = selectors.notebook.displayName(model);
      }
    }

    /** Get the last saved date of the content. */
    if (content && content.lastSaved) {
      lastSaved = new Date(content.lastSaved);
    }

    return {
      kernelRef,
      kernelStatus,
      lastSaved,
      kernelSpecDisplayName
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(StatusBar);
