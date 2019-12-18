import React from "react";
import {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell
} from "@nteract/stateful-components";
import { ContentRef } from "@nteract/core";

import NotebookHelmet from "./notebook-helmet";
import CellToolbar from "./toolbar";
import StatusBar from "./status-bar";

interface ComponentProps {
  contentRef: ContentRef;
}

export default class NotebookApp extends React.Component<ComponentProps> {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <NotebookHelmet contentRef={this.props.contentRef} />
        <Cells contentRef={this.props.contentRef}>
          {{
            code: (props: { id: string; contentRef: ContentRef }) => (
              <CodeCell id={props.id} contentRef={props.contentRef}>
                {{
                  toolbar: () => (
                    <CellToolbar id={props.id} contentRef={props.contentRef} />
                  )
                }}
              </CodeCell>
            ),
            markdown: (props: { id: string; contentRef: ContentRef }) => (
              <MarkdownCell id={props.id} contentRef={props.contentRef}>
                {{
                  toolbar: () => (
                    <CellToolbar id={props.id} contentRef={props.contentRef} />
                  )
                }}
              </MarkdownCell>
            ),
            raw: (props: { id: string; contentRef: ContentRef }) => (
              <RawCell id={props.id} contentRef={props.contentRef}>
                {{
                  toolbar: () => (
                    <CellToolbar id={props.id} contentRef={props.contentRef} />
                  )
                }}
              </RawCell>
            )
          }}
        </Cells>
        <StatusBar contentRef={this.props.contentRef} />
      </React.Fragment>
    );
  }
}
