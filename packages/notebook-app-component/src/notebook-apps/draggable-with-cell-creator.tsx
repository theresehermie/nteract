import { CellId, CellType } from "@nteract/commutable";
import { actions, AppState, ContentRef, selectors } from "@nteract/core";
import {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell
} from "@nteract/stateful-components";
import Immutable from "immutable";
import React from "react";

import StatusBar from "../derived-components/status-bar";
import CellToolbar from "../derived-components/toolbar";

import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";

import { Dispatch } from "redux";
import CellCreator from "../decorators/cell-creator";
import DraggableCell from "../decorators/draggable";
import HijackScroll from "../decorators/hijack-scroll";
import Themer from "../decorators/themer";
import UndoableCellDelete from "../decorators/undoable/undoable-cell-delete";

interface ComponentProps {
  contentRef: ContentRef;
}

interface StateProps {
  cellOrder: Immutable.List<string>;
  cellMap: Immutable.Map<string, any>;
  focusedCell: string;
}

interface DispatchProps {
  executeFocusedCell: () => void;
  focusNextCell: (payload: {
    id?: CellId;
    createCellIfUndefined: boolean;
    contentRef: ContentRef;
  }) => void;
  focusNextCellEditor: (payload: {
    id?: CellId;
    contentRef: ContentRef;
  }) => void;
}

interface CellComponentProps {
  contentRef: ContentRef;
  id: string;
  children: React.ReactNode;
  cell_type: CellType;
  className?: string;
}

class DecoratedCell extends React.PureComponent<CellComponentProps> {
  render(): JSX.Element {
    const { contentRef, id, children } = this.props;
    return (
      <div className={this.props.className}>
        <DraggableCell id={id} contentRef={contentRef}>
          <HijackScroll id={id} contentRef={contentRef}>
            <CellCreator id={id} contentRef={contentRef}>
              <UndoableCellDelete id={id} contentRef={contentRef}>
                {children}
              </UndoableCellDelete>
            </CellCreator>
          </HijackScroll>
        </DraggableCell>
      </div>
    );
  }
}

type NotebookProps = ComponentProps & StateProps & DispatchProps;

export class NotebookApp extends React.PureComponent<NotebookProps> {
  constructor(props: NotebookProps) {
    super(props);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  keyDown(e: KeyboardEvent): void {
    // If enter is not pressed, do nothing
    if (e.keyCode !== 13) {
      return;
    }

    const {
      executeFocusedCell,
      focusNextCell,
      focusNextCellEditor,
      contentRef,
      cellOrder,
      focusedCell,
      cellMap
    } = this.props;

    let ctrlKeyPressed = e.ctrlKey;
    // Allow cmd + enter (macOS) to operate like ctrl + enter
    if (process.platform === "darwin") {
      ctrlKeyPressed = (e.metaKey || e.ctrlKey) && !(e.metaKey && e.ctrlKey);
    }

    const shiftXORctrl =
      (e.shiftKey || ctrlKeyPressed) && !(e.shiftKey && ctrlKeyPressed);
    if (!shiftXORctrl) {
      return;
    }

    e.preventDefault();

    // NOTE: Order matters here because we need it to execute _before_ we
    // focus the next cell
    executeFocusedCell({ contentRef });

    if (e.shiftKey) {
      /** Get the next cell and check if it is a markdown cell. */
      const focusedCellIndex = cellOrder.indexOf(focusedCell);
      const nextCellId = cellOrder.get(focusedCellIndex + 1);
      const nextCell = cellMap.get(nextCellId);

      /** Always focus the next cell. */
      focusNextCell({
        id: undefined,
        createCellIfUndefined: true,
        contentRef
      });

      /** Only focus the next editor if it is a code cell or a cell
       * created at the bottom of the notebook. */
      if (
        nextCell === undefined ||
        (nextCell && nextCell.get("cell_type") === "code")
      ) {
        focusNextCellEditor({
          id: focusedCell || undefined,
          contentRef
        });
      }
    }
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <Themer>
          <Cells contentRef={this.props.contentRef}>
            {{
              code: (props: { id: string; contentRef: ContentRef }) => (
                <DecoratedCell
                  id={props.id}
                  contentRef={props.contentRef}
                  cell_type="code"
                >
                  <CodeCell
                    id={props.id}
                    contentRef={props.contentRef}
                    cell_type="code"
                  >
                    {{
                      toolbar: () => (
                        <CellToolbar
                          id={props.id}
                          contentRef={props.contentRef}
                        />
                      )
                    }}
                  </CodeCell>
                </DecoratedCell>
              ),
              markdown: (props: { id: string; contentRef: ContentRef }) => (
                <DecoratedCell
                  id={props.id}
                  contentRef={props.contentRef}
                  cell_type="markdown"
                >
                  <MarkdownCell
                    id={props.id}
                    contentRef={props.contentRef}
                    cell_type="markdown"
                  >
                    {{
                      toolbar: () => (
                        <CellToolbar
                          id={props.id}
                          contentRef={props.contentRef}
                        />
                      )
                    }}
                  </MarkdownCell>
                </DecoratedCell>
              ),
              raw: (props: { id: string; contentRef: ContentRef }) => (
                <DecoratedCell
                  id={props.id}
                  contentRef={props.contentRef}
                  cell_type="raw"
                >
                  <RawCell
                    id={props.id}
                    contentRef={props.contentRef}
                    cell_type="raw"
                  >
                    {{
                      toolbar: () => (
                        <CellToolbar
                          id={props.id}
                          contentRef={props.contentRef}
                        />
                      )
                    }}
                  </RawCell>
                </DecoratedCell>
              )
            }}
          </Cells>
          <StatusBar contentRef={this.props.contentRef} />
        </Themer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: ComponentProps) => {
  let focusedCell;
  let cellMap;
  let cellOrder;

  const { contentRef } = ownProps;

  const model = selectors.model(state, { contentRef });

  if (model && model.type === "notebook") {
    focusedCell = selectors.notebook.cellFocused(model);
    cellMap = selectors.notebook.cellMap(model);
    cellOrder = model.notebook.cellOrder;
  }

  return {
    focusedCell,
    cellMap,
    cellOrder
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: ComponentProps) => ({
  executeFocusedCell: () =>
    dispatch(actions.executeFocusedCell({ contentRef: ownProps.contentRef })),
  focusNextCell: (payload: {
    id?: CellId;
    createCellIfUndefined: boolean;
    contentRef: ContentRef;
  }) => dispatch(actions.focusNextCell(payload)),
  focusNextCellEditor: (payload: { id?: CellId; contentRef: ContentRef }) =>
    dispatch(actions.focusNextCellEditor(payload))
});

const DraggableNotebookApp = dragDropContext(HTML5Backend)(NotebookApp);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DraggableNotebookApp);
