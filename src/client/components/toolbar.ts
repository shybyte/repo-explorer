import * as react from "react";

const {div, textarea, button} = react.DOM;


interface ToolbarProps {
  filter: string;
  changeFilter(filter: string): void;
}

interface ToolbarState {

}

class Toolbar extends react.Component<ToolbarProps, ToolbarState> {
  render() {
    return div({className: 'toolbar'},
      textarea({
        value: this.props.filter,
        onChange: (event) => {
          this.props.changeFilter(event.target.value);
        }
      }),
    );
  }
}

export const toolbarComponent = react.createFactory(Toolbar);
