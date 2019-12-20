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

const decorate = (
  id: string,
  contentRef: ContentRef,
  cell_type: CellType,
  children: React.ReactNode
) => {
  return (
    <div cell_type={cell_type}>
      <DraggableCell id={id} contentRef={contentRef}>
        <HijackScroll id={id} contentRef={contentRef}>
          <CellCreator id={id} contentRef={contentRef}>
            {children}
          </CellCreator>
        </HijackScroll>
      </DraggableCell>
    </div>
  );
};

export class NotebookApp extends React.Component<ComponentProps> {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <Themer>
          <Cells contentRef={this.props.contentRef}>
            {{
              code: (props: { id: string; contentRef: ContentRef }) =>
                decorate(
                  props.id,
                  props.contentRef,
                  "code",
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
                ),
              markdown: (props: { id: string; contentRef: ContentRef }) =>
                decorate(
                  props.id,
                  props.contentRef,
                  "markdown",
                  <MarkdownCell id={props.id} contentRef={props.contentRef}>
                    {{
                      toolbar: () => (
                        <CellToolbar
                          id={props.id}
                          contentRef={props.contentRef}
                        />
                      )
                    }}
                  </MarkdownCell>
                ),
              raw: (props: { id: string; contentRef: ContentRef }) =>
                decorate(
                  props.id,
                  props.contentRef,
                  "raw",
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
