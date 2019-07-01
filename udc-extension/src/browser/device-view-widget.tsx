import { injectable, inject } from "inversify";
import { TreeWidget, TreeProps, TreeModel, ContextMenuRenderer, CompositeTreeNode, SelectableTreeNode, TreeNode } from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { UdcService } from "../common/udc-service";
import { MessageService, CommandRegistry } from "@theia/core";
import { UdcCommands } from "./udc-extension-contribution";
import * as fs from 'fs'
import * as path from 'path'
import URI from "@theia/core/lib/common/uri";
import { EditorManager } from "@theia/editor/lib/browser";
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

export namespace DeviceItem {
    export interface Props {
        dev_str: string,
        model_type: string,
        model_id: string,
        using_or_not: number,
        hub_id: string,
        reset: () => void,
        program: () => void,
        openshell: () => void,
        start: () => void,
        stop: () => void
        judge: () => void
    }
}
export namespace IssueItem {
    export interface Props {
        issue_titles: { [key: string]: string }
        issueInfos: { [key: string]: string }
        issue_str: string
        issueStatusStrs: { [key: string]: string }
        issue_num: string,
        open: (e: any) => void
        set: (mode: string, str: string) => void
        setCurrentFocus: (issue_num: string) => void
        update: () => void
        postSrcFile: (fn: string) => void
        openSrcFile: (uri: URI) => void
    }
}
export class IssueItem extends React.Component<IssueItem.Props>{
    render(): JSX.Element {
        let statusCode: { [key: number]: string } = {
            0x0000: '未生成 ',
            0x0001: '生成失败',
            0x0010: '未提交 ',
            0x0011: "正在判题",
            0x0012: '烧写错误',
            0x0020: '通过  ',
            0x0021: '答案错误',
            0x0022: '超时  '
        }
        const { issue_num, issue_str } = this.props
        //加个括号的事,坑人啊
        return (
            <table className='issue-item-table'>
                <tbody>
                    <tr >
                        <td className='item-status' >
                            <button disabled={true} id={'Item' + issue_num} >{statusCode[parseInt(this.props.issueStatusStrs[issue_num])]}</button>
                        </td>
                        <td className="issue-shortcut">
                            <span className="issue-num">{issue_num}: </span >
                            <a onClick={(e) => { this.handClick(e) }} >{issue_str}</a>
                        </td>
                        <td className='judge'>
                            <button onClick={() => { this.handJudgeClick(issue_num) }} id={'judge' + issue_num}>提交</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
    handJudgeClick(n: string) {
        let statusShowing = document.getElementById("judge" + n)
        if (statusShowing != null) {
            this.props.setCurrentFocus(this.props.issue_num)
            if (statusShowing.innerHTML == '提交') {
                this.props.postSrcFile(this.props.issue_titles[n])
                statusShowing.innerHTML = "取消"
                statusShowing.setAttribute("disabled", "true")
                return setTimeout(() => {
                    console.log(statusShowing)
                    if (statusShowing != null) {
                        statusShowing.removeAttribute("disabled")
                        console.log("scc")
                    }

                }, 5000, statusShowing);
            }
            else {
                statusShowing.innerHTML = "提交"
            }
        }
    }
    handClick(e: any) {
        e.preventDefault();
        console.log("this.props.issueInfo[this.props.issue_num:" + this.props.issueInfos[this.props.issue_num])
        this.props.openSrcFile(new URI('file:///home/liang/theiaWorkSpace/'+this.props.issue_titles[this.props.issue_num]+ '.cpp'))
        this.props.setCurrentFocus(this.props.issue_num)
        this.props.set('spec', this.props.issueInfos[this.props.issue_num])
        this.props.update()
    }

}
export namespace IssueBlock {
    export interface Props {

        issueStatusStrs: { [key: string]: string }
        issueInfos: { [key: string]: string }
        issue_titles: { [key: string]: string },
        open: (x: any) => void,
        set: (mdoe: string, str: string) => void
        init: () => void
        setCurrentFocus: (issue_num: string) => void
        callUpdate: () => void
        postSrcFile: (fn: string) => void
        openSrcFile: (uri: URI) => void

    }
}
class IssueBlock extends React.Component<IssueBlock.Props>{
    render(): React.ReactNode {
        let IssueItemArray = [];
        const { issue_titles, issueInfos } = this.props
        for (let i in issue_titles) {
            // console.log(" " + i)
            IssueItemArray.push(
                <IssueItem
                    openSrcFile={this.props.openSrcFile}
                    issue_titles={this.props.issue_titles}
                    postSrcFile={this.props.postSrcFile}
                    update={this.props.callUpdate}
                    setCurrentFocus={this.props.setCurrentFocus}
                    issueStatusStrs={this.props.issueStatusStrs}
                    key={issue_titles[i]}
                    issue_num={i}
                    issue_str={issue_titles[i]}
                    open={this.props.open}
                    set={this.props.set}
                    issueInfos={issueInfos}
                />
            )
        }
        return (<div >
            {IssueItemArray}
        </div>
        )
    }

}
export class DeviceItem extends React.Component<DeviceItem.Props>{

    protected readonly reset = () => this.props.reset()
    protected readonly program = () => this.props.program()
    protected readonly openshell = () => this.props.openshell()
    protected readonly judge = () => this.props.judge()
    render() {
        const { dev_str, model_type, model_id, using_or_not, hub_id } = this.props
        const blockdisplay = {
            display: 'block'
        }
        return <div className={`deviceItem ${dev_str}`}>
            <div className='deviceBody'>
                <div className='avatar'><div className='avatarIcon'></div> </div>
                <div className='deviceInfo' style={blockdisplay}>
                    <span className='model_type' >model_type: {model_type}</span>
                    <span className='using_or_not'>status: {using_or_not}</span>
                    <span className='model_id'>model_id: {model_id}</span>
                    <span className='hub_id'>hub_id: {hub_id}</span>
                </div>
            </div>
            <div className='itemButtonsContainer'>
                {this.renderDeviceItemButtons()}
            </div>
        </div>
    }

    protected renderDeviceItemButtons(): React.ReactNode {
        return <div className='buttons'>
            <a className='toolbar-button' title='reset' onClick={() => this.reset()}>
                reset
            </a>
            <span> | </span>
            <a className='toolbar-button' title='program' onClick={() => this.program()}>
                program
            </a>
            <span> | </span>
            <a className='toolbar-button' title='shell' onClick={() => this.openshell()}>
                shell
                {/* <div className='p-TabBar-tabIcon theia-debug-console-icon' /> */}
            </a>
            <span> | </span>
            <a className='toolbar-button' title='judge' onClick={() => this.judge()}>
                judge
                {/* <div className='p-TabBar-tabIcon theia-debug-console-icon' /> */}
            </a>
        </div>
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
        this.title.label = "Remote Device";
        this.title.caption = "Device";
        this.title.closable = true;
        this.title.iconClass = 'fa outline-view-tab-icon';
        this.addClass('theia-udcdevice-view');
        this.refresh_devices()
        // this.refreshIssueStatus()
        this.issueTitles = {}
        this.issueInfos = {}
        this.issueStausStrs = {}
        this.rootdir = "/home/liang/theiaWorkSpace"
    }
    protected async refresh_devices() {
        try {
            this.device_list = await this.udcService.get_devices()
            this.update()
        } catch (err) {
            this.device_list = undefined
        }
    }

    public setDevice_list(devices: { [key: string]: number }) {
        this.device_list = devices;
        this.update()
    }

    public clearDevice(): void {
        this.device_list = undefined
        this.update()
    }
    areaMode: boolean = true
    issueInfos: { [key: string]: string } = {}
    issueTitles: { [key: string]: string } = { "0": "test", '2': 'test' }
    issueStausStrs: { [key: string]: string } = {}
    blackContent: string = ''
    logInfos: { [key: string]: string } = {}
    assignedissue?: string
    rootdir: string = "/home/liang/theiaWork"
    refreshTag: boolean = false
    currentFocus: string = ''

    protected setFocus(focus: string) {
        if (this.issueTitles[focus] != null || this.issueTitles[focus] != '')
            this.currentFocus = focus
    }
    protected setIssueStatusStrs(issue_num: string, issueStausStrs: string) {
        if (issue_num != null)
            this.issueStausStrs[issue_num] = issueStausStrs
        else
            console.log("null issue_num in 'setIssueStatusStrs'")
    }

    protected async getIssueStatusData() {//获取状态
        let tmp = []
        for (let x in this.issueTitles) {
            if (this.issueStausStrs[x] != 'scc' || this.issueStausStrs[x] != 'failed') {
                tmp.push(x)
            }
        }
        console.log("getIssueStatusData<<<" + tmp)
        this.udcService.queryStatus(JSON.stringify(tmp)).then((res) => { for (let i in res) this.issueStausStrs[i] = res[i] })
    }
    protected async getIssues() {//获取问题题目及内容
        this.udcService.get_issues().then((res) => {
            // console.log("widget:" + res)
            let tmp = JSON.parse(res)
            this.issueInfos = tmp.info
            // console.log("<<<<<<<<<<<<<<<<<<<tmp :" + JSON.stringify(this.issueInfos))
            this.issueTitles = tmp.title
            let cache = []
            for (let entry in this.issueTitles)
                cache.push(this.issueTitles[entry])
            // this.udcService.createSrcFile(cache)
            this.udcService.createSrcFile(JSON.stringify(cache))
        })
    }
    protected async submitIssues(issue_filename: string) {//提交题目
        // let tmppath=path.join(this.rootdir,issue_filename)

    }
    protected async  createSrcFile(fn: string[]) {
        for (let i of fn) {
            console.log("tmpPath:-----------" + i)
            let tmpPath = path.join(this.rootdir, i + '.cpp')
            fs.exists(tmpPath, (res) => {
                if (!res)
                    fs.writeFile(tmpPath, '', {}, (err) => { console.log(err) })
            })
        }
    }
    protected setIssueInfo() {//设置问题内容通告
        this.areaMode = true
        this.blackContent = this.issueInfos[this.currentFocus]
    }
    protected setLogInfo() {//设置log通告
        this.areaMode = false
        this.blackContent = this.logInfos[this.currentFocus]
    }
    protected clearBlackBoard() {
        this.blackContent = ''
    }
    protected setBlackContent() {
        if (this.areaMode == true)
            this.setIssueInfo()
        else
            this.setLogInfo()
    }
    protected renderBlackBoard(): React.ReactNode {//渲染通告板子
        this.setBlackContent()
        if (this.blackContent) {
            return <textarea readOnly value={"这是第" + this.currentFocus + "题的题述:\n" + this.blackContent} />
        }
        else
            return <textarea readOnly value={"这是第" + this.currentFocus + "题的日志:\n"} />
    }
    protected renderConnectArea(): React.ReactNode {
        if (this.device_list) {
            return <button className='btn disConnect' onClick={this.disconnect}>DisConnect</button>
        } else {
            return <button className='btn connect' onClick={this.connect}>Connect</button>
        }
    }
    protected renderTree(): React.ReactNode {
        let l = [];
        // this.commandRegistry.executeCommand(UdcCommands.SetJudgeHostandPort.id,"192.168.190.38","8000")
        // this.commandRegistry.executeCommand(UdcCommands.QueryStatus.id,"1").then((scc)=>console.log(scc),(err)=>console.log(err))
        for (let i in this.device_list) {
            let dev_str = i;
            // console.log(dev_str);
            let arr = dev_str.match(/[A-Za-z0-9]*/g);
            if (arr === null) continue;
            arr = arr.filter(e => e != "" && e != null)
            let [hub_id, , model_type, model_id] = arr;
            // console.log('as below', hub_id, model_type, model_id);
            l.push(<DeviceItem
                key={dev_str}
                dev_str={dev_str}
                hub_id={hub_id}
                model_type={model_type}
                model_id={model_id}
                using_or_not={this.device_list[i]}
                reset={this.reset}
                program={this.program}
                judge={this.judge}
                openshell={this.openShell}
                start={() => this.messageService.info('start')}
                stop={() => this.messageService.info('stop')} />)
        }
        // let x = [];



        // for (let i of this.issue_list) {
        //     console.log("issueInfo :" + this.issue_list)
        //     console.log("i :" + i)
        //     let tmp = i.split(" ")
        //     x.push(
        //         <IssueItem
        //             issue_num={tmp[0]}
        //             issue_str={tmp[1]}
        //             open={this.open}
        //             set={this.set}
        //         />
        //     )
        // }
        return (
            <div>
                <table className="controls-panel" >
                    <tbody>
                        <tr>
                            <td>
                                <div id='device-view-widget'>
                                    {/* <div className="deviceview-selection">
                <select className="connect-type">
                    <option>{LOGINTYPE.ADHOC}</option>
                    <option>{LOGINTYPE.FIXED}</option>
                </select>
                <select className="modle-type">
                    <option>any</option>
                    <option>{LOGINTYPE.FIXED}</option>
                </select>
            </div>
            <div className="key-input">
                <input style={{display:'block'}} type="text" name="key" />
            </div> */}
                                    <div className="buttons">
                                        {this.renderConnectArea()}
                                    </div>
                                    <div id='Device-Item-Container'>{l}</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <IssueBlock openSrcFile={this.openSrcFile} postSrcFile={this.postSrcFile}  callUpdate={this.callUpdata} setCurrentFocus={this.setCurrentFocus} issueStatusStrs={this.issueStausStrs} init={this.init} issue_titles={this.issueTitles} open={this.open} set={this.set} issueInfos={this.issueInfos} />
                            </td>
                        </tr>
                        <tr >

                            <td>
                                <button id='log-info-switch' onClick={this.switchArea}> log-info</button>
                            </td>
                        </tr>
                        <tr >
                            <td className='log-info-area'>
                                {this.renderBlackBoard()}
                            </td>
                        </tr>
                        {/* {this.refreshIssueStatus()} */}
                    </tbody>
                </table>
            </div>)
    }


    connect = () => {
        this.refreshIssueStatus()
        this.commandRegistry.executeCommand(UdcCommands.Connect.id);
        this.getIssues()
    }

    disconnect = () => {
        this.commandRegistry.executeCommand(UdcCommands.DisConnect.id)
        this.clearDevice();
    }
    program = () => {
        this.commandRegistry.executeCommand(UdcCommands.Program.id)
    }
    reset = () => {
        this.commandRegistry.executeCommand(UdcCommands.Reset.id)
    }
    openShell = () => {
        this.messageService.info('shell')
    }
    judge = () => {
        this.commandRegistry.executeCommand(UdcCommands.Judge.id)
    }
    open = (e: any) => {
        this.messageService.info(e)
    }
    set = (mode: string) => {
        switch (mode) {
            case "spec": { this.setIssueInfo(); break }
            case "log": { this.setLogInfo(); break }
            default: console.log("--------------invaild blackboard mode: " + mode)
        }
        this.update()
    }
    setCurrentFocus = (focus: string) => {
        this.currentFocus = focus
    }

    callUpdata = () => {
        this.update()
    }
    refreshIssueStatus = () => {
        if (!this.refreshTag) {
            this.getIssueStatusData()
            setInterval(() => { this.getIssueStatusData(); this.update(); console.log("refresh at :" + new Date()) }, 5000);
            this.refreshTag = true
        }
    }
    switchArea = () => {
        this.areaMode = !this.areaMode
        console.log("u press")
        this.update()
    }
    postSrcFile = (fn: string) => {
        this.udcService.postSrcFile(fn)
    }
    openSrcFile = (uri: URI) => {
        this.commandRegistry.executeCommand(UdcCommands.OpenCommand.id, uri)
    }
}