import React from "react";
import {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell
} from "@nteract/stateful-components";
import { ContentRef } from "@nteract/core";

import CellToolbar from "../derived-components/toolbar";
import StatusBar from "../derived-components/status-bar";

import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import DraggableCell from "../decorators/draggable";
import HijackScroll from "../decorators/hijack-scroll";
import CellCreator from "../decorators/cell-creator";
import Themer from "../decorators/themer";
import UndoableCellDelete from "../decorators/undoable/undoable-cell-delete";

interface ComponentProps {
  contentRef: ContentRef;
}

export class NotebookApp extends React.Component<ComponentProps> {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <Themer>
          <Cells contentRef={this.props.contentRef}>
            {{
              code: (props: { id: string; contentRef: ContentRef }) => (
                <div cell_type="code">
                  <UndoableCellDelete
                    id={props.id}
                    contentRef={props.contentRef}
                  >
                    <DraggableCell id={props.id} contentRef={props.contentRef}>
                      <HijackScroll id={props.id} contentRef={props.contentRef}>
                        <CellCreator
                          id={props.id}
                          contentRef={props.contentRef}
                        >
                          <CodeCell id={props.id} contentRef={props.contentRef}>
                            {{
                              toolbar: () => (
                                <CellToolbar
                                  id={props.id}
                                  contentRef={props.contentRef}
                                />
                              )
                            }}
                          </CodeCell>
                        </CellCreator>
                      </HijackScroll>
                    </DraggableCell>
                  </UndoableCellDelete>
                </div>
              ),
              markdown: (props: { id: string; contentRef: ContentRef }) => (
                <div cell_type="markdown">
                  <UndoableCellDelete
                    id={props.id}
                    contentRef={props.contentRef}
                  >
                    <DraggableCell id={props.id} contentRef={props.contentRef}>
                      <HijackScroll id={props.id} contentRef={props.contentRef}>
                        <CellCreator
                          id={props.id}
                          contentRef={props.contentRef}
                        >
                          <MarkdownCell
                            id={props.id}
                            contentRef={props.contentRef}
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
                        </CellCreator>
                      </HijackScroll>
                    </DraggableCell>
                  </UndoableCellDelete>
                </div>
              ),
              raw: (props: { id: string; contentRef: ContentRef }) => (
                <div cell_type="raw">
                  <UndoableCellDelete
                    id={props.id}
                    contentRef={props.contentRef}
                  >
                    <DraggableCell id={props.id} contentRef={props.contentRef}>
                      <HijackScroll id={props.id} contentRef={props.contentRef}>
                        <CellCreator
                          id={props.id}
                          contentRef={props.contentRef}
                        >
                          <RawCell id={props.id} contentRef={props.contentRef}>
                            {{
                              toolbar: () => (
                                <CellToolbar
                                  id={props.id}
                                  contentRef={props.contentRef}
                                />
                              )
                            }}
                          </RawCell>
                        </CellCreator>
                      </HijackScroll>
                    </DraggableCell>
                  </UndoableCellDelete>
                </div>
              )
            }}
          </Cells>
          <StatusBar contentRef={this.props.contentRef} />
        </Themer>
      </React.Fragment>
    );
  }
}

const DraggableNotebookApp = dragDropContext(HTML5Backend)(NotebookApp);
export default DraggableNotebookApp;
