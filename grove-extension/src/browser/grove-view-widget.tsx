import { injectable, inject } from 'inversify';
import {
    TreeWidget,
    TreeNode,
    NodeProps,
    SelectableTreeNode,
    TreeProps,
    ContextMenuRenderer,
    TreeModel,
    ExpandableTreeNode
} from '@theia/core/lib/browser';
import { Message } from '@phosphor/messaging';
import { Emitter } from '@theia/core';
import { CompositeTreeNode } from '@theia/core/lib/browser';
import * as React from 'react';
import { View } from './renderview';
import { GroveService } from '../common/groveservice';

export interface GroveSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode, ExpandableTreeNode {
    iconClass: string;
}

export namespace GroveSymbolInformationNode {
    export function is(node: TreeNode): node is GroveSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }
}

export type GroveViewWidgetFactory = () => GroveViewWidget;
export const GroveViewWidgetFactory = Symbol('GroveViewWidgetFactory');

@injectable()
export class GroveViewWidget extends TreeWidget {

    readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    iamap:any
    dotData: number[][] = []; 
    child: any;

    constructor(
        @inject(TreeProps) protected readonly treeProps: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(GroveService) protected readonly gs :GroveService
    ) {
        super(treeProps, model, contextMenuRenderer);

        this.id = 'grove-view';
        this.title.label = ' ';
        this.title.caption = ' ';
        this.title.closable = true;
        this.title.iconClass = 'fa grove-view-tab-icon';
        this.addClass('theia-grove-view');
    }

    public setGroveTree(roots: GroveSymbolInformationNode[]): void {
        const nodes = this.reconcileTreeState(roots);
        this.model.root = {
            id: 'grove-view-root',
            name: 'Grove Root',
            visible: false,
            children: nodes,
            parent: undefined
        } as CompositeTreeNode;
    }

    protected reconcileTreeState(nodes: TreeNode[]): TreeNode[] {
        nodes.forEach(node => {
            if (GroveSymbolInformationNode.is(node)) {
                const treeNode = this.model.getNode(node.id);
                if (treeNode && GroveSymbolInformationNode.is(treeNode)) {
                    treeNode.expanded = node.expanded;
                    treeNode.selected = node.selected;
                }
                this.reconcileTreeState(Array.from(node.children));
            }
        });
        return nodes;
    }

    protected onAfterHide(msg: Message): void {
        super.onAfterHide(msg);
        this.onDidChangeOpenStateEmitter.fire(false);
    }

    protected onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.onDidChangeOpenStateEmitter.fire(true);
    }

    renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        if (GroveSymbolInformationNode.is(node)) {
            return <div className={'symbol-icon symbol-icon-center ' + node.iconClass}></div>;
        }
        return undefined;
    }

    protected createNodeAttributes(node: TreeNode, props: NodeProps): React.Attributes & React.HTMLAttributes<HTMLElement> {
        const elementAttrs = super.createNodeAttributes(node, props);
        return {
            ...elementAttrs,
            title: this.getNodeTooltip(node)
        };
    }

    protected getNodeTooltip(node: TreeNode): string | undefined {
        if (GroveSymbolInformationNode.is(node)) {
            return node.name + ` (${node.iconClass})`;
        }
        return undefined;
    }

    protected isExpandable(node: TreeNode): node is ExpandableTreeNode {
        return GroveSymbolInformationNode.is(node) && node.children.length > 0;
    }


    setDotData(data: number[][]){
        this.dotData = data;
        console.log("在grove-view-widget里面,改了一4东西");
        console.log("this.child是啥" + this.child);
        if(this.child){
            this.child.setDotData(data);
        } 
    }

    onRef = (ref:any) =>{
        this.child = ref;    //获取子组件
        console.log("父组件设置了子组件的引用");
    }

    protected renderTree(): React.ReactNode {
        return (
            <View dotData={this.dotData} onRef={this.onRef}></View>
        )
    }
}
