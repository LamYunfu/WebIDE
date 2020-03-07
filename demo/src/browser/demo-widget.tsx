import { injectable, inject } from "inversify";
import {
  TreeWidget,
  TreeProps,
  TreeModel,
  ContextMenuRenderer,
  CompositeTreeNode,
  SelectableTreeNode,
  TreeNode
} from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { DemoService } from "../common/demo-service";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { ApplicationShell } from "@theia/core/lib/browser/shell/application-shell";
import {
  FileNavigatorModel,
  FileNavigatorWidget
} from "@theia/navigator/lib/browser/";
import { FileSystem } from "@theia/filesystem/lib/common/filesystem";
import { CommandService, SelectionService } from "@theia/core";
import { UdcService } from "udc-extension/lib/common/udc-service";
export interface DemoViewSymbolInformationNode
  extends CompositeTreeNode,
    SelectableTreeNode {
  iconClass: string;
}

export namespace DemoViewSymbolInformationNode {
  export function is(node: TreeNode): node is DemoViewSymbolInformationNode {
    return !!node && SelectableTreeNode.is(node) && "iconClass" in node;
  }
}

export type DemoWidgetFactory = () => DemoWidget;
export const DemoWidgetFactory = Symbol("DemoWidgetFactory");
@injectable()
export class DemoWidget extends FileNavigatorWidget {
  readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
  device_list?: { [key: string]: number };
  ppid: string | undefined;

  constructor(
    @inject(TreeProps) protected readonly treePros: TreeProps,
    @inject(UdcService) protected readonly udcService: UdcService,
    // @inject(DemoService) protected readonly ds: DemoService,
    @inject(FileNavigatorModel) readonly model: FileNavigatorModel,
    @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer,
    @inject(CommandService) protected readonly commandService: CommandService,
    @inject(SelectionService)
    protected readonly selectionService: SelectionService,
    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService,
    @inject(ApplicationShell) protected readonly shell: ApplicationShell,
    @inject(FileSystem) protected readonly fileSystem: FileSystem
  ) {
    super(
      treePros,
      model,
      contextMenuRenderer,
      commandService,
      selectionService,
      workspaceService,
      shell,
      fileSystem
    );
    this.id = "demo-view";
    this.title.label = "linkedge";
    this.title.caption = "Demo";
    this.title.closable = true;
    this.title.iconClass = "fa fa-gg";
    this.addClass("theia-udcdevice-view");
  }
  submitEnableWithJudgeTag: boolean = false;
  rootdir: string = ``;
  viewType: string = "";
  protected renderTree(): React.ReactNode {
    return (
      <div style={{ height: "100%" }}>
        {/* <button onClick={this.say}>hello</button> */}
        <div
          style={{ height: "30%", overflowY: "scroll", overflowX: "hidden" }}
        >
          <div>{super.renderTree(this.model)}</div>
        </div>
        <div style={{ height: "55%" }}>
          <div className="fa fa-folder file-icon"></div> Development
          <ul>
            <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
              onClick={this.creatEdgeInstance}
            >
              <div className="fa fa-folder file-icon"></div> 创建边缘实例
            </li>
            <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
              onClick={this.createDeviceDriver}
            >
              <div className="fa fa-folder file-icon"></div> 设备驱动开发
            </li>
            <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
              onClick={this.createRuleCaculation}
            >
              <div className="fa fa-folder file-icon"></div> 场景联动开发
            </li>
            <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
              onClick={this.createAppManagement}
            >
              <div className="fa fa-folder file-icon"></div>函数计算开发
            </li>
            <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
              onClick={this.createFlowCaculation}
            >
              <div className="fa fa-folder file-icon"></div>流数据分析与开发
            </li>
            <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
              onClick={this.createMessageRouting}
            >
              <div className="fa fa-folder file-icon"></div> 消息路由开发
            </li>
            {/* <li
              style={{
                cursor: "pointer",
                color: "",
                textDecoration: "underline"
              }}
            >
              <div className="fa fa-folder file-icon"></div> 子设备开发
            </li> */}
          </ul>
        </div>
      </div>
      // <LinkEdgeView initPidQueueInfo={this.initPidQueueInfo} linkEdgeConnect={this.linkEdgeConnect}></LinkEdgeView>
    );
  }
  async getIotID(): Promise<string> {
    let id = await this.udcService.getIotId();
    console.log("id:" + id + ":");
    if (id == "") {
      // alert("IoTId为空,请设置IoTId")
      return "";
    } else {
      return id;
    }
  }
  createUrl(id: string, key: string) {
    return `https://iot.console.aliyun.com/le/instance/detail?id=${id}&activeKey=${key}`;
  }
  creatEdgeInstance = async () => {
    window.open(`https://iot.console.aliyun.com/le/instance/list`);
  };
  createDeviceDriver = async () => {
    let id = await this.getIotID();
    if (id == "") {
      alert("IoTId is null");
      return;
    }
    let url = this.createUrl(id, "deviceDriver");
    console.log(url);
    window.open(url);
  };
  createRuleCaculation = async () => {
    let id = await this.getIotID();
    if (id == "") {
      alert("IoTId is null");
      return;
    }
    let url = this.createUrl(id, "ruleCalculation");
    window.open(url);
  };
  createAppManagement = async () => {
    let id = await this.getIotID();
    if (id == "") {
      alert("IoTId is null");
      return;
    }
    let url = this.createUrl(id, "appManagement");
    console.log(url);
    window.open(url);
  };
  createFlowCaculation = async () => {
    let id = await this.getIotID();
    if (id == "") {
      alert("IoTId is null");
      return;
    }
    let url = this.createUrl(id, "flowCalculation");
    console.log(url);
    window.open(url);
  };
  createMessageRouting = async () => {
    let id = await this.getIotID();
    if (id == "") {
      alert("IoTId is null");
      return;
    }
    let url = this.createUrl(id, "messageRouting");
    console.log(url);
    window.open(url);
  };

  //   say = () => {
  //     this.ds.say();
  //   };
}
