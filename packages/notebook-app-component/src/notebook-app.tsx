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
            code: () => (
              <CodeCell>{{ toolbar: () => <CellToolbar /> }}</CodeCell>
            ),
            markdown: () => (
              <MarkdownCell>{{ toolbar: () => <CellToolbar /> }}</MarkdownCell>
            ),
            raw: () => <RawCell>{{ toolbar: () => <CellToolbar /> }}</RawCell>
          }}
        </Cells>
        <StatusBar contentRef={this.props.contentRef} />
      </React.Fragment>
    );
  }
}
