import React = require("react");
import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import { CodeItem, CodingInfo } from "./code-issue"
export namespace Scene {
    export interface Props {
        section: { [key: string]: any }
        connect: (loginType: string, model: string, pid: string, timeout: string) => void
        disconnect: () => void
        callUpdate: () => void
        openSrcFile: (uri: URI) => void
        postSrcFile: (fn: string) => void
        config: () => void
        setCookie: (cookie: string) => void
        say: (verbose: string) => void
        outputResult: (res: string) => void
        setQueue: () => void
        closeTabs: () => void
        initPidQueueInfo(infos: string): Promise<string>
        openShell: () => void
        programSingleFile: (pidAndFn: string) => void
    }


    export interface State {
        codingItems: JSX.Element[]
    }
}
export class Scene extends React.Component<Scene.Props, Scene.State> {
    timeout: { [pid: string]: string } = {}
    model: { [key: string]: string } = {}
    loginType: { [key: string]: string } = {}
    role: { [key: string]: string[] } = {}
    currentFocusCodingIndex: string[] = ['00000']
    codingIssues: { [key: string]: string } = {}
    codingInfos: { [key: string]: string } = {}
    codingStatus: { [key: string]: string } = {}
    judgeStatus: string[] = []
    submittedCodingIssue: string[] = []
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    deviceButtons: JSX.Element[] = []
    addSubmittedCodingIssue = (issueIndex: string) => {
        this.submittedCodingIssue.push(issueIndex)
    }
    constructor(props: Readonly<Scene.Props>) {
        super(props)
        this.state = {
            codingItems: []
        }
    }


    componentWillMount() {
        let _this = this
        _this.props.section.ppid != 'null' && $.ajax(
            {
                headers: {
                    "accept": "application/json",
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                method: "POST",
                url: "http://api.tinylink.cn/problem/detail",

                dataType: 'json',
                contentType: "text/plain",
                data: JSON.stringify({ ppid: _this.props.section.ppid }), // serializes the form's elements.
                success: function (data) {
                    // alert(JSON.stringify(data))
                    console.log(JSON.stringify(data))
                    let x = data.data; // show response from the php script.
                    let fns = []
                    for (let item of x) {
                        _this.pidQueueInfo[item.pid] = {}
                        let tmp = {}
                        _this.loginType[`${item.pid}`] = 'group'
                        _this.role[`${item.pid}`] = item.deviceRole
                        _this.model[`${item.pid}`] = item.deviceType
                        tmp = { ...tmp, loginType: 'group', model: item.deviceType }
                        console.log("login type is :" + _this.loginType[`${item.pid}`])
                        _this.timeout[item.pid] = item.timeout
                        _this.codingIssues[item.pid] = item.title
                        if (_this.role[`${item.pid}`] == undefined)
                            fns.push("helloworld")
                        else {
                            for (let r of _this.role[`${item.pid}`]) {
                                fns.push("helloworld" + "_" + r)

                            }
                        }
                        if (item.deviceType.split("-")[0] == "alios") {
                            fns.push("helloworld" + ".mk")
                            fns.push("ucube.py")
                            fns.push("README.md")
                        }
                        tmp = { ...tmp, fns: JSON.stringify(fns), timeout: item.timeout, dirName: item.title }
                        _this.pidQueueInfo[item.pid] = tmp
                        _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo)).then(() => {
                            console.log("initpidqueue scc")
                        })
                        _this.codingInfos[item.pid] = item.content
                        _this.pids.push(item.pid)
                    }

                    for (let entry in _this.codingIssues)
                        _this.codingItems.push(<CodeItem loginType={_this.loginType[entry]} model={_this.model[entry]}
                            role={_this.role[entry]} sid={_this.props.section.sid} akey={entry} key={entry}
                            codingTitles={_this.codingIssues}
                            codingStatus={_this.codingStatus} />)
                    _this.setState((state) => ({
                        ...state,
                        codingItems: _this.codingItems
                    }))

                    for (let index in _this.role) {
                        _this.deviceButtons.push(<button className={`${_this.role[index]} btn btn-primary`}>
                            {_this.role[index]}
                        </button>)
                    }
                }

            }
        )
    }


    componentDidMount() {

        let _this = this
        $(document).ready(
            () => {
                $(document).on("click", ".section." + _this.props.section.sid, (e) => {
                    console.log("section click...................")
                    _this.props.closeTabs()
                    $(".contentsAndInfos." + _this.props.section.sid).toggle()
                })
            }
        )
        $(document).ready(
            () => {
                $("#connectButton" + _this.props.section.sid).click(
                    (e) => {
                        if ($(e.currentTarget).text() == "断开") {
                            _this.props.disconnect()
                            $(e.currentTarget).text("连接")
                        }
                        else {
                            let val = $("#codingInfoArea" + _this.props.section.sid).attr("title")//pid
                            // alert(val)
                            val != undefined && (_this.currentFocusCodingIndex[0] = val)
                            console.log("<<<<<<<<<set current coding index:" + _this.currentFocusCodingIndex[0])
                            val != undefined && _this.props.connect(_this.loginType[val], _this.model[val], val, _this.timeout[val])
                            $(e.currentTarget).text("断开")
                        }
                    }
                )
            }
        )
    }


    render(): JSX.Element {
        return (
            <div>
                <div className="title_timer"><h4 className={`section Scene`}>场景编程</h4><span id='timer'></span></div>
                <div className={`contentsAndInfos ${this.props.section.sid} container`}>
                    <div className="row">
                        <div className="contents col-5">
                            <div className="row">
                                <div className={`coding${this.props.section.sid} col-12`}>
                                    <ul className="list-group">
                                        {this.state.codingItems.length == 0 ? "" : this.codingItems}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={`codingInfos ${this.props.section.sid} col-7`} >
                            <CodingInfo programSingleFile={this.props.programSingleFile} codingInfos={this.codingInfos} openShell={this.props.openShell} openSrcFile={this.props.openSrcFile}
                                codeInfoType="scene" config={this.props.config} roles={this.role} sid={this.props.section.sid} say={this.props.say} currentFocusCodingIndex={this.currentFocusCodingIndex} issueStatusStrs={this.codingStatus} coding_titles={this.codingIssues}
                                postSrcFile={this.props.postSrcFile} addCodingSubmittedIssue={this.addSubmittedCodingIssue} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}