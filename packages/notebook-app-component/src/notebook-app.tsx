import React from "react";
import {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell
} from "@nteract/stateful-components";
import { ContentRef } from "@nteract/core";

import { createGlobalStyle } from "styled-components";

import NotebookHelmet from "./notebook-helmet";
import CellToolbar from "./toolbar";
import StatusBar from "./status-bar";

interface ComponentProps {
  contentRef: ContentRef;
}

const shadowLevels = {
  FLAT: "none",
  HOVERED: `var(
    --theme-cell-shadow-hover,
    1px 1px 3px rgba(0, 0, 0, 0.12),
    -1px -1px 3px rgba(0, 0, 0, 0.12)
  )`,
  SELECTED: `var(
    --theme-cell-shadow-focus,
    3px 3px 9px rgba(0, 0, 0, 0.12),
    -3px -3px 9px rgba(0, 0, 0, 0.12)
  )`
};

const Theme = createGlobalStyle`
  .nteract-cell-prompt { 
    font-family: monospace;
    font-size: 12px;
    line-height: 22px;
    /* For creating a buffer area for <Prompt blank /> */
    min-height: 22px;
    width: var(--prompt-width, 50px);
    padding: 9px 0;
    text-align: center;
    color: var(--theme-cell-prompt-fg, black);
    background-color: var(--theme-cell-prompt-bg, #fafafa);
  }

   .nteract-cell-pagers {
      background-color: var(--theme-pager-bg, #fafafa);
   }

  .nteract-cell-outputs { 
    padding: 10px 10px 10px calc(var(--prompt-width, 50px) + 10px);
    word-wrap: break-word;
    overflow-y: hidden;
    outline: none;
    /* When expanded, this is overtaken to 100% */
    text-overflow: ellipsis;
    &:empty {
      display: none;
    }
    /* NOTE: All these styles should get moved into some sort of
             "Default Output Style" that an output type can opt in to,
             like with HTML, Markdown, VDOM
             */
    & a {
      color: var(--link-color-unvisited, blue);
    }
    & a:visited {
      color: var(--link-color-visited, blue);
    }
    & code {
      font-family: "Source Code Pro", monospace;
      white-space: pre-wrap;
      font-size: 14px;
    }
    & pre {
      white-space: pre-wrap;
      font-size: 14px;
      word-wrap: break-word;
    }
    & img {
      display: block;
      max-width: 100%;
    }
    & kbd {
      display: inline-block;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 0.1em 0.5em;
      margin: 0 0.2em;
      box-shadow: 0 1px 0px rgba(0, 0, 0, 0.2), 0 0 0 2px #fff inset;
      background-color: #f7f7f7;
    }
    & table {
      border-collapse: collapse;
    }
    & th,
    & td,
    /* for legacy output handling */
    & .th,
    & .td {
      padding: 0.5em 1em;
      border: 1px solid var(--theme-app-border, #cbcbcb);
    }
    & th {
      text-align: left;
    }
    & blockquote {
      padding: 0.75em 0.5em 0.75em 1em;
      background: var(--theme-cell-output-bg, white);
      border-left: 0.5em solid #ddd;
    }
    & blockquote::before {
      display: block;
      height: 0;
      content: "“";
      margin-left: -0.95em;
      font: italic 400%/1 Open Serif, Georgia, "Times New Roman", serif;
      color: solid var(--theme-app-border, #cbcbcb);
    }
    /* for nested paragraphs in block quotes */
    & blockquote p {
      display: inline;
    }
    & dd {
      display: block;
      -webkit-margin-start: 40px;
    }
    & dl {
      display: block;
      -webkit-margin-before: 1__qem;
      -webkit-margin-after: 1em;
      -webkit-margin-start: 0;
      -webkit-margin-end: 0;
    }
    & dt {
      display: block;
    }
    & dl {
      width: 100%;
      overflow: hidden;
      padding: 0;
      margin: 0;
    }
    & dt {
      font-weight: bold;
      float: left;
      width: 20%;
      /* adjust the width; make sure the total of both is 100% */
      padding: 0;
      margin: 0;
    }
    & dd {
      float: left;
      width: 80%;
      /* adjust the width; make sure the total of both is 100% */
      padding: 0;
      margin: 0;
    }
    /** Adaptation for the R kernel's inline lists **/
    & .list-inline li {
      display: inline;
      padding-right: 20px;
      text-align: center;
    }
  }
   

  .nteract-cell-input {
    & {
      display: flex;
      flex-direction: row;
    }
    &.invisible {
      height: 34px;
    }
    & .nteract-cell-prompt {
      flex: 0 0 auto;
    }
    & .nteract-cell-source {
      flex: 1 1 auto;
      overflow: auto;
      background-color: var(--theme-cell-input-bg, #fafafa);
    }
  }

  .nteract-cells {
    font-family: "Source Sans Pro", Helvetica Neue, Helvetica, sans-serif;
    font-size: 16px;
    background-color: var(--theme-app-bg);
    color: var(--theme-app-fg);
    padding-bottom: 10px;
    margin: 20px 0;
  }

  .nteract-cell {
    & {
      position: relative;
      background: var(--theme-cell-bg, white);
      transition: all 0.1s ease-in-out;
    }
    /* The box shadow for hovered should only apply when not already selected */
    &:hover:not(.selected) {
      box-shadow: ${shadowLevels.HOVERED};
    }
    & .nteract-cell-prompt {
      /* We change nothing when the cell is not selected, focused, or hovered */
    }
    &.selected .nteract-cell-prompt {
      background-color: var(--theme-cell-prompt-bg-focus, hsl(0, 0%, 90%));
      color: var(--theme-cell-prompt-fg-focus, hsl(0, 0%, 51%));
    }
    &:hover:not(.selected).nteract-cell-prompt, &:active:not(.selected) .nteract-cell-prompt {
      background-color: var(--theme-cell-prompt-bg-hover, hsl(0, 0%, 94%));
      color: var(--theme-cell-prompt-fg-hover, hsl(0, 0%, 15%));
    }
    &:focus .nteract-cell-prompt {
      background-color: var(--theme-cell-prompt-bg-focus, hsl(0, 0%, 90%));
      color: var(--theme-cell-prompt-fg-focus, hsl(0, 0%, 51%));
    }
    @media print{
      /* make sure all cells look the same in print regarless of focus */
      & .nteract-cell-prompt, &.selected .nteract-cell-prompt, &:focus .nteract-cell-prompt, &:hover:not(.selected) .nteract-cell-prompt {
        background-color: var(--theme-cell-prompt-bg, white);
        color: var(--theme-cell-prompt-fg, black);
      }
  }
`;

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
        <Theme />
      </React.Fragment>
    );
  }
}
