import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { actions, AppState, ContentRef, selectors } from "@nteract/core";
import CodeMirrorEditor from "@nteract/editor";
import { MarkdownPreviewer } from "@nteract/markdown";
import { Source } from "@nteract/presentational-components";

import Editor from "../inputs/editor";
import { ImmutableCell } from "@nteract/commutable/src";

interface NamedMDCellSlots {
  editor?: React.ReactNode;
}

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  cell?: ImmutableCell;
  cell_type?: "markdown";
  children?: NamedMDCellSlots;
}

interface StateProps {
  isCellFocused: boolean;
  isEditorFocused: boolean;
}

interface DispatchProps {
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  focusEditor: () => void;
  unfocusEditor: () => void;
}

export class PureMarkdownCell extends React.Component<
  ComponentProps & DispatchProps & StateProps
> {
  render() {
    const { contentRef, id, cell } = this.props;

    const { isEditorFocused, isCellFocused } = this.props;

    const {
      focusAboveCell,
      focusBelowCell,
      focusEditor,
      unfocusEditor
    } = this.props;

    const { children } = this.props;
    let editor;
    if (children) {
      editor = children.editor;
    }

    const source = cell ? cell.get("source", "") : "";

    return (
      <div className="nteract-md-cell">
        <MarkdownPreviewer
          focusAbove={focusAboveCell}
          focusBelow={focusBelowCell}
          focusEditor={focusEditor}
          cellFocused={isCellFocused}
          editorFocused={isEditorFocused}
          unfocusEditor={unfocusEditor}
          source={source}
        >
          <Source className="nteract-cell-source">
            <Editor id={id} contentRef={contentRef}>
              {editor ? (
                <React.Fragment>{editor}</React.Fragment>
              ) : (
                <CodeMirrorEditor />
              )}
            </Editor>
          </Source>
        </MarkdownPreviewer>
      </div>
    );
  }
}

export const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const { id, contentRef } = ownProps;
  const mapStateToProps = (state: AppState): StateProps => {
    const model = selectors.model(state, { contentRef });
    let isCellFocused = false;
    let isEditorFocused = false;

    if (model && model.type === "notebook") {
      isCellFocused = model.cellFocused === id;
      isEditorFocused = model.editorFocused === id;
    }

    return {
      isCellFocused,
      isEditorFocused
    };
  };

  return mapStateToProps;
};

const makeMapDispatchToProps = (
  initialDispatch: Dispatch,
  ownProps: ComponentProps
): ((dispatch: Dispatch) => DispatchProps) => {
  const { id, contentRef } = ownProps;

  const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
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
    focusEditor: () => dispatch(actions.focusCellEditor({ id, contentRef })),
    unfocusEditor: () =>
      dispatch(actions.focusCellEditor({ id: undefined, contentRef }))
  });

  return mapDispatchToProps;
};

const MarkdownCell = connect(
  makeMapStateToProps,
  makeMapDispatchToProps
)(PureMarkdownCell);

MarkdownCell.defaultProps = {
  cell_type: "markdown"
};

export default MarkdownCell;
