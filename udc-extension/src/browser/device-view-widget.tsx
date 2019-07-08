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
                        }
                    }
                )

            }
        )
    }
    public render(): JSX.Element {
        return (
            <div className='optionItem'>
                <a id={this.props.akey} >-题{this.props.akey}</a><a className="issue_status">●</a><br />
            </div>

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
                            $("#codingInfoArea").val(this.props.codingInfos[tmp])
                            $("#codingInfoArea").attr("title", tmp)
                        }
                    }
                )
            }
        )
    }
    public render(): JSX.Element {
        return (
            <div className="codeItem" >
                <a title={this.props.akey}>-题{this.props.akey}</a><a className="issue_status">●</a><br />
            </div>
        )
    }
}
namespace OptionInfo {
    export interface Props {
        answers: { [key: string]: string }
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
                        // idv != undefined && alert($("input:radio:checked").val() + "right" + this.props.answers[idv])
                        if (idv != undefined && $("input:radio:checked").val() == this.props.answers[idv]) {
                            $(`.optionItem a[id=${idv}]`).next().css("color", "green")
                        }
                        else {
                            $(`.optionItem a[id=${idv}]`).next().css("color", "red")
                        }
                    }
                )
            }
        )
    }
    public render() {
        return (
            <div className="optionInfoContainer">
                <p className="optionIssueTitle">
                    请选出以下正确的答案()
                </p>
                <form className="options" id="1" >
                    <input type="radio" name="1" value="1" />A:<span className="optionContent"></span><br />
                    <input type="radio" name="1" value="2" />B:<span className="optionContent"></span><br />
                    <input type="radio" name="1" value="3" />C:<span className="optionContent"></span><br />
                    <input type="radio" name="1" value="4" />D:<span className="optionContent"></span><br />
                    <button className="optionInfoSubmit" type="button">提交</button>
                </form>
            </div >
        )
    }
}
namespace CodingInfo {
    export interface Props {
        issueStatusStrs: { [key: string]: string }
        coding_titles: { [key: string]: string },
        postSrcFile: (fn: string) => void
    }
}
class CodingInfo extends React.Component<CodingInfo.Props>{
    componentDidMount() {
        $(document).ready(
            () => {
                $("#submitSrcButton").click(
                    () => {
                        let index = $("#codingInfoArea").attr("title")
                        index != undefined && this.props.postSrcFile(this.props.coding_titles[index])
                    }
                )
            }
        )
    }
    public render() {
        return (
            <div>
                <div className="codingInfoContainer">
                    <div id="titleAndStatus" >
                        <span id="coding_title">关于mqtt的一道题</span><a id="issue_status">●</a>
                    </div>
                    <div id="codingInfoAreaContainer">
                        <textarea title="1" id="codingInfoArea" disabled={true} defaultValue="你需要使用mqtt来实现这一道题目"></textarea>
                    </div>
                    <div><button id="connectButton">需要连接设备?</button></div>
                    <div><button id="submitSrcButton">提交</button></div>
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
    }
}

export class NewIssueUi extends React.Component<NewIssueUi.Props>{

    optionIssues: { [key: string]: string } = {}
    optionStatus: { [key: string]: string } = {}
    choices: { [key: string]: string[] } = {}
    answers: { [key: string]: string } = {}
    codingIssues: { [key: string]: string } = {}
    codingInfos: { [key: string]: string } = {}
    codingStatus: { [key: string]: string } = {}
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
    pids: string[] = []
    componentWillMount() {
        let tmp = { "qzid": "1" }
        let _this = this
        let form = {
            username: "emmtest",
            password: "123456"
        }
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
                    let x = data.question;

                    for (let item of x) {
                        _this.optionIssues[item.order] = item.description
                        _this.answers[item.order] = item.answer
                        _this.choices[item.order] = item.choices.split("\n")
                    }
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
                method: "POST",
                type: 'POST',
                url: "http://api.tinylink.cn/user/login",
                dataType: 'json',
                data: form,
                success: function (data) {
                    // alert(JSON.stringify(data))
                    console.log(JSON.stringify(data))
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
                                alert(data.data.JSESSIONID)
                                _this.props.setCookie(data.data.JSESSIONID)
                            }
                        }
                    )
                    _this.props.callUpdata()
                }
            }
        )
    }
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
                            // alert( _this.codingStatus[x.pid])
                            // $(`.codeItem a[title=${x.pid}]`).next().css("color","red")
                            $(`.codeItem a[title=${x.pid}]`).next().css("color", _this.statusColors[parseInt(x.status)])
                            // console.log(">>>>>>>>>>")
                            // console.log(JSON.stringify($(`.codeItem a[title=${x.pid}]`)))

                        }
                    }
                }
            )

        }, 5000)
        $(document).ready(
            () => {
                $("#connectButton").click(
                    (e) => {
                        if ($(e.currentTarget).text() == "断开") {
                            this.props.disconnect()
                            $(e.currentTarget).text("连接")
                        }
                        else {
                            let val = $("#codingInfoArea").attr("title")
                            // alert(val)
                            val != undefined && this.props.connect(val)
                            $(e.currentTarget).text("断开")
                        }
                    }
                )
                $(".welcomeBanner").click(
                    () => $(".welcomeBanner").fadeOut("slow")
                )
                $(".unfoldOptionItems").click(
                    (e) => {
                        if ($(e.currentTarget).text() == "-") {
                            $(".option_items").hide()
                            $(e.currentTarget).text("+")
                        }
                        else {
                            $(".option_items").show()
                            $(e.currentTarget).text("-")
                        }
                    }
                )
                $(".unfoldCodingItems").click(
                    (e) => {
                        if ($(e.currentTarget).text() == "-") {
                            $(".coding_items").hide()
                            $(e.currentTarget).text("+")
                        }
                        else {
                            $(".coding_items").show()
                            $(e.currentTarget).text("-")
                        }
                    }
                )

            }
        )
    }
    render(): JSX.Element {
        let optionItems = []
        let codingItems = []
        for (let index in this.optionIssues)
            optionItems.push(<OptionItem akey={index} key={index} choices={this.choices}
                optionStatus={this.optionStatus} titles={this.optionIssues} />)
        for (let entry in this.codingIssues)
            codingItems.push(<CodeItem akey={entry} key={entry}
                codingInfos={this.codingInfos} codingTitles={this.codingIssues}
                codingStatus={this.codingStatus} openSrcFile={this.props.openSrcFile} />)

        return (
            <div className="contentsAndInfos">
                <div className="welcomeBanner"><span className="userName"></span>,欢迎你</div>
                <div className="contents">
                    <div className="option">
                        <h3><span className="unfoldOptionItems">+</span> 选择题</h3>
                        <div className="option_items">{optionItems}</div>
                    </div>
                    <div className="coding">
                        <h3><span className="unfoldCodingItems">+</span> 编程题</h3>
                        <div className="coding_items">{codingItems}</div>
                    </div>
                </div>
                <div className="codingInfos" >
                    <CodingInfo issueStatusStrs={this.codingStatus} coding_titles={this.codingIssues}
                        postSrcFile={this.props.postSrcFile} />
                </div>
                <div className="optionInfos" >
                    <OptionInfo answers={this.answers} />
                </div>
                <div></div>
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
                setCookie={this.setCookie}
                disconnect={this.disconnect} connect={this.connect}
                callUpdata={this.callUpdata}
                creatSrcFile={this.createSrcFile}
                openSrcFile={this.openSrcFile}
                postSrcFile={this.postSrcFile} />
        )
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
}