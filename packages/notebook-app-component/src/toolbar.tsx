/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/anchor-is-valid: 0 */

import {
  DropdownContent,
  DropdownMenu,
  DropdownTrigger
} from "@nteract/dropdown-menu";
import {
  ChevronDownOcticon,
  TrashOcticon,
  TriangleRightOcticon
} from "@nteract/octicons";
import { ContentRef } from "@nteract/types";
import * as React from "react";

import styled, { StyledComponent } from "styled-components";
import { CellToolbar, CellToolbarContext } from "@nteract/stateful-components";

export interface ComponentProps {
  contentRef: ContentRef;
  id: string;
}

interface ComponentState {
  moreActionsMenuExpanded: boolean;
}

// export const StyledCellToolbar = styled(CellToolbar)`
//   background-color: var(--theme-cell-toolbar-bg);
//   opacity: 0.4;
//   transition: opacity 0.4s;

//   & > div {
//     display: inline-block;
//   }

//   :hover {
//     opacity: 1;
//   }

//   @media print {
//     display: none;
//   }

//   button {
//     display: inline-block;

//     width: 22px;
//     height: 20px;
//     padding: 0px 4px;

//     text-align: center;

//     border: none;
//     outline: none;
//     background: none;
//   }

//   span {
//     font-size: 15px;
//     line-height: 1;
//     color: var(--theme-cell-toolbar-fg);
//   }

//   button span:hover {
//     color: var(--theme-cell-toolbar-fg-hover);
//   }

//   .octicon {
//     transition: color 0.5s;
//   }

//   span.spacer {
//     display: inline-block;
//     vertical-align: middle;
//     margin: 1px 5px 3px 5px;
//     height: 11px;
//   }
// `;

interface CellToolbarMaskProps {
  sourceHidden: boolean;
  cellFocused: boolean;
}

export const CellToolbarMask = styled.div.attrs<CellToolbarMaskProps>(
  props => ({
    style: {
      display: props.cellFocused
        ? "block"
        : props.sourceHidden
        ? "block"
        : "none"
    }
  })
)`
  z-index: 9;
  position: sticky; /* keep visible with large code cells that need scrolling */
  float: right;
  top: 0;
  right: 0;
  height: 34px;
  margin: 0 0 0 -100%; /* allow code cell to completely overlap (underlap?) */
  padding: 0 0 0 50px; /* give users extra room to move their mouse to the
                          toolbar without causing the cell to go out of
                          focus/hide the toolbar before they get there */
` as StyledComponent<"div", any, CellToolbarMaskProps, never>;

export default class Toolbar extends React.PureComponent<
  ComponentProps,
  ComponentState
> {
  static contextType = CellToolbarContext;

  constructor(props: ComponentProps) {
    super(props);
    this.state = { moreActionsMenuExpanded: false };
  }

  render(): JSX.Element {
    return (
      <CellToolbar
        contentRef={this.props.contentRef}
        id={this.props.contentRef}
      >
        <CellToolbarContext.Consumer>
          {(context) => (<React.Fragment>{(this.context.type === "code" && (
            <button
              onClick={this.context.executeCell}
              title="execute cell"
              className="executeButton"
            >
              <span className="octicon">
                <TriangleRightOcticon />
              </span>
          </button>))}
            </React.Fragment>
          
          <DropdownMenu
            onDisplayChanged={(expanded: boolean) => {
              this.setState({ moreActionsMenuExpanded: expanded });
            }}
          >
            <DropdownTrigger>
              <button
                title="show additional actions"
                aria-expanded={this.state.moreActionsMenuExpanded}
              >
                <span className="octicon toggle-menu">
                  <ChevronDownOcticon />
                </span>
              </button>
            </DropdownTrigger>
            {this.context.type === "code" ? (
              <DropdownContent>
                <li
                  onClick={this.context.clearOutputs}
                  className="clearOutput"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Clear Cell Output</a>
                </li>
                <li
                  onClick={this.context.toggleCellInputVisibility}
                  className="inputVisibility"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Toggle Input Visibility</a>
                </li>
                <li
                  onClick={this.context.toggleCellOutputVisibility}
                  className="outputVisibility"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Toggle Output Visibility</a>
                </li>
                <li
                  onClick={this.context.toggleOutputExpansion}
                  className="outputExpanded"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Toggle Expanded Output</a>
                </li>
                <li
                  onClick={this.context.toggleParameterCell}
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Toggle Parameter Cell</a>
                </li>

                <li
                  onClick={this.context.changeToMarkdownCell}
                  className="changeType"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Convert to Markdown Cell</a>
                </li>
              </DropdownContent>
            ) : (
              <DropdownContent>
                <li
                  onClick={this.context.changeToCodeCell}
                  className="changeType"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                >
                  <a>Convert to Code Cell</a>
                </li>
              </DropdownContent>
            )}
          </DropdownMenu>
          <span className="spacer" />
          <button
            onClick={this.context.deleteCell}
            title="delete cell"
            className="deleteButton"
          >
            <span className="octicon">
              <TrashOcticon />
            </span>
          </button>)}
          
        </CellToolbarContext.Consumer>
      </CellToolbar>
    );
  }
}
