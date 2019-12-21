import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { ContentRef, actions, AppState, selectors } from "@nteract/core";
import { CellType } from "@nteract/commutable";

export interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children: React.ReactNode;
}

export interface StateProps {
  type?: CellType;
}

export interface DispatchProps {
  executeCell: () => void;
  deleteCell: () => void;
  clearOutputs: () => void;
  toggleParameterCell: () => void;
  toggleCellInputVisibility: () => void;
  toggleCellOutputVisibility: () => void;
  toggleOutputExpansion: () => void;
  changeToMarkdownCell: () => void;
  changeToCodeCell: () => void;
  changeCellType: (to: CellType) => void;
  selectCell: () => void;
  focusEditor: () => void;
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  unfocusEditor: () => void;
  markCellAsDeleting: () => void;
}

export const CellToolbarContext = React.createContext({});

export type CellToolbarProps = DispatchProps & StateProps;

class CellToolbar extends React.Component<
  ComponentProps & StateProps & DispatchProps
> {
  render() {
    return (
      <div className="nteract-cell-toolbar">
        <CellToolbarContext.Provider value={this.props}>
          {this.props.children}
        </CellToolbarContext.Provider>
      </div>
    );
  }
}

const makeMapStateToProps = (
  state: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const mapStateToProps = (state: AppState): StateProps => {
    const { id, contentRef } = ownProps;
    const model = selectors.model(state, { contentRef });
    let type: CellType = "code";

    if (model && model.type === "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        type = cell.get<CellType>("cell_type", "code");
      }
    }
    return { type };
  };
  return mapStateToProps;
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ComponentProps
): DispatchProps => {
  const { id, contentRef } = ownProps;
  return {
    executeCell: () => dispatch(actions.executeCell({ id, contentRef })),
    deleteCell: () => dispatch(actions.deleteCell({ id, contentRef })),
    clearOutputs: () => dispatch(actions.clearOutputs({ id, contentRef })),
    toggleParameterCell: () =>
      dispatch(actions.toggleParameterCell({ id, contentRef })),
    toggleCellInputVisibility: () =>
      dispatch(actions.toggleCellInputVisibility({ id, contentRef })),
    toggleCellOutputVisibility: () =>
      dispatch(actions.toggleCellOutputVisibility({ id, contentRef })),
    toggleOutputExpansion: () =>
      dispatch(actions.toggleOutputExpansion({ id, contentRef })),
    changeToMarkdownCell: () =>
      dispatch(actions.changeCellType({ id, contentRef, to: "markdown" })),
    changeToCodeCell: () =>
      dispatch(actions.changeCellType({ id, contentRef, to: "code" })),
    changeCellType: (to: CellType) =>
      dispatch(actions.changeCellType({ id, contentRef, to })),
    selectCell: () => dispatch(actions.focusCell({ id, contentRef })),
    focusEditor: () => dispatch(actions.focusCellEditor({ id, contentRef })),
    focusAboveCell: () => {
      dispatch(actions.focusPreviousCell({ id, contentRef }));
      dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
    },
    focusBelowCell: () => {
      dispatch(
        actions.focusNextCell({ id, createCellIfUndefined: true, contentRef })
      );
      dispatch(actions.focusNextCellEditor({ id, contentRef }));
    },
    unfocusEditor: () =>
      dispatch(actions.focusCellEditor({ id: undefined, contentRef })),
    markCellAsDeleting: () =>
      dispatch(actions.markCellAsDeleting({ id, contentRef }))
  };
};

export default connect<StateProps, DispatchProps, ComponentProps, AppState>(
  makeMapStateToProps,
  mapDispatchToProps
)(CellToolbar);
