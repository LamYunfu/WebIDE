import { injectable, inject } from "inversify";
import { TreeWidget, TreeProps, TreeModel, ContextMenuRenderer, CompositeTreeNode, SelectableTreeNode, TreeNode, ApplicationShell } from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { UdcService } from "../common/udc-service";
import { MessageService, CommandRegistry } from "@theia/core";
import { UdcCommands } from "./udc-extension-contribution";
import URI from "@theia/core/lib/common/uri";
import { EditorManager } from "@theia/editor/lib/browser";
import { View } from './component/renderView'
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
        @inject(EditorManager) protected em: EditorManager
    ) {
        super(treePros, model, contextMenuRenderer);
        this.id = 'device-view';
        // this.title.label = "题目目录";
        this.title.caption = "Device";
        this.title.closable = true;
        this.title.iconClass = 'fa fa-gg';
        this.addClass('theia-udcdevice-view');


    }
    rootdir: string = "/home/project"
    setSize = () => {
        console.log("rendering")
        this.applicationShell.activateWidget(this.id)
        this.applicationShell.setLayoutData({
            version: this.applicationShell.getLayoutData().version,
            activeWidgetId: this.id,
            leftPanel: {
                type: 'sidepanel',
                size: 520
            }
        })
    }
    protected renderTree(): React.ReactNode {

        return (
            <View
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
                createSrcFile={this.createSrcFile}
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


    connect = (loginType: string, model: string, pid: string, timeout: string) => {
        this.commandRegistry.executeCommand(UdcCommands.Connect.id, loginType, model, pid, timeout);
    }


    disconnect = () => {
        this.commandRegistry.executeCommand(UdcCommands.DisConnect.id)
    }


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


    openSrcFile = (uri: URI) => {
        this.commandRegistry.executeCommand(UdcCommands.OpenCommand.id, uri)
    }


    createSrcFile = (fn: string[]) => {
        this.udcService.createSrcFile(JSON.stringify(fn))

    }


    gotoVideo = (uri: string, videoName: string) => {
        this.commandRegistry.executeCommand(UdcCommands.openViewPanel.id, uri, videoName)
    }
    storeData = (data: string) => {
        this.udcService.storeState(data)
    }
    getData = (type: string) => {
        return this.udcService.getState(type)
    }
    setQueue = () => {
        this.udcService.setQueue()
    }
}