import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery";
import { MyContext } from "./context";
import { PROBLEM_STATUS_URL } from "../../setting/front-end-config";
import { ProjectCreator } from "../projectCreator";
export namespace FreeCodingDisplay {
  export interface Props {
    title: string;
    section: { [key: string]: any };
    connect: (
      loginType: string,
      model: string,
      pid: string,
      timeout: string
    ) => void;
    disconnect: () => void;
    callUpdate: () => void;
    postSrcFile: (fn: string) => void;
    config: () => void;
    setCookie: (cookie: string) => void;
    say: (verbose: string) => void;
    outputResult: (res: string, types?: string) => void;
    setQueue: () => void;
    closeTabs: () => void;
    initPidQueueInfo(infos: string): Promise<string>;
    openShell: () => void;
    programSingleFile: (pidAndFn: string) => void;
  }

  export interface State {
    codingItems: JSX.Element[];
    ppid: string | undefined;
  }
}
export class FreeCodingDisplay extends React.Component<
  FreeCodingDisplay.Props,
  FreeCodingDisplay.State
> {
  timeout: { [pid: string]: string } = {};
  model: { [key: string]: string } = {};
  ppids: { [key: string]: string } = {};
  loginType: { [key: string]: string } = {};
  role: { [key: string]: string[] } = {};
  currentFocusCodingIndex: string[] = ["00000"];
  codingIssues: { [key: string]: string } = {};
  codingInfos: { [key: string]: string } = {};
  codingStatus: { [key: string]: string } = {};
  judgeStatus: string[] = [];
  submittedCodingIssue: string[] = [];
  pidQueueInfo: { [pid: string]: {} } = {};
  statusCode: { [key: number]: string } = {
    0x0000: "NO_GEN",
    0x0001: "GEN_FAIL",
    0x0010: "NO_SUB",
    0x0011: "JUDGING",
    0x0012: "PROG_ERR",
    0x0020: "ACCEPT",
    0x0021: "WRONG_ANSWER",
    0x0022: "TIMEOUT",
  };
  statusColors: { [key: number]: string } = {
    0x0000: "white",
    0x0001: "black",
    0x0010: "white",
    0x0011: "yellow",
    0x0012: "black",
    0x0020: "green",
    0x0021: "red",
    0x0022: "grey",
  };
  pids: string[] = [];
  codingItems: JSX.Element[] = [];
  addSubmittedCodingIssue = (issueIndex: string) => {
    this.submittedCodingIssue.push(issueIndex);
  };
  constructor(props: Readonly<FreeCodingDisplay.Props>) {
    super(props);
    this.state = {
      codingItems: [],
      ppid: undefined,
    };
  }

  async componentWillMount() {
    this.context.props.setSize(500);
  }
  async componentDidMount() {
    if (this.state.ppid != undefined)
      this.context.props.openSrcFile(this.state.ppid);
    let _this = this;
    $(document).ready(() => {
      // $(document).on("click", ".section." + _this.props.section.sid, (e) => {
      //     console.log("section click...................")
      //     _this.props.closeTabs()
      //     $(".contentsAndInfos." + _this.props.section.sid).toggle()
      // })
    });
    $(document).ready(() => {
      $("#connectButton" + _this.props.section.sid).click((e) => {
        if ($(e.currentTarget).text() == "断开") {
          _this.currentFocusCodingIndex[0] = "-1";
          _this.props.disconnect();
          $(e.currentTarget).text("连接");
          $("#setQueue" + this.props.section.sid).show();
        } else {
          let val = $("#codingInfoArea" + _this.props.section.sid).attr(
            "title"
          );
          // alert(val)
          val != undefined && (_this.currentFocusCodingIndex[0] = val);
          console.log(
            "<<<<<<<<<set current coding index:" +
              _this.currentFocusCodingIndex[0]
          );
          val != undefined &&
            _this.props.connect(
              _this.loginType[val],
              _this.model[val],
              val,
              _this.timeout[val]
            );
          $(e.currentTarget).text("断开");
        }
      });
      $(document).on("click", ".list-group-item", (e) => {
        $(".list-group-item").each((i, _this) => {
          $(_this).removeClass("list-group-item-primary");
        });
        $(e.currentTarget).addClass("list-group-item-primary");
      });
    });
    setInterval(() => {
      _this.pids.length != 0 &&
        $.ajax({
          headers: {
            accept: "application/json",
          },
          crossDomain: true,
          xhrFields: {
            withCredentials: true,
          },
          method: "POST",
          url: PROBLEM_STATUS_URL,

          contentType: "text/plain",
          data: JSON.stringify({ pid: _this.pids.join().trim() }),
          success: function(data) {},
        });
    }, 5000);
  }
  setPPid = (pid: string | undefined) => {
    this.setState({ ppid: pid });
  };
  showDefault = async () => {
    await this.props.openShell();
    await this.context.props.openExplorer();
    await this.context.props.openSrcFile(this.state.ppid);
    await this.context.showTheDefaultFreeCodingView();
  };
  delProject = (pid: string) => {
    return this.context.props.delProject(pid);
  };
  render(): JSX.Element {
    return (
      <div>
        <div>
          <ProjectCreator
            delProject={this.delProject}
            showDefault={this.showDefault}
            setPPid={this.setPPid}
            initPidQueueInfo={this.props.initPidQueueInfo}
          ></ProjectCreator>
        </div>
        {this.state.ppid ? (
          <div style={{ height: "100%", display: "none" }}>
            <div
              className="title_timer"
              title={this.state.ppid}
              style={{ height: "10%" }}
            >
              <h4 className={`section experiment`}>自由实验</h4>
              <span id="timer"></span>
            </div>
            <div className="row col-12" style={{ height: "80%" }}>
              <div
                className="col-12"
                style={{ fontSize: "30px", height: "20%" }}
              >
                项目:{this.props.title}
                <div style={{ marginLeft: "0px", fontSize: "30px" }}>
                  这是一个关于{this.props.title}的项目
                </div>
              </div>
              <div
                className="col-12"
                style={{ fontSize: "30px", height: "30%" }}
              >
                可用设备：
                <div style={{ marginLeft: "100px", fontSize: "25px" }}>
                  <li>tinylink_lora</li>
                  <li>esp32</li>
                  <li>tinylink_platform</li>
                  <li>developerkit</li>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
FreeCodingDisplay.contextType = MyContext;
