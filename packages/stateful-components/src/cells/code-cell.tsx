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
import { inputRequests } from "@nteract/messaging/src";

interface NamedCodeCellSlots {
  editor?: () => JSX.Element;
  prompt?: (props: { id: string; contentRef: string }) => JSX.Element;
  pagers?: (props: any) => JSX.Element;
  inputPrompts?: (props: any) => JSX.Element;
  outputs?: (props: any) => JSX.Element;
  toolbar?: () => JSX.Element;
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

    const defaults = {
      prompt: (props: { id: string; contentRef: string }) => (
        <Prompt id={props.id} contentRef={props.contentRef}>
          <PromptText />
        </Prompt>
      ),
      editor: () => <CodeMirrorEditor />,
      pagers: (props: any) => (
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
      ),
      inputPrompts: (props: any) => (
        <InputPrompts id={props.id} contentRef={props.contentRef} />
      ),
      outputs: (props: any) => (
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
      )
    };

    const prompt = children?.prompt || defaults.prompt;
    const editor = children?.editor || defaults.editor;
    const pagers = children?.pagers || defaults.pagers;
    const inputPrompts = children?.pagers || defaults.inputPrompts;
    const outputs = children?.outputs || defaults.outputs;
    const toolbar = children?.toolbar;

    return (
      <div className="nteract-code-cell nteract-cell">
        {toolbar && toolbar()}
        <Input id={id} contentRef={contentRef}>
          {prompt({ id, contentRef })}
          <Source className="nteract-cell-source">
            <Editor id={id} contentRef={contentRef}>
              {editor()}
            </Editor>
          </Source>
        </Input>
        {pagers({ id, contentRef })}
        {outputs({ id, contentRef })}
        {inputPrompts({ id, contentRef })}
      </div>
    );
  }
}
