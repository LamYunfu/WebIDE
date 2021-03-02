import React = require("react");

export namespace GettingStart {
  export interface Props {
    openGettingStartPage:()=>void;
}
}

export class GettingStart extends React.Component<GettingStart.Props> {
  componentWillMount(){
    this.props.openGettingStartPage();
  }
  render(): JSX.Element {
    return (
      <div>
      </div>
    );
  }
}