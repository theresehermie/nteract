import { actions, selectors, ContentRef, AppState } from "@nteract/core";
import { CellType } from "@nteract/commutable";
import { CodeOcticon, MarkdownOcticon } from "@nteract/octicons";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import styled from "styled-components";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children: React.ReactNode;
}

interface StateProps {
  first: boolean;
}

interface DispatchProps {
  createCellAppend: (payload: {
    cellType: CellType;
    contentRef: ContentRef;
  }) => void;
  createCellAbove: (payload: {
    cellType: CellType;
    id?: string;
    contentRef: ContentRef;
  }) => void;
  createCellBelow: (payload: {
    cellType: CellType;
    id?: string;
    source: string;
    contentRef: ContentRef;
  }) => void;
}

export const CellCreatorMenu = styled.div`
  display: none;
  background: var(--theme-cell-creator-bg);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  pointer-events: all;
  position: relative;
  top: -5px;
  z-index: 50;

  button {
    display: inline-block;

    width: 22px;
    height: 20px;
    padding: 0px 4px;

    text-align: center;

    border: none;
    outline: none;
    background: none;
  }

  button span {
    font-size: 15px;
    line-height: 1;

    color: var(--theme-cell-creator-fg);
  }

  button span:hover {
    color: var(--theme-cell-creator-fg-hover);
  }

  .octicon {
    transition: color 0.5s;
  }
`;

const CreatorHoverMask = styled.div`
  display: block;
  position: relative;
  overflow: visible;
  height: 0px;

  @media print {
    display: none;
  }
`;
const CreatorHoverRegion = styled.div`
  position: relative;
  overflow: visible;
  top: -10px;
  height: 60px;
  text-align: center;

  &:hover ${CellCreatorMenu} {
    display: inline-block;
  }
`;

interface CellCreatorProps {
  above: boolean;
  createCell: (type: "markdown" | "code", above: boolean) => void;
}

export class PureCellCreator extends React.PureComponent<CellCreatorProps> {
  createMarkdownCell = () => {
    this.props.createCell("markdown", this.props.above);
  };

  createCodeCell = () => {
    this.props.createCell("code", this.props.above);
  };

  render() {
    return (
      <CreatorHoverMask>
        <CreatorHoverRegion>
          <CellCreatorMenu>
            <button
              onClick={this.createMarkdownCell}
              title="create text cell"
              className="add-text-cell"
            >
              <span className="octicon">
                <MarkdownOcticon />
              </span>
            </button>
            <button
              onClick={this.createCodeCell}
              title="create code cell"
              className="add-code-cell"
            >
              <span className="octicon">
                <CodeOcticon />
              </span>
            </button>
          </CellCreatorMenu>
        </CreatorHoverRegion>
      </CreatorHoverMask>
    );
  }
}

// tslint:disable max-classes-per-file
class CellCreator extends React.PureComponent<
  ComponentProps & DispatchProps & StateProps
> {
  createCell = (type: "code" | "markdown", above: boolean): void => {
    const {
      createCellBelow,
      createCellAppend,
      createCellAbove,
      id,
      contentRef
    } = this.props;

    if (id === undefined || typeof id !== "string") {
      createCellAppend({ cellType: type, contentRef });
      return;
    }

    above
      ? createCellAbove({ cellType: type, id, contentRef })
      : createCellBelow({ cellType: type, id, source: "", contentRef });
  };

  render() {
    return (
      <React.Fragment>
        {this.props.first && (
          <PureCellCreator above={true} createCell={this.createCell} />
        )}
        {this.props.children}
        <PureCellCreator above={false} createCell={this.createCell} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: ComponentProps) => {
  const { id, contentRef } = ownProps;
  const model = selectors.model(state, { contentRef });
  let first = false;

  if (model && model.type === "notebook") {
    const cellOrder = selectors.notebook.cellOrder(model);
    const cellIndex = cellOrder.findIndex(cellId => cellId === id);
    first = cellIndex === 0;
  }

  return {
    first
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createCellAbove: (payload: {
    cellType: CellType;
    id?: string;
    contentRef: ContentRef;
  }) => dispatch(actions.createCellAbove(payload)),
  createCellAppend: (payload: { cellType: CellType; contentRef: ContentRef }) =>
    dispatch(actions.createCellAppend(payload)),
  createCellBelow: (payload: {
    cellType: CellType;
    id?: string;
    source: string;
    contentRef: ContentRef;
  }) => dispatch(actions.createCellBelow(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(CellCreator);
