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

import { Deferred } from '@theia/core/lib/common/promise-util';
import { Endpoint } from '@theia/core/lib/browser/endpoint';
import URI from '@theia/core/lib/common/uri';

import { UdcService } from "udc-extension/lib/common/udc-service";


const maxChunkSize = 64 * 1024;

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
    project:string

    constructor(
        @inject(TreeProps) protected readonly treeProps: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(UdcService) protected readonly udcService: UdcService,
        @inject(DrawboardService) protected readonly ds :DrawboardService
    ) {
        super(treeProps, model, contextMenuRenderer);

        this.id = 'drawboard-view';
        this.title.label = ' ';
        this.title.caption = ' ';
        this.title.closable = true;
        this.title.iconClass = 'fa drawboard-view-tab-icon';
        this.addClass('theia-drawboard-view');
        this.project = ""
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

    showNumber() {
        console.log("showNumber 1111111111");
        document.getElementsByClassName("res")[0].innerHTML = "123"
    }

    showImage() {
        console.log("showImage 1111111111");
        var canvas  = document.getElementById("sketchpad") as HTMLCanvasElement;
        var ctx = canvas.getContext("2d");
        console.log("22222 ctx is " + ctx)
        if(ctx) {
            ctx.beginPath();
            ctx.lineWidth=4;
            ctx.strokeStyle="green";
            ctx.rect(30,30,180,180);
            ctx.stroke();
        }
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
            <View getProjectName={this.getProjectName} uploadFile={this.uploadFile} disconnect={this.disconnect} pushData={this.pushDate} connect={this.connect} iamap={this.iamap} getData={this.getData}></View>
        )
    }
    getData=async ()=>{
       return await  this.ds.getDataFromIotPlatform()
    }
    pushDate= async (data:any)=>{
        return await  this.ds.pushDataToIotPlatform(data)
    }
    uploadFile= async (uri1:string, file:File) => {
        this.showImage()
        var dir = await this.udcService.getprojectDir()
        console.log("project dir is " + dir)
        console.log("uri1 is " + uri1)
        let uri2 = new URI(String(dir));
        console.log("uri2 is " + uri2)
        let uri = uri2.resolve("test.png");
        console.log("uri is " + uri)
        const endpoint = new Endpoint({ path: '/file-upload' });
        console.log("upload file " + endpoint.getWebSocketUrl().toString())
        const socketOpen = new Deferred<void>();
        const socket = new WebSocket(endpoint.getWebSocketUrl().toString());
    
        socket.onerror = (e) => {
            console.log(e)
        }
        socket.onclose = (e) => {
            console.log(e)
        }
    
        socket.onopen = () => socketOpen.resolve();
    
        socket.onmessage = ({data}) => {
          const response = JSON.parse(data);
          console.log(response)
          if (response.uri) {
            socket.close();
          }
          if(response.done) {
            
          }
    
        }
        try {
          await socketOpen.promise;
          let readBytes = 0;
          console.log("file size is " + file.size)
          socket.send(JSON.stringify({ uri: uri.toString(), size: file.size }));
          if (file.size) {
              do {
                  const fileSlice = await this.readFileSlice(file, readBytes);
                  readBytes = fileSlice.read;
                  socket.send(fileSlice.content);
                  while (socket.bufferedAmount > maxChunkSize * 2) {
                      await new Promise(resolve => setImmediate(resolve));
                  }
              } while (readBytes < file.size);
          }
      } catch (e) {
          console.log(e)
      }
    }

    protected readFileSlice(file: File, read: number): Promise<{
        content: ArrayBuffer
        read: number
    }> {
        return new Promise((resolve, reject) => {
            const bytesLeft = file.size - read;
            if (!bytesLeft) {
                reject(new Error('nothing to read'));
                return;
            }
            const size = Math.min(maxChunkSize, bytesLeft);
            const slice = file.slice(read, read + size);
            const reader = new FileReader();
            reader.onload = () => {
                read += size;
                const content = reader.result as ArrayBuffer;
                resolve({ content, read });
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(slice);
        });
    }
    setIaMap(iamap:any){
        this.iamap=iamap
    }
     connect= async (authen :any )=>{
        this.project =  await this.udcService.getProjectName()
       return this.ds.connectIot(authen)
    }
    disconnect=()=>{
        return this.ds.disconnectIot()
    }

    getProjectName = async () =>{
        let name =  await this.udcService.getProjectName()
        return name
        
    }
    
}
