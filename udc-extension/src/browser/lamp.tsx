import {
  ReactWidget,
  createTreeContainer,
  TreeProps,
  defaultTreeProps,
  Widget,
  Message
} from "@theia/core/lib/browser";
// const on =require( ")
import React = require("react");
import { injectable, inject } from "inversify";
import { interfaces, Container } from "inversify";
import * as ReactDOM from "react-dom";
export type LampWidgetFactory = () => Lamp;
export const LampViewWidgetFactory = Symbol("DeviceViewWidgetFactory");
export namespace Lamp {
  export interface pro{
    imgDisplay: string,
    lampStatus:boolean
  }
}
export class Lamp extends React.Component<Lamp.pro>{
  state: {
    status: boolean;
  };
  constructor(p: any) {
    super(p);

    this.state = {
      status: false
    };
    setInterval(() => {
      this.setState({
        status: !this.state.status
      });
    }, 3000);
  }

  // onUpdateRequest(msg:Message){
  //     super.onUpdateRequest(msg);
  //     ReactDOM.render(<React.Fragment>{this.render()}</React.Fragment>,this.node,()=>{
  //         alert("render scc")
  //     })
  // }

  render(): React.ReactNode {
    return (
      <div
        style={{
          width: "200px",
          height: "200px",
          position: "absolute"
        }}
      >
        <div style={{display:this.props.imgDisplay}}>
          <img
            style={{ display: this.props.lampStatus ? "none" : "inline" }}
            src={require("../../data/off.gif")}
            alt="关"
          />
          <img
            style={{ display: !this.props.lampStatus ? "none" : "inline" }}
         
            src={require("../../data/on.gif")}
            alt="开"
          />
        </div>{" "}
      </div>
    );
  }
}
export class LampWidget extends ReactWidget {
  constructor() {
    super();
    this.id = "abcde";
  }

  // onUpdateRequest(msg:Message){
  //     super.onUpdateRequest(msg);
  //     ReactDOM.render(<React.Fragment>{this.render()}</React.Fragment>,this.node,()=>{
  //         alert("render scc")
  //     })
  // }

  render(): React.ReactNode {
    return (
      <div
        style={{
          width: "200px",
          height: "200px",
          position: "absolute",
          backgroundColor: "red"
        }}
      >
        hello world
      </div>
    );
  }
}
// export function creatLamp(parent: interfaces.Container) {
//   let child = createTreeContainer(parent);
//   child
//     .rebind(TreeProps)
//     .toConstantValue({ ...defaultTreeProps, search: false });
//   child.bind(Lamp).toSelf();
//   return child.get<Lamp>("Lamp");
// }
