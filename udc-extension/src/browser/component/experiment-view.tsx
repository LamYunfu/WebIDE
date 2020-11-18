import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery";
import { find } from "@phosphor/algorithm";
import { CodeItem, CodingInfo } from "./code-issue";
import { MyContext } from "./context";
import { getCompilerType } from "../../node/globalconst";
import {
  DETAIL_ISSUE_URL,
  LINK_LAB_HOMEPAGE_URL,
  PROBLEM_STATUS_URL,
} from "../../setting/front-end-config";
import { CallSymbol } from "../../setting/callsymbol";
export namespace Experiment {
  export interface Props {
    section: { [key: string]: any };
    connect: (
      loginType: string,
      model: string,
      pid: string,
      timeout: string
    ) => Promise<boolean>;

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
  }
}
export class Experiment extends React.Component<
  Experiment.Props,
  Experiment.State
> {
  timeout: { [pid: string]: string } = {};
  model: { [key: string]: string } = {};
  boardType: { [key: string]: string } = {};
  compileMethod: { [key: string]: string } = {};
  deviceType: { [key: string]: string } = {};
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
    0x0020: "ACCEPTED",
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
  lastSubmitCount: { [pid: string]: any } = {};
  addSubmittedCodingIssue = (issueIndex: string) => {
    this.submittedCodingIssue.push(issueIndex);
  };
  constructor(props: Readonly<Experiment.Props>) {
    super(props);
    this.state = {
      codingItems: [],
    };
  }

  componentWillMount() {
    this.context.props.setSize(720);
    let _this = this;
    _this.props.section.ppid != "null" &&
      $.ajax({
        headers: {
          accept: "application/json",
        },
        crossDomain: true,
        xhrFields: {
          withCredentials: true,
        },
        method: "POST",
        url: DETAIL_ISSUE_URL,

        dataType: "json",
        contentType: "text/plain",
        data: JSON.stringify({ ppid: _this.props.section.ppid }), //model 为登录类型 alios,组别 ble, logintype 为登录的方式 如adhoc,
        //请求返回的题目相关的数据
        success: (data) => {
          // alert(JSON.stringify(data))
          console.log(JSON.stringify(data));
          let x = data.data; // show response from the php script.
          let fns = [];
          for (let item of x) {
            //设备类型：["device"] 单设备类型     ["server","client"]有发送端和接收端的设备类型
            _this.role[`${item.pid}`] = item.deviceRole;
            _this.model[`${item.pid}`] = item.deviceType;
            _this.compileMethod[`${item.pid}`] = item.compileType;
            _this.boardType[`${item.pid}`] = item.boardType;
            _this.pidQueueInfo[item.pid] = {};
            //pid代表实验号，每个实验对象都有一个，ppid代表实验类型号
            _this.ppids[`${item.pid}`] = item.ppid;
            let tmp = {};
            fns = item.deviceRole;
            if (item.deviceAmount == "1") {
              // _this.loginType[`${item.pid}`] = 'fixed'

              _this.loginType[`${item.pid}`] = "adhoc";
              _this.model[`${item.pid}`] = item.deviceType;
              tmp = { ...tmp, loginType: "adhoc", model: item.deviceType };
            } else {
              _this.loginType[`${item.pid}`] = "queue";
              _this.role[`${item.pid}`] = item.deviceRole;
              _this.model[`${item.pid}`] = item.deviceType;
              tmp = { ...tmp, loginType: "queue", model: item.deviceType };
            }
            //console.log("login type is :" + _this.loginType[`${item.pid}`]);
            _this.timeout[item.pid] = item.timeout;
            _this.codingIssues[item.pid] = item.title;
            tmp = {
              ...tmp,
              fns: JSON.stringify(fns),
              timeout: item.timeout,
              dirName: item.title,
              projectName: "helloworld",
              deviceRole: _this.role[`${item.pid}`],
              boardType:_this.boardType[`${item.pid}`],
              compilerType:_this.compileMethod[`${item.pid}`],
              ppid: _this.ppids[`${item.pid}`],
            };
            _this.pidQueueInfo[item.pid] = tmp;
            
            console.log("传入之前的数据格式是：" + fns.length);
            _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo));
            _this.codingInfos[item.pid] = item.content;
            _this.pids.push(item.pid);
          }
          for (let entry in _this.codingIssues)
            _this.codingItems.push(
              <CodeItem
                loginType={_this.loginType[entry]}
                model={_this.model[entry]}
                role={_this.role[entry]}
                sid={_this.props.section.sid}
                akey={entry}
                key={entry}
                codingTitles={_this.codingIssues}
                codingStatus={_this.codingStatus}
              />
            );
          _this.setState((state) => ({
            ...state,
            codingItems: _this.codingItems,
          }));
          //_this.props.callUpdate()
        },
      });
  }

  async componentDidMount() {
    let _this = this;
    // $(document).ready(
    //     () => {
    //         $(document).on("click", ".section." + _this.props.section.sid, (e) => {
    //             console.log("section click...................")
    //             _this.props.closeTabs()
    //             $(".contentsAndInfos." + _this.props.section.sid).toggle()
    //         })
    //     }
    // )
    $(document).ready(() => {
      $("#connectButton" + _this.props.section.sid).click(async (e) => {
        if ($(e.currentTarget).text() == "断开") {
          _this.currentFocusCodingIndex[0] = "-1";
          _this.props.disconnect();
          $(e.currentTarget).text("连接");
          $("#setQueue" + this.props.section.sid).show();
        } else {
          let val = $("#codingInfoArea" + _this.props.section.sid).attr(
            "title"
          );
          let res = "";
          // alert(val)
          if (
            val != undefined &&
            !(await _this.props.connect(
              _this.loginType[val],
              _this.model[val],
              val,
              _this.timeout[val]
            ))
          ) {
            console.log(res);
            return;
          }
          val != undefined && (_this.currentFocusCodingIndex[0] = val);
          console.log(
            "<<<<<<<<<set current coding index:" +
              _this.currentFocusCodingIndex[0]
          );

          $(e.currentTarget).text("断开");
        }
      });
      $("#setQueue" + this.props.section.sid).click(() => {
        // let index = $("#codingInfoArea" + this.props.section.sid).attr("title")
        // if (_this.currentFocusCodingIndex[0] != index) {
        //     _this.props.say("所连设备与当前题目所需不一致,请重新连接设备")
        //     return
        // }
        _this.props.setQueue();
        _this.props.say("已设为排队模式");
        $("#setQueue" + this.props.section.sid).hide();
      });
      $(document).on("click", ".list-group-item", (e) => {
        $(".list-group-item").each((i, _this) => {
          $(_this).removeClass("list-group-item-primary");
        });
        $(e.currentTarget).addClass("list-group-item-primary");
      });
    });
    setInterval(() => {
      // _this.context.props.storeCallInfo(
      //   new Date().toISOString().replace(/T|Z/gi, " "),
      //   "start",
      //   CallSymbol.QJST,
      //   0
      // );
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
          success: function(data) {
            // _this.context.props.storeCallInfo(
            //   new Date().toISOString().replace(/T|Z/gi, " "),
            //   "end",
            //   CallSymbol.QJST,
            //   0
            // );
            // alert(JSON.stringify(data))
            if (data.code != "0") {
              _this.props.outputResult(data.message);
              window.location.replace(LINK_LAB_HOMEPAGE_URL);
              return;
            }
            let tmp = [data.data];
            for (let x of tmp) {
              if (_this.lastSubmitCount[x.pid] == undefined) {
                _this.lastSubmitCount[x.pid] = x.submit;
              }
              $(`.onlineCount.${x.pid}>span`).text(x.count);
              _this.codingStatus[x.pid] = x.status;
              if (
                find(
                  _this.submittedCodingIssue,
                  (value, index) => x.pid == value
                ) == undefined
              ) {
                continue;
              }
              let status = _this.statusCode[parseInt(x.status)];
              if (
                _this.lastSubmitCount != undefined &&
                _this.lastSubmitCount[x.pid] != undefined &&
                _this.lastSubmitCount[x.pid] != x.submit
              ) {
                _this.judgeStatus[x.pid] = "1";
              } else {
                continue;
              }
              if (status == "JUDGING") {
                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-warning");
                let sp = $(
                  `.codeItem${_this.props.section.sid} a[title=${x.pid}]`
                ).next();
                console.log("judging.....................................");
                sp.attr("class", "oi oi-ellipses");
                sp.show();
                _this.judgeStatus[x.pid] = "1";
                continue;
              } else if (status == "ACCEPTED") {
                // _this.context.props.getSubmitEnableWithJudgeTag() == true && $("[id*=connectButton]").removeAttr("disabled")
                // _this.context.props.getSubmitEnableWithJudgeTag() == true && $("[id*=submitSrcButton]").removeAttr("disabled")
                _this.context.props.setSubmitEnableWithJudgeTag(false);
                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-success");
                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`)
                  .next()
                  .attr("class", "oi oi-check")
                  .show();
                if (_this.judgeStatus[x.pid] == "1") {
                  //9.27
                  if (x.wrongInfo != "") _this.props.outputResult(x.wrongInfo);
                  _this.props.outputResult(
                    "ACCEPTED" + `(${x.score})`,
                    "rightAnswer"
                  );
                  _this.submittedCodingIssue.splice(
                    _this.submittedCodingIssue.indexOf(x.pid)
                  );
                  _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid));
                  $("[id*=connectButton]").removeAttr("disabled");
                  $("[id*=submitSrcButton]").removeAttr("disabled");
                  _this.judgeStatus[x.pid] = "0";
                }
              } else if (status == "WRONG_ANSWER") {
                // _this.context.props.getSubmitEnableWithJudgeTag() == true && $("[id*=connectButton]").removeAttr("disabled")
                // _this.context.props.getSubmitEnableWithJudgeTag() == true && $("[id*=submitSrcButton]").removeAttr("disabled")
                _this.context.props.setSubmitEnableWithJudgeTag(false);
                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-danger");
                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`)
                  .next()
                  .attr("class", "oi oi-x")
                  .show();
                // alert(_this.judgeStatus[x.pid])
                if (_this.judgeStatus[x.pid] == "1") {
                  if (x.wrongInfo != "")
                    _this.props.outputResult(x.wrongInfo, "wrongAnswer");
                  _this.props.outputResult(
                    "WRONG_ANSWER" + `(${x.score})`,
                    "wrongAnswer"
                  );
                  _this.submittedCodingIssue.splice(
                    _this.submittedCodingIssue.indexOf(x.pid)
                  );
                  _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid));
                  $("[id*=connectButton]").removeAttr("disabled");
                  $("[id*=submitSrcButton]").removeAttr("disabled");
                  _this.judgeStatus[x.pid] = "0";
                }
              } else if (status == "TIMEOUT") {
                // _this.context.props.getSubmitEnableWithJudgeTag() == true && $("[id*=connectButton]").removeAttr("disabled")
                // _this.context.props.getSubmitEnableWithJudgeTag() == true && $("[id*=submitSrcButton]").removeAttr("disabled")
                _this.context.props.setSubmitEnableWithJudgeTag(false);
                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-info");
                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`)
                  .next()
                  .attr("class", "oi oi-clock")
                  .show();
                if (_this.judgeStatus[x.pid] == "1") {
                  $("[id*=connectButton]").removeAttr("disabled");
                  $("[id*=submitSrcButton]").removeAttr("disabled");
                  _this.judgeStatus[x.pid] = "0";
                }
              } else {
                _this.context.props.getSubmitEnableWithJudgeTag() == true &&
                  $("[id*=connectButton]").removeAttr("disabled");
                _this.context.props.getSubmitEnableWithJudgeTag() == true &&
                  $("[id*=submitSrcButton]").removeAttr("disabled");
                _this.context.props.setSubmitEnableWithJudgeTag(false);
                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-dark");
                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`)
                  .next()
                  .attr("class", "oi oi-question-mark");
              }
              _this.lastSubmitCount[x.pid] = x.submit;
            }
          },
        });
    }, 3000);
    while (this.state.codingItems.length == 0)
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    this.context.showTheDefaultExperimentView();
  }

  render(): JSX.Element {
    return (
      <div>
        <div className="title_timer">
          <h4 className={`section experiment`}>LinkLab实验题</h4>
          <span id="timer"></span>
        </div>
        <div className={`contentsAndInfos ${this.props.section.sid} container`}>
          <div className="row">
            <div className="contents col-5">
              <div className="row">
                <div className={`coding${this.props.section.sid} col-12`}>
                  <ul className="list-group">
                    {/* codingItems 显示的就是左边的内容，也就是蓝色小框部分*/}
                    {this.state.codingItems.length == 0 ? "" : this.codingItems}
                  </ul>
                </div>
              </div>
            </div>
            {/* 题目信息部分 */}
            <div className={`codingInfos ${this.props.section.sid} col-7`}>
              <CodingInfo
                programSingleFile={this.props.programSingleFile}
                codingInfos={this.codingInfos}
                openShell={this.props.openShell}
                codeInfoType="coding"
                config={this.props.config}
                roles={this.role}
                sid={"experiment"}
                say={this.props.say}
                currentFocusCodingIndex={this.currentFocusCodingIndex}
                issueStatusStrs={this.codingStatus}
                coding_titles={this.codingIssues}
                postSrcFile={this.props.postSrcFile}
                addCodingSubmittedIssue={this.addSubmittedCodingIssue}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Experiment.contextType = MyContext;
