import { ContentRef } from "@nteract/core";
import {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell
} from "@nteract/stateful-components";
import React from "react";

import StatusBar from "../derived-components/status-bar";
import CellToolbar from "../derived-components/toolbar";

import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import DraggableCell from "../decorators/draggable";

import { CellType } from "@nteract/commutable/src";
import HijackScroll from "../decorators/hijack-scroll";

import Themer from "../decorators/themer";

interface ComponentProps {
  contentRef: ContentRef;
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
            {children}
          </HijackScroll>
        </DraggableCell>
      </div>
    );
  }
}

export class NotebookApp extends React.PureComponent<ComponentProps> {
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

const DraggableNotebookApp = dragDropContext(HTML5Backend)(NotebookApp);
export default DraggableNotebookApp;
