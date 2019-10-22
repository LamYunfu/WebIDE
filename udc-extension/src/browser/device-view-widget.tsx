import { injectable, inject } from "inversify";
import { TreeWidget, TreeProps, TreeModel, ContextMenuRenderer, CompositeTreeNode, SelectableTreeNode, TreeNode, ApplicationShell, LocalStorageService } from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { UdcService } from "../common/udc-service";
import { MessageService, CommandRegistry } from "@theia/core";
import { UdcCommands } from "./udc-extension-contribution";
// import URI from "@theia/core/lib/common/uri";
import { View } from './component/renderView'
import { UdcWatcher } from "../common/udc-watcher";
import * as color from 'colors'
import * as $ from "jquery"
import { Logger } from "../node/util/logger";
export interface DeviceViewSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode {
    iconClass: string;
}

export namespace DeviceViewSymbolInformationNode {
    export function is(node: TreeNode): node is DeviceViewSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }
}


export class Loading extends React.Component {
    render(): JSX.Element {
        return <div> Loading</div >
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
        @inject(ApplicationShell) protected applicationShell: ApplicationShell,
        @inject(LocalStorageService) protected readonly lss: LocalStorageService,
        @inject(UdcWatcher) protected readonly uwc: UdcWatcher
    ) {
        super(treePros, model, contextMenuRenderer);
        this.id = 'device-view';
        // this.title.label = "题目目录";
        this.title.caption = "Device";
        this.title.closable = true;
        this.title.iconClass = 'fa fa-gg';
        this.addClass('theia-udcdevice-view');
    }
    submitEnableWithJudgeTag: boolean = false
    rootdir: string = "/home/project"
    setSize = (size: number) => {
        console.log("rendering")
        // this.applicationShell.activateWidget(this.id)
        this.applicationShell.setLayoutData({
            version: this.applicationShell.getLayoutData().version,
            activeWidgetId: this.id,
            leftPanel: {
                type: 'sidepanel',
                size: size
            }
        })
    }
    protected renderTree(): React.ReactNode {
        return (
            <View
                postSimFile={this.postSimFile}
                isconnected={this.isconnected}
                programSingleFile={this.programSingleFile}
                getLocal={this.getLocal}
                setLocal={this.saveLocal}
                config={this.config}
                setTinyLink={this.setTinyLink}
                openShell={this.openShell}
                initPidQueueInfo={this.initPidQueueInfo}
                closeTabs={this.closeTabs}
                setQueue={this.setQueue}
                setSize={this.setSize}
                storeData={this.storeData}
                getData={this.getData}
                outputResult={this.outputResult}
                say={this.say}
                gotoVideo={this.gotoVideo}
                setCookie={this.setCookie}
                disconnect={this.disconnect} connect={this.connect}
                callUpdate={this.callUpdate}
                openSrcFile={this.openSrcFile}
                postSrcFile={this.postSrcFile}
                saveAll={this.saveAll}
                getSubmitEnableWithJudgeTag={this.getSubmitEnableWithJudgeTag}
                setSubmitEnableWithJudgeTag={this.setSubmitEnableWithJudgeTag}
            />

        )
    }
    setSubmitEnableWithJudgeTag = (val: boolean) => {
        this.submitEnableWithJudgeTag = val
    }
    getSubmitEnableWithJudgeTag = () => {
        return this.submitEnableWithJudgeTag
    }
    appproveClick() {
        this.submitEnableWithJudgeTag = true
    }
    enableClick() {
        Logger.info("enableclick")
        Logger.info($("[id*=submitSrcButton]").removeAttr("disabled"))
        $("[id*=connectButton]").removeAttr("disabled")
    }
    openShell = () => {
        // if (this.applicationShell.activateWidget("udc-shell")) {
        //     alert("shell open")
        // }
        if (!this.applicationShell.isExpanded("bottom")) {
            this.commandRegistry.executeCommand("udc:shell:toggle")
        }
    }
    closeTabs = async () => {
        await this.applicationShell.closeTabs("main")
        await this.applicationShell.closeTabs("bottom")
        await this.applicationShell.closeTabs("right")
    }
    outputResult = (res: string, types?: string) => {
        // this.udcService.outputResult(res,types)
        color.enable()
        let client = this.uwc.getUdcWatcherClient()
        switch (types) {
            case "wrongAnswer": client.OnDeviceLog("::" + res.red); break;
            case "rightAnswer": client.OnDeviceLog("::" + res.blue); break;
            default: client.OnDeviceLog("::" + res.green); break;
        }

    }


    say = (verbose: string) => {
        this.messageService.info(verbose)
    }


    connect = async (loginType: string, model: string, pid: string, timeout: string) => {
        await this.commandRegistry.executeCommand(UdcCommands.Connect.id, loginType, model, pid, timeout);
    }
    isconnected = async () => {
        return this.udcService.is_connected()
    }

    disconnect = async () => {
        await this.commandRegistry.executeCommand(UdcCommands.DisConnect.id)
    }
    // config = (url: string, name: string, passwd: string) => {
    //     this.commandRegistry.executeCommand("iot.plugin.tinylink.scence.config", url, name, passwd)
    // }

    callUpdate = () => {
        this.update()
    }


    setCookie = (cookie: string) => {
        this.udcService.setCookie(`JSESSIONID=${cookie}; Path=/; HttpOnly`);
        // this.udcService.setCookie(cookie);
    }


    postSrcFile = (fn: string) => {
        this.udcService.postSrcFile(fn)
    }


    openSrcFile = (pid: string) => {
        // this.commandRegistry.executeCommand(UdcCommands.OpenCommand.id, uri)
        this.udcService.openPidFile(pid)
    }

    gotoVideo = (uri: string, videoName: string) => {
        this.setSize(574)
        this.commandRegistry.executeCommand(UdcCommands.openViewPanel.id, uri, videoName)
    }
    storeData = (data: string) => {
        this.udcService.storeState(data)
    }
    getData = (type: string) => {
        console.log("in device widget type is :" + type)
        return this.udcService.getState(type)
    }
    setQueue = () => {
        this.udcService.setQueue()
    }
    setPidQueueInfo = (pid: string, content: {
        loginType: string, timeout: string, model: string, waitID: string,
        fns?: string, dirName?: string, deviceRole: string[] | undefined
    }) => {
        this.udcService.setPidInfos(pid, content)
    }
    initPidQueueInfo = (infos: string): Promise<string> => {
        console.log(infos + "....................................info")
        return this.udcService.initPidQueueInfo(infos)
    }
    setTinyLink = (name: string, passwd: string) => {
        this.udcService.setTinyLink(name, passwd)

    }
    config = () => {
        this.udcService.config()
    }
    saveLocal = (key: string, obj: object) => {
        // alert(`save key:${key},obj:${JSON.stringify(obj)}`)
        this.lss.setData(key, obj)
    }
    getLocal = async (key: string, obj: object) => {

        let val = await this.lss.getData(key, obj)
        // alert(`get key:${key},obj:${JSON.stringify(val)}`)
        return val
    }
    programSingleFile = (pidAndFn: string) => {
        this.udcService.programSingleFile(pidAndFn)
    }
    postSimFile = (pid: string) => {
        this.udcService.postSimFile(pid)
    }
    saveAll = async () => {
        await this.applicationShell.saveAll()

    }
}