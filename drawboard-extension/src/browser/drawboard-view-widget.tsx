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
import { DrawboardService } from '../common/drawboardservice';

export interface DrawboardSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode, ExpandableTreeNode {
    iconClass: string;
}

export namespace DrawboardSymbolInformationNode {
    export function is(node: TreeNode): node is DrawboardSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }
}

export type DrawboardViewWidgetFactory = () => DrawboardViewWidget;
export const DrawboardViewWidgetFactory = Symbol('DrawboardViewWidgetFactory');

@injectable()
export class DrawboardViewWidget extends TreeWidget {

    readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    iamap:any

    constructor(
        @inject(TreeProps) protected readonly treeProps: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(DrawboardService) protected readonly ds :DrawboardService
    ) {
        super(treeProps, model, contextMenuRenderer);

        this.id = 'drawboard-view';
        this.title.label = ' ';
        this.title.caption = ' ';
        this.title.closable = true;
        this.title.iconClass = 'fa drawboard-view-tab-icon';
        this.addClass('theia-drawboard-view');
    }

    public setDrawboardTree(roots: DrawboardSymbolInformationNode[]): void {
        const nodes = this.reconcileTreeState(roots);
        this.model.root = {
            id: 'drawboard-view-root',
            name: 'Drawboard Root',
            visible: false,
            children: nodes,
            parent: undefined
        } as CompositeTreeNode;
    }

    protected reconcileTreeState(nodes: TreeNode[]): TreeNode[] {
        nodes.forEach(node => {
            if (DrawboardSymbolInformationNode.is(node)) {
                const treeNode = this.model.getNode(node.id);
                if (treeNode && DrawboardSymbolInformationNode.is(treeNode)) {
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
        if (DrawboardSymbolInformationNode.is(node)) {
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
        if (DrawboardSymbolInformationNode.is(node)) {
            return node.name + ` (${node.iconClass})`;
        }
        return undefined;
    }

    protected isExpandable(node: TreeNode): node is ExpandableTreeNode {
        return DrawboardSymbolInformationNode.is(node) && node.children.length > 0;
    }


    protected renderTree(): React.ReactNode {
        return (
            <View disconnect={this.disconnect} pushData={this.pushDate} connect={this.connect} iamap={this.iamap} getData={this.getData}></View>
        )
    }
    getData=async ()=>{
       return await  this.ds.getDataFromIotPlatform()
    }
    pushDate= async (data:any)=>{
        return await  this.ds.pushDataToIotPlatform(data)
    }
    setIaMap(iamap:any){
        this.iamap=iamap
    }
    connect=(authen :any )=>{
       return this.ds.connectIot(authen)
    }
    disconnect=()=>{
        return this.ds.disconnectIot()
    }
    
}