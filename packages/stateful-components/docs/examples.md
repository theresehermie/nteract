# @nteract/stateful-components Examples

This document showcases how the `@nteract/stateful-components` package can be used to build different notebook interfaces. Before reading this document, you might want to take a look at [the overview](./overview.md) and the [extensibility](./extensibility.md) documents.

## How do I render a notebook without any customizations?

To import the standard layout of the notebook, use the `Notebook` default export from the `@nteract/stateful-components` package.

```js
import Notebook from "@nteract/stateful-components";

class MyApp extends React.Component {
  render() {
    return (
      <React.Fragment>
        <MySiderbar />
        <Notebook />
        <MyLeftPanel />
      </React.Fragment>
    );
  }
}
```

## How do I override the default editors in the Notebook component?

Create a React component and pass a value to the `editor` child render function in the component.

```js
import Notebook, {
  CodeCell,
  MarkdownCell,
  RawCell
} from "@nteract/stateful-components";

class Editor extends React.Component {
  render() {
    return <div>Test</div>;
  }
}

class MyNotebook extends React.Component {
  render() {
    return (
      <Notebook>
        {{
          code: (id: string, contentRef: ContentRef) => (
            <CodeCell id={id} contentRef={contentRef}>
              {{
                editor: () => <Editor />
              }}
            </CodeCell>
          ),
          markdown: (id: string, contentRef: ContentRef) => (
            <MarkdownCell id={id} contentRef={contentRef}>
              {{
                editor: () => <Editor />
              }}
            </MarkdownCell>
          ),
          raw: (id: string, contentRef: ContentRef) => (
            <RawCell id={id} contentRef={contentRef}>
              {{
                editor: () => <Editor />
              }}
            </RawCell>
          )
        }}
      </Notebook>
    );
  }
}
```

## How do I disable editing of markdown cells in my notebook application?

Create a React component and override the `editor` child render function in the `MarkdownCell` component.

```js
import Notebook, { MarkdownCell } from "@nteract/stateful-components";

class Editors extends React.Component {
  render() {
    return <MyMarkdownRenderer />;
  }
}

class MyNotebook extends React.Component {
  render() {
    return (
      <Notebook>
        {{
          markdown: (id: string, contentRef: ContentRef) => (
            <MarkdownCell id={id} contentRef={contentRef}>
              {{
                editor: () => <Editor />
              }}
            </MarkdownCell>
          )
        }}
      </Notebook>
    );
  }
}
```

## How do I override the Output display in code cells?

Create a React component and override the `outputs` child render function in the `CodeCell` component.

```js
import Notebook, { CodeCell } from "@nteract/stateful-component";

class Outputs extends React.Component {
  render() {
    return (
      <div>
        <h1>No outputs for you!</h1>
      </div>
    );
  }
}

class MyNotebook extends React.Component {
  render() {
    return (
      <Notebook>
        {{
          code: (id: string, contentRef: ContentRef) => (
            <CodeCell id={id} contentRef={contentRef}>
              {{ outputs: () => <Outputs /> }}
            </CodeCell>
          )
        }}
      </Notebook>
    );
  }
}
```
