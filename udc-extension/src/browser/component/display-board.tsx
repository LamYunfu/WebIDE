import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery";
import { MyContext } from "./context";
import { black } from "colors";
namespace DisplayBoard {
  export interface pro {
    setSize: (size: number) => void;
    processDisplaySubmit: (pid: string, info: string) => Promise<void>;
    attach: () => void;
  }
}

export class DisplayBoard extends React.Component<DisplayBoard.pro> {
  componentDidMount() {
    this.props.setSize(550)
  }
  state = {
    index: 0,
    project: "场景模拟",
    info: [
      {
        title: "智能灯控系统",
        desciption: "描述",
        pid: "19",
      },
      {
        title: "温湿度监测",
        desciption: "描述",
        pid: "19",
      },
      {
        title: "温控风扇",
        desciption: "描述",
        pid: "19",
      },
    ],
  };
  setIndex = (index: number) => {
    // alert(index);
    this.props.processDisplaySubmit(
      "",
      JSON.stringify({
        info: this.state.info[index],
        project: this.state.project,
      })
    );
    this.setState({
      index: index,
    });
  };
  render(): React.ReactNode {
    return (
      <div className="row" style={{ height: "75%" }}>
        <div className="key col-5">
          <KeyPanel
            selectedIndex={this.state.index}
            index={this.state.index}
            arr={this.state.info}
            setIndex={this.setIndex}
          ></KeyPanel>
        </div>
        <div
          className="board col-7"
          style={{
            backgroundColor: "gray",
            borderRadius: "3px",
          }}
        >
          <Board
            processDisplaySubmit={this.props.processDisplaySubmit}
            state={this.state}
          ></Board>
          {/* <button onClick={this.props.attach}>attach</button> */}
        </div>
      </div>
    );
  }
}
export namespace Board {
  export interface prop {
    processDisplaySubmit: (pid: string, info: string) => Promise<void>;
    state: any;
  }
}
export class Board extends React.Component<Board.prop> {
  constructor(prop: any) {
    super(prop);
  }
  burn = async () => {
    let state = this.props.state;
    let project = state.project;
    state = state.info[state.index];
    await this.props.processDisplaySubmit(state["pid"], "");
  };
  render(): React.ReactNode {
    return (
      <div
        className="container"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{ fontSize: "30px" }}>
          {this.props.state.info[this.props.state.index].title}
        </div>
        <div
          style={{
            border: "solid",
            height: "70%",
            borderRadius: "3px",
            padding: "10px",
          }}
        >
          {this.props.state.info[this.props.state.index].desciption}
        </div>
        <div className="row" style={{ position: "absolute", bottom: "20px" }}>
          <button
            className="btn btn-primary offset-1 col-4"
            onClick={() => {
              window.open("https://iot.console.aliyun.com/lk/summary");
            }}
          >
            云端界面
          </button>
          <button
            className="btn btn-primary offset-2 col-4"
            onClick={this.burn}
          >
            烧写设备
          </button>
        </div>
      </div>
    );
  }
}
export namespace KeyPanel {
  export interface pro {
    setIndex: (index: number) => void;
    index: number;
    arr: any[];
    selectedIndex: number;
  }
}
export class KeyPanel extends React.Component<KeyPanel.pro> {
  render(): React.ReactNode {
    let col = [];
    for (let index in this.props.arr) {
      col.push(
        <Key
          selectIndex={this.props.selectedIndex}
          name={this.props.arr[index].title}
          index={Number(index)}
          setIndex={this.props.setIndex}
        ></Key>
      );
    }
    return (
      <div style={{ width: "100%", display: "grid", gridRowGap: "20px" }}>
        {col}
      </div>
    );
  }
}
export namespace Key {
  export interface pro {
    selectIndex: number;
    name: string;
    index: number;
    setIndex: (index: number) => void;
  }
}
export class Key extends React.Component<Key.pro> {
  render(): React.ReactNode {
    return this.props.selectIndex != this.props.index ? (
      <div
        onClick={() => {
          this.props.setIndex(this.props.index);
        }}
        style={{
          width: "100%",
          backgroundColor: "lightblue",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          cursor: "pointer",
        }}
      >
        <span>{this.props.name}</span>
      </div>
    ) : (
      <div
        onClick={() => this.props.setIndex(this.props.index)}
        style={{
          width: "100%",
          backgroundColor: "antiquewhite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          cursor: "pointer",
        }}
      >
        <span>{this.props.name}</span>
      </div>
    );
  }
}
