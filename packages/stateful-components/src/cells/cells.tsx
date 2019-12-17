import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";

import { AppState, ContentRef, selectors } from "@nteract/core";

import Cell from "./cell";
import CodeCell from "./code-cell";
import MarkdownCell from "./markdown-cell";
import RawCell from "./raw-cell";

interface NamedCellSlots {
  code?: (props: { id: string; contentRef: string }) => JSX.Element;
  markdown?: (props: { id: string; contentRef: string }) => JSX.Element;
  raw?: (props: { id: string; contentRef: string }) => JSX.Element;
}
interface ComponentProps {
  contentRef: ContentRef;
  children?: NamedCellSlots;
}

interface StateProps {
  cellOrder: Immutable.List<string>;
}

export class Cells extends React.Component<StateProps & ComponentProps> {
  static defaultProps = {
    children: {
      markdown: ({ id, contentRef }: { id: string; contentRef: string }) => (
        <MarkdownCell id={id} contentRef={contentRef} />
      ),
      code: ({ id, contentRef }: { id: string; contentRef: string }) => (
        <CodeCell id={id} contentRef={contentRef} />
      ),
      raw: ({ id, contentRef }: { id: string; contentRef: string }) => (
        <RawCell id={id} contentRef={contentRef} />
      )
    }
  };
  render() {
    const { cellOrder, contentRef, children } = this.props;
    console.log(this.props);
    const { code, raw, markdown } = children;

    console.log(markdown);

    return (
      <div className="nteract-cells">
        {cellOrder.map((id: string) => (
          <Cell id={id} contentRef={contentRef} key={id}>
            {markdown({ id, contentRef })}
            {raw({ id, contentRef })}
            {code({ id, contentRef })}
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
