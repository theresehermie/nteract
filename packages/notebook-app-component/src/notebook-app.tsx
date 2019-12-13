import React from "react";
import { Notebook } from "@nteract/stateful-components";
import { ContentRef } from "@nteract/core";

import NotebookHelmet from "./notebook-helmet";
import StatusBar from "./status-bar";

interface ComponentProps {
  contentRef: ContentRef;
}

export default class NotebookApp extends React.Component<ComponentProps> {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <NotebookHelmet contentRef={this.props.contentRef} />
        <Notebook contentRef={this.props.contentRef} />
        <StatusBar contentRef={this.props.contentRef} />
      </React.Fragment>
    );
  }
}
