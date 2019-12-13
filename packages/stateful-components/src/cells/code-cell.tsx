import Immutable from "immutable";
import React from "react";

import { ImmutableCell } from "@nteract/commutable";
import { ContentRef } from "@nteract/core";
import CodeMirrorEditor from "@nteract/editor";
import { KernelOutputError, Media, StreamText } from "@nteract/outputs";
import { Source } from "@nteract/presentational-components";

import Editor from "../inputs/editor";
import Input from "../inputs/input";
import Prompt from "../inputs/prompt";
import Outputs from "../outputs";
import InputPrompts from "../outputs/input-prompts";
import Pagers from "../outputs/pagers";
import TransformMedia from "../outputs/transform-media";

interface NamedCodeCellSlots {
  editor?: React.ReactChild;
  prompt?: React.ReactChild;
  pagers?: React.ReactChild;
  inputPrompts?: React.ReactChild;
  outputs?: React.ReactChild;
}

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  cell?: ImmutableCell;
  cell_type?: "code";
  children?: NamedCodeCellSlots;
}

const PromptText = (props: any) => {
  if (props.status === "busy") {
    return <React.Fragment>{"[*]"}</React.Fragment>;
  }
  if (props.status === "queued") {
    return <React.Fragment>{"[…]"}</React.Fragment>;
  }
  if (typeof props.executionCount === "number") {
    return <React.Fragment>{`[${props.executionCount}]`}</React.Fragment>;
  }
  return <React.Fragment>{"[ ]"}</React.Fragment>;
};

export default class CodeCell extends React.Component<ComponentProps> {
  static defaultProps = {
    cell_type: "code"
  };

  render() {
    const { id, contentRef, children } = this.props;
    let editor, prompt, pagers, inputPrompts, outputs;
    if (children) {
      editor = children.editor;
      prompt = children.prompt;
      pagers = children.pagers;
      inputPrompts = children.inputPrompts;
      outputs = children.outputs;
    }

    return (
      <div className="nteract-code-cell">
        <Input id={id} contentRef={contentRef}>
          {prompt ? (
            <React.Fragment>{prompt}</React.Fragment>
          ) : (
            <Prompt id={id} contentRef={contentRef}>
              <PromptText />
            </Prompt>
          )}
          <Source className="nteract-cell-source">
            <Editor id={id} contentRef={contentRef}>
              {editor ? (
                <React.Fragment>{editor}</React.Fragment>
              ) : (
                <CodeMirrorEditor />
              )}
            </Editor>
          </Source>
        </Input>
        {pagers ? (
          <React.Fragment>{pagers}</React.Fragment>
        ) : (
          <Pagers id={id} contentRef={contentRef}>
            <Media.Json />
            <Media.JavaScript />
            <Media.HTML />
            <Media.Markdown />
            <Media.LaTeX />
            <Media.SVG />
            <Media.Image />
            <Media.Plain />
          </Pagers>
        )}
        {outputs ? (
          <React.Fragment>{outputs}</React.Fragment>
        ) : (
          <Outputs id={id} contentRef={contentRef}>
            <TransformMedia
              output_type={"display_data"}
              id={id}
              contentRef={contentRef}
            />
            <TransformMedia
              output_type={"execute_result"}
              id={id}
              contentRef={contentRef}
            />
            <KernelOutputError />
            <StreamText />
          </Outputs>
        )}
        {inputPrompts ? (
          <React.Fragment>{inputPrompts}</React.Fragment>
        ) : (
          <InputPrompts id={id} contentRef={contentRef} />
        )}
      </div>
    );
  }
}
