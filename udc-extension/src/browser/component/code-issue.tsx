import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery";
import { MyContext } from "./context";
import { FINISH_URL } from "../../setting/front-end-config";
// import { getCompilerType } from "../../node/globalconst";
// import { MyContext } from "./context";

export namespace CodeItem {
  export interface Props {
    sid: string;
    akey: string;
    loginType: string;
    model: string;
    role: string[];
    codingStatus: { [key: string]: string };
    codingTitles: { [key: string]: string };
  }
}

export class CodeItem extends React.Component<CodeItem.Props> {
  public render(): JSX.Element {
    return (
      // <li className={`codeItem${this.props.sid} list-group-item`} style={{backgroundColor:"#ca6262"}} >
      <li className={`codeItem${this.props.sid} list-group-item`}>
        <span className="model" style={{ display: "none" }}>
          {this.props.model}
        </span>
        <span className="oi oi-terminal" aria-hidden="true"></span>
        <a title={this.props.akey}>
          {this.props.codingTitles[this.props.akey]}
        </a>
        &nbsp;
        <span
          className="oi"
          aria-hidden="true"
          style={{ display: "none", float: "right" }}
        ></span>
        {/* <a className="issue_status">●</a><br /> */}
      </li>
    );
  }
}
export namespace CodingInfo {
  export interface Props {
    sid: string;
    roles: { [key: string]: string[] };
    currentFocusCodingIndex: string[];
    issueStatusStrs: { [key: string]: string };
    coding_titles: { [key: string]: string };
    postSrcFile: (fn: string) => void;
    addCodingSubmittedIssue: (index: string) => void;
    say: (verbose: string) => void;
    config: () => void;
    codeInfoType: string;
    codingInfos: { [key: string]: string };
    openShell: () => void;
    programSingleFile: (pidAndFn: string) => void;
    viewType?: string;
  }
  export interface States {
    pid: string;
    singleFileButtons: JSX.Element[];
    currentFile: string;
    connectionStatus: string;
  }
}

export class CodingInfo extends React.Component<
  CodingInfo.Props,
  CodingInfo.States
> {
  focusFile: string = "";
  constructor(props: Readonly<CodingInfo.Props>) {
    super(props);
    this.state = {
      pid: "",
      singleFileButtons: [],
      currentFile: "",
      connectionStatus: "连接",
    };
  }
  componentDidMount() {
    console.log("view type:" + this.props.viewType + "abc");
    this.context.props.isconnected().then((res: boolean) => {
      if (res) {
        _this.context.props.disconnect();
      }
    });
    let _this = this;
    $(document).ready(() => {
      $(document).on(
        "click",
        "#submitSrcButton" + _this.props.sid,
        async (e) => {
          $("[id*=submitSrcButton]").attr("disabled", "true");
          if (!confirm("即将提交到判题系统，是否继续？")) {
            $("[id*=submitSrcButton]").removeAttr("disabled")
            return;
          }
          let pid = $("#codingInfoArea" + _this.props.sid).attr("title");
          if (!(await _this.context.props.connect("", "", pid, 30))) {
            $("[id*=submitSrcButton]").removeAttr("disabled")
            return;
          }

          $("[id*=connectButton]").attr("disabled", "true");
          _this.context.props.setSubmitEnableWithJudgeTag(false);
          await _this.context.props.saveAll();
          let index = $("#codingInfoArea" + this.props.sid).attr("title");
          // if (_this.props.currentFocusCodingIndex[0] != index) {
          //     _this.props.say("所连设备与当前题目所需不一致,请重新连接设备")
          //     $("[id*=connectButton]").text("连接")
          //     await _this.context.props.disconnect()
          //     $("[id*=connectButton]").removeAttr("disabled")
          //     $("[id*=submitSrcButton]").removeAttr("disabled")
          //     return
          // }
          console.log(
            "click submit:" + index + "#codingInfofArea" + this.props.sid
          );
          index != undefined && _this.props.postSrcFile(index);
          index != undefined && _this.props.addCodingSubmittedIssue(index);
        }
      );
      $(document).on(
        "click",
        "#submitSimButton" + _this.props.sid,
        async (e) => {
          await this.context.props.saveAll();
          let index = $("#codingInfoArea" + this.props.sid).attr("title");
          index != undefined && _this.context.props.postSimFile(index);
          index != undefined && _this.props.addCodingSubmittedIssue(index);
        }
      );
      $(document).on(
        "click",
        ".submitSimButton" + _this.props.sid,
        async (e) => {
          _this.context.props.terminateExe();
          await this.context.props.saveAll();
          let index = $("#codingInfoArea" + this.props.sid).attr("title");
          index != undefined && _this.context.props.postSimFile(index);
          index != undefined && _this.props.addCodingSubmittedIssue(index);
        }
      );
      $(document).on("click", ".queueButton" + _this.props.sid, async (e) => {
        _this.context.props.continueExe();
      });
      $(document).on("click", `.codeItem${_this.props.sid}`, async (e) => {
        // alert("click codeItem")
        _this.context.props.disconnect();
        $(".selectPanel").css("box-shadow", "");
        if ($(".selectPanel").hasClass("col-3")) {
          $(".selectPanel").removeClass("col-3");
        }
        $(".selectPanel").addClass("col-12");
        if ($(".contents").hasClass("col-12")) {
          $(".contents").removeClass("col-12");
        }
        $(".contents").addClass("col-5");
        _this.props.openShell();
        let tmp = $(e.currentTarget)
          .children("a")
          .attr("title");
        $(".optionDescription").hide();
        $(".optionChoices").hide();
        _this.context.props.setSize(720);
        if (tmp != undefined) {
          let singleFileButtons = _this.state.singleFileButtons;
          if (_this.props.roles[tmp] != undefined) {
            for (let item of _this.props.roles[tmp]) {
              singleFileButtons.push(
                <span>
                  <button
                    className={`singleFile btn btn-primary col-auto`}
                    id={`${item} `}
                  >
                    {item}
                  </button>
                </span>
              );
            }
          }
          _this.setState({
            pid: tmp,
            singleFileButtons: singleFileButtons,
          });
          // alert(singleFileButtons.length)
          _this.context.props.openSrcFile(tmp);
          if (
            _this.props.coding_titles[tmp].split("AliOS").length > 1 ||
            _this.props.coding_titles[tmp].split("阿里云").length > 1
          )
            $("#submitSimButton" + this.props.sid).hide();
          $(".codingInfos." + _this.props.sid).show();
          $("#coding_title" + _this.props.sid).html(
            _this.props.coding_titles[tmp]
          );
          //$("#codingInfoArea").val(_this.props.codingInfos[tmp])
          $("#codingInfoArea" + _this.props.sid).text(
            _this.props.codingInfos[tmp]
          );
          $("#codingInfoArea" + _this.props.sid).attr("title", tmp);
        }
      });
      $(document).on("click", "#finish", () => {
        if (!confirm("即将提交答卷，确认要继续？")) return;
        $.ajax({
          headers: {
            accept: "application/json",
          },
          crossDomain: true,
          xhrFields: {
            withCredentials: true,
          },
          method: "get",
          url: FINISH_URL,
          dataType: "json",
          contentType: "text/plain",
          data: "",
          success: function(data) {
            window.close();
            console.log(data);
          },
        });
      });
      $(document).on("click", ".singleFile", (e) => {
        let fileName = $(e.currentTarget).attr("id");
        // alert("filename:" + fileName)
        if (fileName == undefined) {
          alert("there is no this role!");
          return;
        } else {
          _this.focusFile = fileName.split(".")[0];
          _this.setState({
            currentFile: _this.focusFile,
          });
          _this.props.say(`设置当前配置对象为${_this.focusFile}`);
          // alert("focusFile is ：" + _this.focusFile)
          $(`.codingRole${_this.props.sid}`).text(_this.focusFile);
        }
      });
      $(document).on("click", `.simButton`, () => {
        $(".simInfo").hide();
      });
      $(document).on(
        "click",
        `#singleFileSubmitButton` + _this.props.sid,
        async (e) => {
          // alert("singleFileProgram")
          await this.context.props.saveAll();
          if (_this.focusFile == "") {
            alert("请点击对应角色按钮、配置后再次烧入");
            return;
          } else {
            let val = $("#codingInfoArea" + _this.props.sid).attr("title");
            _this.props.say(`正在烧入对象：${_this.state.currentFile.trim()}`);
            // alert(`${val}&helloworld_${_this.state.currentFile}xyz`)
            _this.props.programSingleFile(
              `${val}&${_this.state.currentFile.trim()}`
            );
          }
        }
      );
    });
  }

  public render() {
    return this.props.codeInfoType == "coding" ? (
      <div
        className={`codingInfos ${this.props.sid} card text-white bg-secondary`}
        style={{ minWidth: "380px" }}
      >
        <div className={` Container card-body`}>
          <h5 id="titleAndStatus" className="card-title">
            <span id={"coding_title" + this.props.sid}>关于mqtt的一道题</span>
          </h5>
          <div
            className={`onlineCount ${this.state.pid}`}
            style={{
              textAlign: "right",
              color: "chartreuse",
              fontSize: "12px",
            }}
          >
            当前有
            <span style={{ textDecorationLine: "underline", color: "yellow" }}>
              ***
            </span>
            人在做这道题
          </div>
          <div id="codingInfoAreaContainer">
            {/* <textarea title="1" id="codingInfoArea" disabled={true} defaultValue="你需要使用mqtt来实现这一道题目"></textarea> */}
            <pre
              className="card-text"
              id={"codingInfoArea" + this.props.sid}
              title="1"
            >
              你需要使用mqtt来实现这一道题目
            </pre>
          </div>
          {/* <span><button className="btn btn-primary" id={"connectButton" + this.props.sid}>{this.state.connectionStatus}</button></span> */}
          {/* <span><button className="btn btn-primary" id={"setQueue" + this.props.sid}>排队</button></span> */}

          {/* <span><button className="btn btn-primary" id={"configButton" + this.props.sid} onClick={this.props.config}>配置</button></span> */}
          <span>
            <button
              className="btn btn-primary"
              id={"submitSrcButton" + this.props.sid}
            >
              提交本题
            </button>
          </span>
          {this.props.viewType == "4" ? (
            <span>
              <button className="btn btn-primary" id={"finish"}>
                提交答卷
              </button>
            </span>
          ) : (
            ""
          )}
          <span>
            <button
              className="btn btn-primary"
              id={"submitSimButton" + this.props.sid}
            >
              仿真
            </button>
          </span>
        </div>
        <div
          className="simInfo "
          style={{
            position: "absolute",
            top: "30%",
            backgroundColor: "#525252",
            borderStyle: "solid",
            borderColor: "blue",
            borderRadius: "10px",
            width: "300px",
            height: "200px",
            display: "none",
          }}
        >
          <div>设备已占满，是否需要仿真支持？</div>
          <button
            className={`submitSimButton${this.props.sid} simButton btn btn-primary`}
            style={{ position: "absolute", bottom: "10%", left: "10%" }}
          >
            仿真
          </button>
          <button
            className={`queueButton${this.props.sid} simButton btn btn-primary`}
            style={{ position: "absolute", bottom: "10%", right: "10%" }}
          >
            {" "}
            排队
          </button>
        </div>
      </div>
    ) : (
      <div
        className={`codingInfos ${this.props.sid} card text-white bg-secondary`}
      >
        <span
          className={`codingRole${this.props.sid}`}
          style={{ display: "none" }}
        ></span>
        <div className={` Container card-body`}>
          <h5 id="titleAndStatus" className="card-title">
            <span id={"coding_title" + this.props.sid}>
              关于场景编程的一道题
            </span>
          </h5>
          <div id="codingInfoAreaContainer">
            {/* <textarea title="1" id="codingInfoArea" disabled={true} defaultValue="你需要使用mqtt来实现这一道题目"></textarea> */}
            <pre
              className="card-text"
              id={"codingInfoArea" + this.props.sid}
              title="1"
            >
              你需要使用mqtt来实现这一道题目
            </pre>
          </div>
          <div className="controlButtons col-12">
            {this.state.singleFileButtons.length == 0
              ? []
              : this.state.singleFileButtons}
            {/* {this.state.singleFileButtons} */}
            <br />
            <div>
              <span>
                <button
                  className="btn btn-primary col-auto"
                  id={"connectButtonSingleFile" + this.props.sid}
                >
                  {this.state.connectionStatus}
                </button>
              </span>
              <span>
                <button
                  className="btn btn-primary col-auto"
                  id={"configButton" + this.props.sid}
                  onClick={this.props.config}
                >
                  配置
                </button>
              </span>
              <span>
                <button
                  className="btn btn-primary col-auto"
                  id={"singleFileSubmitButton" + this.props.sid}
                >
                  烧入
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
CodingInfo.contextType = MyContext;
