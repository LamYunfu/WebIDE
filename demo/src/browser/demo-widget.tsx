
import { injectable, inject } from "inversify";
import { TreeWidget, TreeProps, TreeModel, ContextMenuRenderer, CompositeTreeNode, SelectableTreeNode, TreeNode } from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { DemoService } from "../common/demo-service";
export interface DemoViewSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode {
    iconClass: string;
}

export namespace DemoViewSymbolInformationNode {
    export function is(node: TreeNode): node is DemoViewSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }
}

export type DemoWidgetFactory = () => DemoWidget;
export const DemoWidgetFactory = Symbol('DemoWidgetFactory')
@injectable()
export class DemoWidget extends TreeWidget {

    readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    device_list?: { [key: string]: number }
    ppid: string | undefined


    constructor(
        @inject(TreeProps) protected readonly treePros: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject (DemoService) protected readonly ds:DemoService
    ) {
        super(treePros, model, contextMenuRenderer);
        this.id = 'demo-view';
        // this.title.label = "题目目录";
        this.title.caption = "Demo";
        this.title.closable = true;
        this.title.iconClass = 'fa fa-gg';
        this.addClass('theia-udcdevice-view');
    }
    submitEnableWithJudgeTag: boolean = false
    rootdir: string = ``
    viewType: string = ""
    protected renderTree(): React.ReactNode {
        return (
            <div>this is a frontend demo
                <button onClick={this.say}>hello</button>
            </div>
            // <LinkEdgeView initPidQueueInfo={this.initPidQueueInfo} linkEdgeConnect={this.linkEdgeConnect}></LinkEdgeView>

        )
    }
    say=()=>{
   this.ds.say()
    }
}