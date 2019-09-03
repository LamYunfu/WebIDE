import { injectable, inject } from "inversify";
import { TreeWidget, TreeProps, TreeModel, ContextMenuRenderer, CompositeTreeNode, SelectableTreeNode, TreeNode, } from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { MessageService, CommandRegistry } from "@theia/core";
import { EditorManager } from '@theia/editor/lib/browser';
import { UdcCommands } from "./toy-extension-contribution"
import URI from "@theia/core/lib/common/uri";

export interface ToyViewSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode {
    iconClass: string;
}

export namespace ToyViewSymbolInformationNode {
    export function is(node: TreeNode): node is ToyViewSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }
}
export type ToyViewWidgetFactory = () => ToyViewWidget;
export const ToyViewWidgetFactory = Symbol('ToyViewWidgetFactory')
@injectable()
export class ToyViewWidget extends TreeWidget {
    readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    Toy_list?: { [key: string]: number }
    constructor(
        @inject(TreeProps) protected readonly treePros: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(MessageService) protected readonly messageService: MessageService,
        @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry,
        @inject(EditorManager) protected em: EditorManager


    ) {
        super(treePros, model, contextMenuRenderer);
        this.id = 'toy-view';
        this.title.label = "教学视频";
        this.title.caption = "Toy";
        this.title.closable = true;
        this.title.iconClass = 'fa outline-view-tab-icon';
        this.update()
        this.addClass('theia-udcToy-view');
    }
    protected renderTree(): React.ReactNode {
        return (<div>
            <a onClick={this.openViewPanel}>视频 1</a><br/>     
        </div>)
    }
    openViewPanel=()=>{
        this.commandRegistry.executeCommand(UdcCommands.openViewPanel.id)
    }
    open = (uri:URI) => {
        this.commandRegistry.executeCommand("iot.plugin.tinylink.compile", uri)
    }
}