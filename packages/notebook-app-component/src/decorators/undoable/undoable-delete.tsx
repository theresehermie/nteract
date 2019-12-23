import * as React from "react";

interface Props {
  secondsDelay: number;
  message: string;
  isDeleting: boolean;
  doDelete: () => void;
  doUndo: () => void;
  children?: React.ReactNode;
}

class TimedUndoableDelete extends React.PureComponent<Props> {
  timer: number | null = null;

  componentDidMount(): void {
    this.timer = setTimeout(
      this.props.doDelete,
      this.props.secondsDelay * 1000
    );
  }

  componentWillUnmount(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  render(): JSX.Element {
    return (
      <div className="undo-deletion">
        {this.props.message}
        <button onClick={this.props.doUndo}>Undo</button>
      </div>
    );
  }
}

const UndoableDelete = (props: Props) =>
  props.isDeleting ? (
    <TimedUndoableDelete {...props} />
  ) : (
    <React.Fragment>{props.children}</React.Fragment>
  );
UndoableDelete.displayName = "UndoableDelete";

export default UndoableDelete;
