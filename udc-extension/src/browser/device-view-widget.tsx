import { injectable, inject } from "inversify";
import { TreeWidget, TreeProps, TreeModel, ContextMenuRenderer, CompositeTreeNode, SelectableTreeNode, TreeNode } from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { UdcService } from "../common/udc-service";
import { MessageService, CommandRegistry } from "@theia/core";
import { UdcCommands } from "./udc-extension-contribution";
import * as path from 'path'
import URI from "@theia/core/lib/common/uri";
import { EditorManager } from "@theia/editor/lib/browser";
import * as $ from "jquery"
import { find } from "@phosphor/algorithm";
// import {ButtonProps} from 'react-bootstrap/Button'
// import { Button } from "react-bootstrap";

export interface DeviceViewSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode {
    iconClass: string;
}

export namespace DeviceViewSymbolInformationNode {
    export function is(node: TreeNode): node is DeviceViewSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }
}



// let statusCode: { [key: number]: string } = {
//     0x0000: '未生成 ',
//     0x0001: '生成失败',
//     0x0010: '未提交 ',
//     0x0011: "正在判题",
//     0x0012: '烧写错误',
//     0x0020: '通过  ',
//     0x0021: '答案错误',
//     0x0022: '超时  '
// }
namespace OptionItem {
    export interface Props {
        akey: string
        titles: { [key: string]: string }
        choices: { [key: string]: string[] }
        optionStatus: { [key: string]: string }
        // addOptionStatus: (pid: string, selected: string) => void
        submitedOptionStatus: { [key: string]: string }
    }
}
class OptionItem extends React.Component<OptionItem.Props> {
    componentWillMount() {

    }
    componentDidMount() {

        $(document).ready(
            () => {
                $(".optionItem").click(
                    (e) => {
                        $(".codingInfos").hide()
                        $(".optionInfos").show()
                        let x = $(e.currentTarget).children("a").attr("id")
                        if (x != undefined) {
                            $(".optionIssueTitle").text(this.props.titles[x])
                            $("form.options").attr("id", x)
                            for (let index in this.props.choices[x]) {
                                let op = $(`.optionContent:eq(${index})`)
                                op.text(this.props.choices[x][index])
                            }
                            if (this.props.submitedOptionStatus[x] == undefined) {
                                $(".custom-control-label").prop("checked", false)
                            }
                            else {
                                $(`#optionRadio${this.props.submitedOptionStatus[x]}`).prop("checked", true)

                            }
                        }
                    }
                )

            }
        )
    }
    public render(): JSX.Element {
        return (
            <li className='optionItem list-group-item'>
                <span className="oi oi-pencil" aria-hidden="true"></span>
                <a id={this.props.akey} >选择题{this.props.akey}</a>&nbsp;
                <span className="oi" aria-hidden="true" style={{display:"none"}}></span>
                {/* <a className="issue_status">●</a><br /> */}
            </li>

        )
    }
}
namespace VideoItem {
    export interface Props {
        title: string
        videoNames: string[]
        uris: string[]
        gotoVideo: (uri: string, videoName: string) => void
    }
}
class VideoItem extends React.Component<VideoItem.Props>{
    componentDidMount() {

    }
    render(): JSX.Element {
        return (
            <li className='videoItem list-group-item'>
                <span className="oi oi-video" aria-hidden="true"></span>
                <a className="videoName" title={this.props.title}>{this.props.videoNames[parseInt(this.props.title)]}</a>
            </li>
        )

    }
}
export namespace CodeItem {
    export interface Props {
        akey: string,
        codingTitles: { [key: string]: string }
        codingInfos: { [key: string]: string }
        codingStatus: { [key: string]: string }
        openSrcFile: (uri: URI) => void
    }
}

class CodeItem extends React.Component<CodeItem.Props>{

    rootDir: string = "/home/project"
    componentDidMount() {
        for (let index in this.props.codingStatus) {
            $(".codeItem").children(`#${index}`).css("color", "red")
        }
        $(document).ready(
            (e) => {
                $(".codeItem").click(
                    (e) => {
                        let tmp = $(e.currentTarget).children("a").attr("title")
                        if (tmp != undefined) {
                            // console.log('tmp' + tmp)
                            // console.log("this.props.codingTitles[tmp]" + this.props.codingTitles[tmp])
                            // console.log("this.props.codinginfos[tmp]" + this.props.codingInfos[tmp])
                            // console.log("<<<<<<<<<<<<<<<<" + path.join(this.rootDir, `${this.props.codingTitles[tmp]}.cpp`))

                            this.props.openSrcFile(new URI(path.join(`file://${this.rootDir}`, `${this.props.codingTitles[tmp]}.cpp`)))
                            $(".optionInfos").hide()
                            $(".codingInfos").show()
                            $("#coding_title").html(this.props.codingTitles[tmp])
                            //$("#codingInfoArea").val(this.props.codingInfos[tmp])
                            $("#codingInfoArea").text(this.props.codingInfos[tmp])
                            $("#codingInfoArea").attr("title", tmp)
                        }
                    }
                )
            }
        )
    }
    public render(): JSX.Element {
        return (
            <li className="codeItem list-group-item" >
                <span className="oi oi-terminal" aria-hidden="true"></span>
                <a title={this.props.akey}>{this.props.codingTitles[this.props.akey]}</a>&nbsp;
                <span className="oi" aria-hidden="true" style={{display:"none"}}></span>
                {/* <a className="issue_status">●</a><br /> */}
            </li>
        )
    }
}
namespace OptionInfo {
    export interface Props {
        answers: { [key: string]: string }
        addOptionStatus: (pid: string, selected: string) => void
        submitedOptionStatus: { [key: string]: string }
        say: (thing: string) => void
    }
}
class OptionInfo extends React.Component<OptionInfo.Props>{
    componentDidMount() {
        $(document).ready(
            () => {
                $(".optionInfoSubmit").click(
                    (e) => {
                        e.preventDefault()
                        let idv = $(".options").attr("id")
                        let checked = $("input:radio:checked").val()
                        if (idv != undefined && this.props.submitedOptionStatus[idv] != undefined && this.props.submitedOptionStatus[idv] != checked) {
                            this.props.say("题目已提交,勿重复操作")
                            return
                        }
                        idv != undefined && checked != undefined && (this.props.addOptionStatus(idv, checked.toString()))
                        // idv != undefined && alert($("input:radio:checked").val() + "right" + this.props.answers[idv])

                        if (idv != undefined && $("input:radio:checked").val() == this.props.answers[idv]) {
                            //$(`.optionItem a[id=${idv}]`).next().css("color", "green")
                            //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-success")
                            let sp = $(`.optionItem a[id=${idv}]`).next()
                            sp.attr("class", "oi oi-check")
                            sp.show()

                        }
                        else {
                            //$(`.optionItem a[id=${idv}]`).next().css("color", "red")
                            //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-danger")
                            let sp = $(`.optionItem a[id=${idv}]`).next()
                            sp.attr("class", "oi oi-x")
                            sp.show()
                        }
                    }
                )
            }
        )
    }
    public render() {
        return (
            <div className="optionInfoContainer card text-white bg-secondary">
                <div className="card-body">
                    <p className="optionIssueTitle">
                        请选出以下正确的答案()
                    </p>
                    <form className="options" id="1" >
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id="optionRadio1" type="radio" name="1" value="1" />
                            <label className="custom-control-label" htmlFor="optionRadio1">
                                A. <span className="optionContent"></span><br />
                            </label>
                        </div>
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id="optionRadio2" type="radio" name="1" value="2" />
                            <label className="custom-control-label" htmlFor="optionRadio2">
                                B. <span className="optionContent"></span><br />
                            </label>
                        </div>
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id="optionRadio3" type="radio" name="1" value="3" />
                            <label className="custom-control-label" htmlFor="optionRadio3">
                                C. <span className="optionContent"></span><br />
                            </label>
                        </div>
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id="optionRadio4" type="radio" name="1" value="4" />
                            <label className="custom-control-label" htmlFor="optionRadio4">
                                D. <span className="optionContent"></span><br />
                            </label>
                        </div>
                        {/* <input type="radio" name="1" value="2" />B:<span className="optionContent"></span><br />
                        <input type="radio" name="1" value="3" />C:<span className="optionContent"></span><br />
                        <input type="radio" name="1" value="4" />D:<span className="optionContent"></span><br /> */}
                        <hr />
                        <button className="optionInfoSubmit btn btn-primary" type="button">提交</button>
                    </form>
                </div>
            </div >
        )
    }
}
namespace CodingInfo {
    export interface Props {
        currentFocusCodingIndex: string[]
        issueStatusStrs: { [key: string]: string }
        coding_titles: { [key: string]: string },
        postSrcFile: (fn: string) => void
        addCodingSubmitedIssue: (index: string) => void
        say: (verbose: string) => void
    }
}
class CodingInfo extends React.Component<CodingInfo.Props>{
    componentDidMount() {
        $(document).ready(
            () => {
                let _this = this
                $("#submitSrcButton").click(
                    () => {

                        let index = $("#codingInfoArea").attr("title")
                        if (_this.props.currentFocusCodingIndex[0] != index) {
                            _this.props.say("所连设备与当前题目所需不一致,请重新连接设备")
                            return
                        }
                        index != undefined && this.props.postSrcFile(this.props.coding_titles[index])
                        index != undefined && this.props.addCodingSubmitedIssue(index)
                    }
                )
            }
        )
    }
    public render() {
        return (
            <div className="card text-white bg-secondary">
                <div className="codingInfoContainer card-body">
                    <h5 id="titleAndStatus" className="card-title">
                        <span id="coding_title">关于mqtt的一道题</span>
                    </h5>
                    <div id="codingInfoAreaContainer">
                        {/* <textarea title="1" id="codingInfoArea" disabled={true} defaultValue="你需要使用mqtt来实现这一道题目"></textarea> */}
                        <p className="card-text" id="codingInfoArea" title="1">你需要使用mqtt来实现这一道题目</p>
                    </div>
                    <div><button className="btn btn-info" id="connectButton">需要连接设备?</button></div>
                    <br />
                    <div><button className="btn btn-primary" id="submitSrcButton">提交</button></div>
                </div>
            </div>
        )
    }
}
namespace NewIssueUi {
    export interface Props {
        connect: (pid: string) => void
        disconnect: () => void
        callUpdata: () => void
        openSrcFile: (uri: URI) => void
        postSrcFile: (fn: string) => void
        creatSrcFile: (fns: string[]) => void
        setCookie: (cookie: string) => void
        gotoVideo: (uri: string, videoName: string) => void
        say: (verbose: string) => void
        outputResult: (res: string) => void
    }
}

export class NewIssueUi extends React.Component<NewIssueUi.Props>{
    currentFocusCodingIndex: string[] = ['00000']
    optionIssues: { [key: string]: string } = {}
    optionStatus: { [key: string]: string } = {}
    choices: { [key: string]: string[] } = {}
    answers: { [key: string]: string } = {}
    codingIssues: { [key: string]: string } = {}
    codingInfos: { [key: string]: string } = {}
    codingStatus: { [key: string]: string } = {}
    judgeStatus: string[] = []
    submitedCodingIssue: string[] = []
    submitedOptionIssue: { [key: string]: string } = {}
    statusCode: { [key: number]: string } = {
        0x0000: 'NO_GEN',
        0x0001: 'GEN_FAIL',
        0x0010: 'NO_SUB',
        0x0011: "JUDGING",
        0x0012: 'PROG_ERR',
        0x0020: 'ACCEPT',
        0x0021: 'WRONG_ANSWER',
        0x0022: 'TIMEOUT'
    }
    statusColors: { [key: number]: string } = {
        0x0000: 'white',
        0x0001: 'black',
        0x0010: 'white',
        0x0011: "yellow",
        0x0012: 'black',
        0x0020: 'green',
        0x0021: 'red',
        0x0022: 'grey'
    }
    videoNames: string[] = ["教学-串口打印", "教学-MQTT基础"]
    uris: string[] = [`http://linklab.tinylink.cn/video1.mp4`, `http://linklab.tinylink.cn/video2.mp4`]
    pids: string[] = []
    addOptionStatus = (pid: string, selected: string) => {
        this.submitedOptionIssue[pid] = selected
    }
    addSubmitedCodingIssue = (issueIndex: string) => {
        this.submitedCodingIssue.push(issueIndex)
    }
    componentWillMount() {
        let tmp = { "qzid": "1" }
        let _this = this
        $.ajax(
            {
                headers: {
                    "accept": "application/json",
                },
                xhrFields: {
                    withCredentials: true
                },
                method: "POST",
                url: "http://judge.tinylink.cn/quiz/content",
                dataType: 'json',
                contentType: "text/plain",
                data: JSON.stringify(tmp),
                success: function (data) {
                    let x = data.question.slice(0, 3);

                    for (let item of x) {
                        _this.optionIssues[item.order] = item.description
                        _this.answers[item.order] = item.answer
                        _this.choices[item.order] = item.choices.split("\n")
                    }
                }
            }
        )
        // let form = {
        //     username: "emmtest",
        //     password: "123456"
        // }
        // $.ajax(
        //     {
        //         headers: {
        //             "accept": "application/json",
        //         },
        //         crossDomain: true,
        //         xhrFields: {
        //             withCredentials: true
        //         },
        //         method: "POST",
        //         type: 'POST',
        //         url: "http://api.tinylink.cn/user/login",
        //         dataType: 'json',
        //         data: form,
        //         success:
        //             function (data) {
        //                 // alert(JSON.stringify(data))
        //                 console.log(JSON.stringify(data))
        $.ajax(
            {
                headers: {
                    "accept": "application/json",
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                method: "POST",
                url: "http://api.tinylink.cn/problem/query",

                dataType: 'json',
                contentType: "text/plain",
                data: "", // serializes the form's elements.
                success: function (data) {
                    // alert(JSON.stringify(data))
                    let x = data.data; // show response from the php script.
                    let fns = []
                    for (let item of x) {
                        _this.codingIssues[item.pid] = item.title
                        fns.push(item.title)
                        _this.codingInfos[item.pid] = item.content
                        _this.pids.push(item.pid)
                    }
                    _this.props.creatSrcFile(fns)
                    _this.props.callUpdata()

                }
            }
        )
        $.ajax(
            {
                headers: {
                    "accept": "application/json",
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                method: "GET",
                url: "http://api.tinylink.cn/user/info",
                // processData: false,
                dataType: 'json',
                contentType: "text/plain",
                data: "", // serializes the form's elements.
                success: function (data) {
                    $(".userName").text(data.data.uname)
                    //alert(data.data.JSESSIONID)
                    _this.props.setCookie(data.data.JSESSIONID)
                }
            }
        )
        _this.props.callUpdata()
    }
    //         }
    //     )
    // }
    componentDidMount() {
        let _this = this
        setInterval(() => {
            // alert(document.cookie)
            // _this.props.setCookie(document.cookie)
            $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "POST",
                    url: "http://judge.tinylink.cn/problem/status",
                    dataType: 'json',
                    // contentType: "text/plain",
                    data: JSON.stringify({ pid: _this.pids }),
                    success: function (data) {
                        // alert(JSON.stringify(data))
                        let tmp = data.problem
                        for (let x of tmp) {
                            _this.codingStatus[x.pid] = x.status
                            if (find(_this.submitedCodingIssue, (value, index) => x.pid == value) == undefined) {

                                continue
                            }
                            // alert( _this.codingStatus[x.pid])
                            // $(`.codeItem a[title=${x.pid}]`).next().css("color","red")
                            //$(`.codeItem a[title=${x.pid}]`).next().css("color", _this.statusColors[parseInt(x.status)])
                            let status = _this.statusCode[parseInt(x.status)];
                            if (status == 'JUDGING') {
                                //$(`.codeItem a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-warning");
                                let sp = $(`.codeItem a[title=${x.pid}]`).next()
                                sp.attr("class", "oi oi-ellipses")
                                sp.show()
                                _this.judgeStatus[x.pid] = '1'
                            } else if (status == 'ACCEPT') {
                                //$(`.codeItem a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-success");
                                $(`.codeItem a[title=${x.pid}]`).next().attr("class", "oi oi-check")
                                if (_this.judgeStatus[x.pid] == '1') {
                                    _this.props.outputResult("::ACCEPT")
                                    _this.submitedCodingIssue.splice(_this.submitedCodingIssue.indexOf(x.pid))
                                    _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid))
                                }
                            } else if (status == 'WRONG_ANSWER') {
                                //$(`.codeItem a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-danger");
                                $(`.codeItem a[title=${x.pid}]`).next().attr("class", "oi oi-x")
                                // alert(_this.judgeStatus[x.pid])
                                if (_this.judgeStatus[x.pid] == '1') {
                                    
                                    _this.props.outputResult("::WRONG_ANSWER")
                                    _this.submitedCodingIssue.splice(_this.submitedCodingIssue.indexOf(x.pid))
                                    _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid))
                                }
                            } else if (status == 'TIMEOUT') {
                                //$(`.codeItem a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-info");
                                $(`.codeItem a[title=${x.pid}]`).next().attr("class", "oi oi-clock")
                            } else {
                                //$(`.codeItem a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-dark");
                                $(`.codeItem a[title=${x.pid}]`).next().attr("class", "oi oi-question-mark")
                            }
                        }

                    }
                }
            )

        }, 2000)

        $(document).ready(
            () => {
                let _this = this
                $("#connectButton").click(
                    (e) => {
                        if ($(e.currentTarget).text() == "断开") {
                            this.props.disconnect()
                            $(e.currentTarget).text("连接")
                        }
                        else {
                            let val = $("#codingInfoArea").attr("title")
                            // alert(val)
                            val != undefined && (_this.currentFocusCodingIndex[0] = val)
                            console.log("<<<<<<<<<set current coding index:" + _this.currentFocusCodingIndex[0])
                            val != undefined && this.props.connect(val)
                            $(e.currentTarget).text("断开")
                        }
                    }
                )
                $(".welcomeBanner").click(
                    () => $(".welcomeBanner").fadeOut("slow")
                )
                $(".unfoldOptionSwitch").click(
                    (e) => {
                        if ($("span.unfoldOptionItems").text() == "-") {
                            $(".option_items").hide()
                            $("span.unfoldOptionItems").text("+")
                        }
                        else {
                            $(".option_items").show()
                            $("span.unfoldOptionItems").text("-")
                        }
                    }
                )
                $(".unfoldCodingSwitch").click(
                    (e) => {
                        if ($("span.unfoldCodingItems").text() == "-") {
                            $(".coding_items").hide()
                            $("span.unfoldCodingItems").text("+")
                        }
                        else {
                            $(".coding_items").show()
                            $("span.unfoldCodingItems").text("-")
                        }
                    }
                )
                $(".unfoldVideoSwitch").click(
                    (e) => {
                        if ($("span.unfoldVideoItems").text() == "-") {
                            $(".video_items").hide()
                            $("span.unfoldVideoItems").text("+")
                        }
                        else {
                            $(".video_items").show()
                            $("span.unfoldVideoItems").text("-")
                        }
                    }
                )

            }
        )
        $(document).ready(
            () => {
                $(".videoItem").map((_this, ht) => {
                    $(ht).click((e) => {
                        let index = $(e.currentTarget).children('.videoName').attr("title")
                        index != undefined && this.props.gotoVideo(this.uris[parseInt(index)], this.videoNames[parseInt(index)])
                    })
                })

                $(".list-group-item").map((_this, ht) => {
                    $(ht).click((e) => {
                        $(".list-group-item").each((i, _this)=>{
                            $(_this).removeClass("list-group-item-primary")
                        })
                        $(e.currentTarget).addClass("list-group-item-primary")
                    })
                })
            }
        )
    }
    render(): JSX.Element {
        let optionItems = []
        let codingItems = []
        for (let index in this.optionIssues)
            optionItems.push(<OptionItem akey={index} key={index} choices={this.choices}
                optionStatus={this.optionStatus} titles={this.optionIssues} submitedOptionStatus={this.submitedOptionIssue} />)
        for (let entry in this.codingIssues)
            codingItems.push(<CodeItem akey={entry} key={entry}
                codingInfos={this.codingInfos} codingTitles={this.codingIssues}
                codingStatus={this.codingStatus} openSrcFile={this.props.openSrcFile} />)

        return (
            <div className="contentsAndInfos container">
                <div className="row"><div className="welcomeBanner col"><h5><span className="userName"></span>,欢迎你<br /></h5></div></div>
                <hr />
                <div className="row">
                    <div className="contents col-5">
                        <div className="row">
                            <div className="coding col-12">
                                {/* <h5 className="unfoldVideoSwitch"><span className="unfoldVideoItems">+</span> 第一章节</h5> */}
                                <ul className="video_items list-group">
                                    <VideoItem title='0' videoNames={this.videoNames} uris={this.uris} gotoVideo={this.props.gotoVideo}></VideoItem>
                                    <VideoItem title='1' videoNames={this.videoNames} uris={this.uris} gotoVideo={this.props.gotoVideo}></VideoItem>
                                </ul>
                            </div>
                        </div>
                        <div className="row">
                            <div className="option col-12">
                                {/* <h5 className="unfoldOptionSwitch"><span className="unfoldOptionItems">+</span>第一章节</h5> */}
                                <ul className="option_items list-group">{optionItems}</ul>
                            </div>
                        </div>
                        {/* <hr /> */}
                        <div className="row">
                            <div className="coding col-12">
                                {/* <h5 className="unfoldCodingSwitch"><span className="unfoldCodingItems">+</span> 编程题</h5> */}
                                <ul className="coding_items list-group">{codingItems}</ul>
                            </div>
                        </div>
                        <hr />

                    </div>
                    <div className="codingInfos col-7" >
                        <CodingInfo say={this.props.say} currentFocusCodingIndex={this.currentFocusCodingIndex} issueStatusStrs={this.codingStatus} coding_titles={this.codingIssues}
                            postSrcFile={this.props.postSrcFile} addCodingSubmitedIssue={this.addSubmitedCodingIssue} />
                    </div>
                    <div className="optionInfos col-7" >
                        <OptionInfo say={this.props.say} addOptionStatus={this.addOptionStatus} answers={this.answers} submitedOptionStatus={this.submitedOptionIssue} />
                    </div>
                </div>

            </div>
        );
    }
}
export type DeviceViewWidgetFactory = () => DeviceViewWidget;
export const DeviceViewWidgetFactory = Symbol('DeviceViewWidgetFactory')
@injectable()
export class DeviceViewWidget extends TreeWidget {
    readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    device_list?: { [key: string]: number }
    constructor(
        @inject(TreeProps) protected readonly treePros: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(UdcService) protected readonly udcService: UdcService,
        @inject(MessageService) protected readonly messageService: MessageService,
        @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry,
        @inject(EditorManager) protected em: EditorManager
    ) {
        super(treePros, model, contextMenuRenderer);
        this.id = 'device-view';
        // this.title.label = "题目目录";
        this.title.caption = "Device";
        this.title.closable = true;
        this.title.iconClass = 'fa outline-view-tab-icon';
        this.addClass('theia-udcdevice-view');
    }
    rootdir: string = "/home/project"

    protected renderTree(): React.ReactNode {
        return (
            <NewIssueUi
                outputResult={this.outputResult}
                say={this.say}
                gotoVideo={this.gotoVideo}
                setCookie={this.setCookie}
                disconnect={this.disconnect} connect={this.connect}
                callUpdata={this.callUpdata}
                creatSrcFile={this.createSrcFile}
                openSrcFile={this.openSrcFile}
                postSrcFile={this.postSrcFile} />
        )
    }
    outputResult = (res: string) => {
        this.udcService.outputResult(res)
    }
    say = (verbose: string) => {
        this.messageService.info(verbose)
    }
    connect = (pid: string) => {
        this.commandRegistry.executeCommand(UdcCommands.Connect.id, pid);
    }
    disconnect = () => {
        this.commandRegistry.executeCommand(UdcCommands.DisConnect.id)
    }
    callUpdata = () => {
        this.update()
    }
    setCookie = (cookie: string) => {
        this.udcService.setCookie(`JSESSIONID=${cookie}; Path=/; HttpOnly`);
        // this.udcService.setCookie(cookie);
    }
    postSrcFile = (fn: string) => {
        this.udcService.postSrcFile(fn)
    }
    openSrcFile = (uri: URI) => {
        this.commandRegistry.executeCommand(UdcCommands.OpenCommand.id, uri)
    }
    createSrcFile = (fn: string[]) => {
        this.udcService.createSrcFile(JSON.stringify(fn))

    }
    gotoVideo = (uri: string, videoName: string) => {
        this.commandRegistry.executeCommand(UdcCommands.openViewPanel.id, uri, videoName)
    }
}