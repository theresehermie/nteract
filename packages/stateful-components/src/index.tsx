import React from "react";
import { ContentRef } from "@nteract/core";

import Cells from "./cells/cells";

interface ComponentProps {
  contentRef: ContentRef;
}

export default class Notebook extends React.Component<ComponentProps> {
  render() {
    return <Cells contentRef={this.props.contentRef} />;
  }
}
