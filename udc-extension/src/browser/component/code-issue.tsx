import React = require("react");
import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import * as path from 'path'


export namespace CodeItem {


    export interface Props {
        sid: string
        akey: string,
        loginType: string
        model: string
        role: string[]
        codingStatus: { [key: string]: string }
        codingTitles: { [key: string]: string },

    }
}



export class CodeItem extends React.Component<CodeItem.Props>{



    componentDidMount() {
        let _this = this
        for (let index in _this.props.codingStatus) {
            $(".codeItem").children(`#${index}`).css("color", "red")
        }

    }


    public render(): JSX.Element {
        return (
            <li className={`codeItem${this.props.sid} list-group-item`} >
                <span className="oi oi-terminal" aria-hidden="true"></span>
                <a title={this.props.akey}>{this.props.codingTitles[this.props.akey]}</a>&nbsp;
                <span className="oi" aria-hidden="true" style={{ display: "none", float: "right" }}></span>
                {/* <a className="issue_status">●</a><br /> */}
            </li>
        )
    }
}
export namespace CodingInfo {


    export interface Props {
        sid: string
        roles: { [key: string]: string[] }
        currentFocusCodingIndex: string[]
        issueStatusStrs: { [key: string]: string }
        coding_titles: { [key: string]: string },
        postSrcFile: (fn: string) => void
        addCodingSubmittedIssue: (index: string) => void
        say: (verbose: string) => void
        config: () => void
        codeInfoType: string
        codingInfos: { [key: string]: string }
        openSrcFile: (uri: URI) => void
        openShell: () => void
        programSingleFile: (pidAndFn: string) => void
    }
    export interface States {
        pid: string
        singleFileButtons: JSX.Element[]
        currentFile: string
    }
}


export class CodingInfo extends React.Component<CodingInfo.Props, CodingInfo.States>{
    rootDir: string = "/home/project"
    focusFile: string = ""
    constructor(props: Readonly<CodingInfo.Props>) {
        super(props)
        this.state = {
            pid: "",
            singleFileButtons: [],
            currentFile: ""
        }
    }
    componentDidMount() {
        let _this = this
        $(document).ready(

            () => {
                $("#submitSrcButton" + _this.props.sid).click(
                    () => {
                        let index = $("#codingInfoArea" + this.props.sid).attr("title")
                        if (_this.props.currentFocusCodingIndex[0] != index) {
                            _this.props.say("所连设备与当前题目所需不一致,请重新连接设备")
                            return
                        }
                        index != undefined && _this.props.postSrcFile(index)
                        index != undefined && _this.props.addCodingSubmittedIssue(index)
                    }
                )
                $(document).on("click", `.codeItem${_this.props.sid}`,
                    (e) => {
                        // alert("click codeItem")
                        _this.props.openShell()
                        let tmp = $(e.currentTarget).children("a").attr("title")

                        if (tmp != undefined) {
                            _this.setState({
                                pid: tmp
                            })
                            if (_this.props.roles[_this.state.pid] != undefined) {
                                let singleFileButtons = []
                                for (let item of _this.props.roles[_this.state.pid]) {
                                    singleFileButtons.push(<span><button className={`singleFile btn btn-primary col-auto`} id={`${item} `}>{item}
                                    </button></span>)
                                }
                                _this.setState({
                                    singleFileButtons: singleFileButtons
                                })
                            }
                            if (_this.props.roles[tmp] == undefined) {
                                if (_this.props.coding_titles[tmp].split("AliOS").length > 1 || _this.props.coding_titles[tmp].split("阿里云").length > 1)
                                    _this.props.openSrcFile(new URI(path.join(`file://${this.rootDir}/${_this.props.coding_titles[tmp]}`, `helloworld.c`)))
                                else
                                    _this.props.openSrcFile(new URI(path.join(`file://${this.rootDir}/${_this.props.coding_titles[tmp]}`, `helloworld.cpp`)))
                            }
                            else {
                                for (let mem of _this.props.roles[tmp]) {
                                    _this.props.openSrcFile(new URI(path.join(`file://${this.rootDir}/${_this.props.coding_titles[tmp]}`, `${"helloworld" + "_" + mem}.cpp`)))
                                }
                            }
                            $(".optionInfos." + _this.props.sid).hide()
                            $(".codingInfos." + _this.props.sid).show()
                            $("#coding_title" + _this.props.sid).html(_this.props.coding_titles[tmp])
                            //$("#codingInfoArea").val(_this.props.codingInfos[tmp])
                            $("#codingInfoArea" + _this.props.sid).text(_this.props.codingInfos[tmp])
                            $("#codingInfoArea" + _this.props.sid).attr("title", tmp)
                        }
                    }
                )
                $(document).on("click", ".singleFile", (e) => {
                    let fileName = $(e.currentTarget).attr("id")
                    // alert("filename:" + fileName)
                    if (fileName == undefined) {
                        alert("there is no this role!")
                        return
                    }
                    else {
                        _this.focusFile = fileName.split(".")[0]
                        _this.setState({
                            currentFile: _this.focusFile
                        })
                        _this.props.say(`设置当前配置对象为${_this.focusFile}`)
                        // alert("focusFile is ：" + _this.focusFile)
                        $(`.codingRole${_this.props.sid}`).text(_this.focusFile)
                    }
                })
                $(document).on("click", `#singleFileSubmitButton` + _this.props.sid, (e) => {
                    // alert("singleFileProgram")
                    if (_this.focusFile == "") {
                        alert("请点击对应角色按钮、配置后再次烧入")
                        return
                    }
                    else {
                        let val = $("#codingInfoArea" + _this.props.sid).attr("title")
                        _this.props.say(`正在烧入对象：helloworld_${_this.state.currentFile.trim()}`)
                        // alert(`${val}&helloworld_${_this.state.currentFile}xyz`)
                        _this.props.programSingleFile(`${val}&helloworld_${_this.state.currentFile.trim()}`)

                    }
                })


            }
        )
    }


    public render() {

        return (
            this.props.codeInfoType == "coding" ?
                <div className={`codingInfos ${this.props.sid} card text-white bg-secondary`}>
                    <div className={` Container card-body`}>
                        <h5 id="titleAndStatus" className="card-title">
                            <span id={"coding_title" + this.props.sid}>关于mqtt的一道题</span>
                        </h5>
                        <div id="codingInfoAreaContainer">
                            {/* <textarea title="1" id="codingInfoArea" disabled={true} defaultValue="你需要使用mqtt来实现这一道题目"></textarea> */}
                            <pre className="card-text" id={"codingInfoArea" + this.props.sid} title="1">你需要使用mqtt来实现这一道题目</pre>
                        </div>
                        <span><button className="btn btn-info" id={"connectButton" + this.props.sid}>连接</button></span><span><button className="btn btn-info" id={"setQueue" + this.props.sid}>排队</button></span>
                        <br />
                        <div>
                            <span><button className="btn btn-primary" id={"configButton" + this.props.sid} onClick={this.props.config}>配置</button></span>
                            <span><button className="btn btn-primary" id={"submitSrcButton" + this.props.sid}>提交</button></span>
                        </div>
                    </div>
                </div>
                :
                <div className={`codingInfos ${this.props.sid} card text-white bg-secondary`}>
                    <span className={`codingRole${this.props.sid}`} style={{ display: 'none' }}></span>
                    <div className={` Container card-body`}>
                        <h5 id="titleAndStatus" className="card-title">
                            <span id={"coding_title" + this.props.sid}>关于场景编程的一道题</span>
                        </h5>
                        <div id="codingInfoAreaContainer">
                            {/* <textarea title="1" id="codingInfoArea" disabled={true} defaultValue="你需要使用mqtt来实现这一道题目"></textarea> */}
                            <pre className="card-text" id={"codingInfoArea" + this.props.sid} title="1">你需要使用mqtt来实现这一道题目</pre>

                        </div>
                        <div className="controlButtons col-12">
                            {this.state.singleFileButtons.length == 0 ? [] : this.state.singleFileButtons}

                            <br />
                            <div>
                                <span><button className="btn btn-info col-auto" id={"connectButtonSingleFile" + this.props.sid}>连接</button></span>
                                <span><button className="btn btn-primary col-auto" id={"configButton" + this.props.sid} onClick={this.props.config}>配置</button></span>
                                <span><button className="btn btn-primary col-auto" id={"singleFileSubmitButton" + this.props.sid}>烧入</button></span>
                            </div>
                        </div>
                    </div>
                </div>

        )
    }
}