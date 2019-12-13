import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";

import { AppState, ContentRef, selectors } from "@nteract/core";

import Cell from "./cell";
import CodeCell from "./code-cell";
import MarkdownCell from "./markdown-cell";
import RawCell from "./raw-cell";

interface NamedCellSlots {
  code?: React.ReactChild;
  markdown?: React.ReactChild;
  raw?: React.ReactChild;
}
interface ComponentProps {
  contentRef: ContentRef;
  children?: NamedCellSlots;
}

interface StateProps {
  cellOrder: Immutable.List<string>;
}

export class Cells extends React.Component<StateProps & ComponentProps> {
  render() {
    const { cellOrder, contentRef, children } = this.props;
    let code: React.ReactNode, raw: React.ReactNode, markdown: React.ReactNode;
    if (children) {
      code = children.code;
      raw = children.raw;
      markdown = children.markdown;
    }

    return (
      <div className="nteract-cells">
        {cellOrder.map((id: string) => (
          <Cell id={id} contentRef={contentRef} key={id}>
            {markdown ? (
              <React.Fragment>{markdown}</React.Fragment>
            ) : (
              <MarkdownCell id={id} contentRef={contentRef} />
            )}
            {raw ? (
              <React.Fragment>{raw}</React.Fragment>
            ) : (
              <RawCell id={id} contentRef={contentRef} />
            )}
            {code ? (
              <React.Fragment>{raw}</React.Fragment>
            ) : (
              <CodeCell id={id} contentRef={contentRef} />
            )}
          </Cell>
        ))}
      </div>
    );
  }
}

export const makeMapStateToProps = (
  state: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const mapStateToProps = (state: AppState) => {
    const { contentRef } = ownProps;
    const model = selectors.model(state, { contentRef });

    let cellOrder = Immutable.List();

    if (model && model.type === "notebook") {
      cellOrder = model.notebook.cellOrder;
    }

    return {
      cellOrder
    };
  };
  return mapStateToProps;
};

export default connect<StateProps, void, ComponentProps, AppState>(
  makeMapStateToProps
)(Cells);
