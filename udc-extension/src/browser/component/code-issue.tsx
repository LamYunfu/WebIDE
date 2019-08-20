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
        codingTitles: { [key: string]: string }
        codingInfos: { [key: string]: string }
        codingStatus: { [key: string]: string }
        openSrcFile: (uri: URI) => void
        openShell: () => void
    }
}



export class CodeItem extends React.Component<CodeItem.Props>{
    rootDir: string = "/home/project"


    componentDidMount() {
        let _this = this
        for (let index in _this.props.codingStatus) {
            $(".codeItem").children(`#${index}`).css("color", "red")
        }
        $(document).ready(
            (e) => {
                $(".codeItem" + _this.props.sid).click(
                    (e) => {
                        _this.props.openShell()
                        let tmp = $(e.currentTarget).children("a").attr("title")
                        if (tmp != undefined) {
                            if (_this.props.role == undefined)
                                _this.props.openSrcFile(new URI(path.join(`file://${this.rootDir}/${_this.props.codingTitles[tmp]}`, `helloworld.cpp`)))
                            else {
                                for (let mem of _this.props.role) {
                                    _this.props.openSrcFile(new URI(path.join(`file://${this.rootDir}/${_this.props.codingTitles[tmp]}`, `${"helloworld" +"_"+ mem}.cpp`)))
                                }
                            }
                            $(".optionInfos." + _this.props.sid).hide()
                            $(".codingInfos." + _this.props.sid).show()
                            $("#coding_title" + _this.props.sid).html(_this.props.codingTitles[tmp])
                            //$("#codingInfoArea").val(_this.props.codingInfos[tmp])
                            $("#codingInfoArea" + _this.props.sid).text(_this.props.codingInfos[tmp])
                            $("#codingInfoArea" + _this.props.sid).attr("title", tmp)
                        }
                    }
                )
            }
        )
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
    }
}


export class CodingInfo extends React.Component<CodingInfo.Props>{
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

            }
        )
    }


    public render() {
        return (
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
                        <button className="btn btn-primary" id={"submitSrcButton" + this.props.sid}>提交</button></div>
                </div>
            </div>
        )
    }
}