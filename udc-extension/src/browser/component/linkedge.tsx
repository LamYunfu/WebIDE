import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
import * as $ from "jquery";
export namespace LinkEdge {
  export interface Props {
    section: any;
    saveAll: () => any;
    openConfigFile: (pid: string) => void;
    initLinkedgeConfig: (pid: string) => Promise<boolean>;
    linkEdgeDisconnect: () => void;
    linkEdgeConnect: (pid: string, threeTuple: any) => Promise<boolean>;
    initPidQueueInfo(infos: string): Promise<string>;
    setSize(size: number): void;
    remove: (pid: string, index: string) => Promise<boolean>;
    develop(pid: string, indexStr: string): Promise<boolean>;
    add(pid: string, info: any): Promise<boolean>;
    getDevicesInfo(pid: string): Promise<any>;
    openExplore: () => void;
    openLinkedge: () => void;
  }
  export interface State {
    connectionStatus: boolean;
    executeStatus: boolean;
    connectionLoading: boolean;
    executeLoading: boolean;
    ra: any[];
    addTag: boolean;
  }
}
export class LinkEdgeView extends React.Component<
  LinkEdge.Props,
  LinkEdge.State
> {
  threeTuple: any = {};
  constructor(props: LinkEdge.Props) {
    super(props);
    console.log("init");
    this.state = {
      connectionLoading: false,
      executeLoading: false,
      connectionStatus: false,
      executeStatus: true,
      ra: [],
      addTag: false,
    };
  }
  componentDidMount() {
    this.props.openLinkedge();
    if (this.pid == "32") {
      // this.props.setSize(850);
      let pid = this.pid;
      this.props.initLinkedgeConfig(pid);
    } else {
      // this.props.openExplore();
    }
    setInterval(() => {
      this.props.saveAll();
    }, 5000);
  }
  get pid(): string {
    return this.props.section["ppid"][0];
  }
  async componentWillMount() {
    console.log("mountI");
    let pidQueueInfo: any = {};
    pidQueueInfo[this.pid] = {
      dirName: "LinkEdge",
      ppid: this.pid,
      type: "LinkEdge",
    };
    if (this.pid == "32") {
      await this.props.initPidQueueInfo(JSON.stringify(pidQueueInfo));
      let ra = await this.props.getDevicesInfo(this.pid);
      this.setState({ ra: ra });
    } else {
      pidQueueInfo[this.pid] = {
        dirName: "TinyEdge",
        ppid: this.pid,
        type: "LinkEdge",
      };
      await this.props.initPidQueueInfo(JSON.stringify(pidQueueInfo));
    }
  }

  toggleConnectionStatus = async () => {
    this.props.saveAll();
    this.setState({ connectionLoading: true });
    setTimeout(() => {
      this.setState({ connectionLoading: false });
    }, 3000);
    if (this.state.connectionStatus) {
      this.threeTuple["action"] = "stop";
      await this.props.linkEdgeConnect(this.pid, this.threeTuple);
      this.props.linkEdgeDisconnect();
      this.setState({
        connectionStatus: !this.state.connectionStatus,
        executeStatus: true,
      });
    } else {
      this.threeTuple["action"] = "connect";
      if (await this.props.linkEdgeConnect(this.pid, this.threeTuple)) {
        this.setState({
          connectionStatus: !this.state.connectionStatus,
        });
      } else {
        alert("err:" + JSON.stringify(this.threeTuple));
      }
    }
  };
  toggleExecuteStatus = async () => {
    this.threeTuple["action"] = this.state.executeStatus ? "stop" : "start";
    this.setState({ executeLoading: true });
    setTimeout(() => {
      this.setState({ executeLoading: false });
    }, 3000);
    if (await this.props.linkEdgeConnect(this.pid, this.threeTuple)) {
      this.setState({
        executeStatus: !this.state.executeStatus,
      });
    } else {
      alert("err:" + JSON.stringify(this.threeTuple));
    }
  };
  changeDeviceName = (e: any) => {
    this.threeTuple["$DeviceName"] = e.target.value;
  };
  changeDeviceSecret = (e: any) => {
    this.threeTuple["$DeviceSecret"] = e.target.value;
  };
  changeProductKey = (e: any) => {
    this.threeTuple["$ProductKey"] = e.target.value;
  };
  add = (deviceInfo: any) => {
    return this.props.add(this.pid, deviceInfo);
  };
  develop = (index: string) => {
    return this.props.develop(this.pid, index);
  };
  getRa = async () => {
    return await this.props.getDevicesInfo(this.pid);
  };
  setRa = (ra: any) => {
    alert(JSON.stringify(ra));
    this.setState({
      ra: ra,
    });
  };
  remove = (index: string) => {
    return this.props.remove(this.pid, index);
  };
  changeAddTag = () => {
    this.setState({
      addTag: !this.state.addTag,
    });
  };
  openConfigFile = () => {
    this.props.openConfigFile(this.pid);
  };
  render(): JSX.Element {
    if (this.pid == "32")
      return (
        <div
          style={{
            display: "none",
            padding: "20px",
            height: "100%",
            marginTop: "-30px",
          }}
        >
          <div id="edge_ppid" style={{ display: "none" }}>
            {this.props.section["ppid"][0]}
          </div>
          <div className="row" style={{ height: "10%" }}>
            <div
              className="title col-8"
              style={{
                color: "dimgray",
                fontSize: "3em ",
                padding: "auto",
                display: "flex",
                justifyItems: "center",
                alignItems: "center",
              }}
            >
              边缘计算
            </div>
            <div
              className="tuition col-4"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div>
                <div
                  style={{
                    textDecorationLine: "underline",
                    cursor: "pointer",
                    textDecorationColor: "dodgerblue",
                  }}
                >
                  开发平台
                </div>
                <div
                  style={{
                    textDecorationLine: "underline",
                    cursor: "pointer",
                    textDecorationColor: "dodgerblue",
                  }}
                >
                  官方文档
                </div>
              </div>
            </div>
          </div>
          <div className="row" style={{ height: "30%" }}>
            <div className="col-12">
              <div className="" style={{ fontSize: "2em" }}>
                实验描述
              </div>
              <div
                style={{
                  maxWidth: "70%",
                  position: "absolute",
                  zIndex: 1,
                  padding: "2%",
                }}
              >
                实验描述
              </div>
              <div
                className=""
                style={{
                  width: "75%",
                  height: "80%",
                  border: "solid",
                  zIndex: -1,
                  position: "relative",
                }}
              ></div>
            </div>
          </div>
          <div style={{ height: "10%" }}>
            <div style={{ fontSize: "2em" }}>网关控制</div>
            <div className="row">
              <div
                className="offset-1 col-2"
                style={{
                  fontSize: "1.3em",
                  cursor: "pointer",
                  color: "dodgerblue",
                  textDecorationLine: "underline",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={this.openConfigFile}
              >
                配置文件
              </div>
              <div className="col-6">
                <ButtonGroup
                  connectionLoading={this.state.connectionLoading}
                  executeLoading={this.state.executeLoading}
                  toggleConnectionStatus={this.toggleConnectionStatus}
                  toggleExecuteStatus={this.toggleExecuteStatus}
                  connectionStatus={this.state.connectionStatus}
                  executeStatus={this.state.executeStatus}
                ></ButtonGroup>
              </div>
            </div>
          </div>
          <div className="row" style={{ height: "5%" }}>
            <div className="col-4" style={{ fontSize: "2em" }}>
              子设备列表
            </div>
            <button
              className=".btn btn-primary offset-5"
              onClick={this.changeAddTag}
              style={{ borderRadius: "3px" }}
            >
              创建
            </button>
          </div>
          <div className="row" style={{ height: "45%" }}>
            <div className="col-12">
              <div
                style={{
                  width: "90%",
                  height: "80%",
                }}
              >
                <Form
                  changeAddTag={this.changeAddTag}
                  addTag={this.state.addTag}
                  ra={this.state.ra}
                  getRa={this.getRa}
                  setRa={this.setRa}
                  add={this.add}
                  develop={this.develop}
                  remove={this.remove}
                ></Form>
              </div>
            </div>
          </div>
        </div>
      );
    else {
      return (
        <div id="edge_ppid" style={{ display: "none" }}>
          {this.pid}
        </div>
      );
    }
  }
}
export namespace Input {
  export interface Props {
    value?: string;
    onChange?: (e: any) => void;
    disabled?: boolean;
    label: string;
    hint: string;
    copy?: boolean;
  }
}
export class Input extends React.Component<Input.Props> {
  index: number = 0;
  str: string = "";
  state = {
    str: undefined,
  };
  onChange = (e: any) => {
    this.props.onChange!(e);
    // alert(e.target.value)
    this.setState({ str: e.target.val });
    this.str = e.target.value;
  };
  render() {
    return (
      <div className="row cols-1">
        <div
          className="col-3"
          style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            fontStyle: "oblique",
            fontFamily: "fantasy",
          }}
        >
          {this.props.label}
        </div>
        <input
          type="text"
          className="form-control  col-8"
          id="name"
          disabled={this.props.disabled}
          placeholder={this.props.hint}
          onChange={this.onChange}
        />
        {this.props.copy ? (
          <a
            className="col-1"
            style={{
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "blue",
              cursor: " pointer",
              textDecoration: "underline",
            }}
            onClick={this.copy}
          >
            {" "}
            复制
          </a>
        ) : (
          ""
        )}
      </div>
    );
  }
  copy = () => {
    let item = document.createElement("textarea");
    item.innerHTML = this.str;
    document.body.append(item);
    item.select();
    document.execCommand("copy");
    item.remove();
  };
}

namespace ButtonGroup {
  /* eslint-disable */
  export interface Props {
    toggleConnectionStatus: () => void;
    toggleExecuteStatus: () => void;
    connectionLoading: boolean;
    executeLoading: boolean;
    connectionStatus: boolean;
    executeStatus: boolean;
  }
  export interface Status {}
}

class ButtonGroup extends React.Component<
  /* eslint-disable */
  ButtonGroup.Props,
  ButtonGroup.Status
> {
  constructor(p: ButtonGroup.Props) {
    super(p);
  }
  render() {
    return (
      <div className="row">
        {this.props.connectionStatus ? (
          <div className="col-5">
            <Button
              onClick={this.props.toggleConnectionStatus}
              value="释放"
              loading={this.props.connectionLoading}
            ></Button>
          </div>
        ) : (
          <div className="col-5">
            <Button
              disabled={this.props.connectionStatus}
              value="连接"
              onClick={this.props.toggleConnectionStatus}
              loading={this.props.connectionLoading}
            ></Button>
          </div>
        )}
        {!this.props.executeStatus && this.props.connectionStatus ? (
          <div className="col-5">
            <Button
              disabled={!this.props.connectionStatus}
              value="启动"
              onClick={this.props.toggleExecuteStatus}
              loading={this.props.executeLoading}
            ></Button>
          </div>
        ) : (
          <div className="col-5">
            <Button
              disabled={!this.props.connectionStatus}
              value="停止"
              onClick={this.props.toggleExecuteStatus}
              loading={this.props.executeLoading}
            ></Button>
          </div>
        )}
      </div>
    );
  }
}
namespace Button {
  export interface Props {
    onClick?: () => void;
    disabled?: boolean;
    value: string;
    loading?: boolean;
  }
}
class Button extends React.Component<Button.Props> {
  render() {
    return this.props.loading ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    ) : this.props.disabled ? (
      <button
        className="btn btn-warning"
        disabled={true}
        value={this.props.value}
        onClick={this.props.onClick}
      >
        {this.props.value}
      </button>
    ) : (
      <button
        className="btn btn-primary"
        disabled={false}
        value={this.props.value}
        onClick={this.props.onClick}
      >
        {this.props.value}
      </button>
    );
  }
}
namespace Form {
  export interface Props {
    changeAddTag: () => void;
    addTag: boolean;
    getRa: any;
    ra: any[];
    setRa: (ra: any) => void;
    add: (deviceInfo: any) => Promise<boolean>;
    develop: (index: string) => Promise<boolean>;
    remove: (index: string) => Promise<boolean>;
  }
  export interface Status {
    ra: any[];
  }
}
class Form extends React.Component<Form.Props, Form.Status> {
  constructor(props: Form.Props) {
    super(props);
    this.remove = this.remove.bind(this);

    // this.state = {
    //     ra: [{
    //         deviceName: "default",
    //         deviceType: "default"
    //     }]
    // }

    this.state = {
      ra: this.props.ra,
    };
  }
  add = async (item: any) => {
    let indexArr = this.props.ra;
    if (!(await this.props.add(item))) {
      alert("添加失败");
      return;
    }
    indexArr.push(item);
    this.setState({
      ra: indexArr,
    });
  };
  async remove(index: number) {
    $("a").css("pointer-events", "none");
    let ra = this.state.ra;
    if (!(await this.props.remove(index.toString()))) {
      alert("删除失败");
      return;
    }
    ra.splice(index, 1);
    this.setState({
      ra: ra,
    });
    $("a").css("pointer-events", "auto ");
  }
  release = (index: number) => {};
  burning = (index: number) => {};
  updateStatus = () => {};
  develop = (index: string) => {
    return this.props.develop(index);
  };
  async componentWillMount() {
    let ra = await this.props.getRa();
    await new Promise((res) => {
      this.setState({ ra: ra }, () => {
        res();
      });
    });
    console.log(JSON.stringify(this.state));
  }

  render() {
    return (
      <div style={{ padding: "20px" }}>
        <div className="row" style={{ backgroundColor: "gray" }}>
          <div
            className="col-1 "
            style={{
              border: "solid",
              borderWidth: "1px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            序号
          </div>
          <div
            className="col-2 "
            style={{
              border: "solid",
              borderWidth: "1px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            设备名
          </div>
          <div
            className="col-2 "
            style={{
              border: "solid",
              borderWidth: "1px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            设备类型
          </div>
          <div
            className="col-2 "
            style={{
              border: "solid",
              borderWidth: "1px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            状态
          </div>
          <div
            className="col-2 "
            style={{
              border: "solid",
              borderWidth: "1px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            IP
          </div>
          <div
            className="col-3"
            style={{
              border: "solid",
              borderWidth: "1px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            操作
          </div>
        </div>
        {this.state.ra.map((value, i) => {
          return (
            <FormData
              develop={this.develop}
              data={value}
              add={this.add}
              key={i}
              index={i}
              remove={this.remove}
            ></FormData>
          );
        })}
        <IndexAdder
          add={this.add}
          addTag={this.props.addTag}
          changeAddTag={this.props.changeAddTag}
        ></IndexAdder>
      </div>
    );
  }
}
namespace FormData {
  export interface Props {
    develop: (index: string) => Promise<boolean>;
    data: any;
    index: number;
    remove: (index: number) => void;
    add: (item: any) => void;
  }
}
class FormData extends React.Component<FormData.Props> {
  constructor(props: FormData.Props) {
    super(props);
    this.remove = this.remove.bind(this);
  }
  remove() {
    console.log(this.props.index);
    this.props.remove(this.props.index);
  }
  develop = (e: any) => {
    // alert(this.props.index.toString()+" :")
    this.props.develop(this.props.index.toString());
  };
  render() {
    return (
      <div className="row clos-1">
        <div className="col-1 " style={{ border: "solid", borderWidth: "1px" }}>
          {this.props.index + 1}
        </div>
        <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }}>
          {this.props.data["deviceName"] == undefined
            ? "default"
            : this.props.data["deviceName"]}
        </div>
        <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }}>
          {this.props.data["deviceType"] == undefined
            ? "default"
            : this.props.data["deviceType"]}
        </div>
        <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }}>
          {this.props.data["status"] == undefined
            ? "default"
            : this.props.data["status"]}
        </div>
        <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }}>
          {this.props.data["ip"] == undefined
            ? "default"
            : this.props.data["ip"]}
        </div>
        {/* <input className="col-3"></input> */}
        <div
          style={{
            border: "solid",
            borderWidth: "1px",
          }}
          className="col-3"
        >
          {/* <a >开发</a>|<a>释放</a>|<a onClick={this.remove}>删除</a>|<a>烧写</a> */}
          <a
            onClick={this.develop}
            style={{
              cursor: "pointer",
              textDecorationColor: "blue",
              textDecoration: "underline",
            }}
          >
            开发|
          </a>
          <a
            style={{
              cursor: "pointer",
              textDecorationColor: "blue",
              textDecoration: "underline",
            }}
          >
            提交|
          </a>
          <a
            style={{
              cursor: "pointer",
              textDecorationColor: "blue",
              textDecoration: "underline",
            }}
            onClick={this.remove}
          >
            删除
          </a>
        </div>
      </div>
    );
  }
}
namespace IndexAdder {
  export interface Props {
    changeAddTag: () => void;
    addTag: boolean;
    add: (item: any) => void;
  }
  export interface status {
    expand: boolean;
  }
}
class IndexAdder extends React.Component<IndexAdder.Props, IndexAdder.status> {
  constructor(props: IndexAdder.Props) {
    super(props);
    this.state = { expand: false };
    this.newIndex = this.newIndex.bind(this);
    this.submitIndex = this.submitIndex.bind(this);
  }
  deviceName: string = "";
  deviceType: string = "";
  setDeviceName = (e: any) => {
    this.deviceName = e.target.value;
  };
  setDeviceType = (e: any) => {
    this.deviceType = e.target.value;
  };
  newIndex() {
    this.setState({
      expand: !this.state.expand,
    });
  }
  submitIndex() {
    this.props.add({
      projectName: this.deviceName,
      deviceName: this.deviceName,
      deviceType: this.deviceType,
    });
    this.props.changeAddTag();
    this.reset();
  }
  reset = () => {
    this.deviceName = "";
    this.deviceType = "";
  };
  render() {
    return (
      <div
        style={{
          width: "80%",
          height: "100%",

          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          zIndex: this.props.addTag ? 1 : -1,
        }}
      >
        <div
          style={{
            width: "95%",
            top: 0,
          }}
        >
          {!this.props.addTag ? (
            ""
          ) : (
            <div
              style={{
                border: "solid",
                backgroundColor: "blue",
                padding: "40px",
              }}
            >
              <Input
                label="设备名:"
                hint=""
                onChange={this.setDeviceName}
              ></Input>
              <Input
                label="设备类型   :"
                hint=""
                onChange={this.setDeviceType}
              ></Input>
              <div className="offset-10">
                <Button
                  disabled={false}
                  value="确定"
                  onClick={this.submitIndex}
                ></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
LinkEdgeView.contextType = MyContext;
