import { injectable, inject } from "inversify";
import {
  TreeWidget,
  TreeProps,
  TreeModel,
  ContextMenuRenderer,
  CompositeTreeNode,
  SelectableTreeNode,
  TreeNode,
  ApplicationShell,
  LocalStorageService,
  WidgetManager
} from "@theia/core/lib/browser";
import React = require("react");
import { Emitter } from "vscode-jsonrpc";
import { UdcService } from "../common/udc-service";
import { MessageService, CommandRegistry } from "@theia/core";
import { UdcCommands } from "./udc-extension-contribution";
// import URI from "@theia/core/lib/common/uri";
import { View } from "./component/renderView";
import { UdcWatcher } from "../common/udc-watcher";
import * as color from "colors";
import * as $ from "jquery";
import { Logger } from "../node/util/logger";
// import { Workspace } from "@theia/languages/lib/browser";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { FileTreeWidget } from "@theia/filesystem/lib/browser";
import { ViewContainer } from "@theia/core/lib/browser/view-container";
import { LINKLAB_WORKSPACE } from "../setting/backend-config";
// import { LinkEdgeView } from "./component/linkedge";
export interface DeviceViewSymbolInformationNode
  extends CompositeTreeNode,
    SelectableTreeNode {
  iconClass: string;
}

export namespace DeviceViewSymbolInformationNode {
  export function is(node: TreeNode): node is DeviceViewSymbolInformationNode {
    return !!node && SelectableTreeNode.is(node) && "iconClass" in node;
  }
}

export class Loading extends React.Component {
  render(): JSX.Element {
    return <div> Loading</div>;
  }
}

export type DeviceViewWidgetFactory = () => DeviceViewWidget;
export const DeviceViewWidgetFactory = Symbol("DeviceViewWidgetFactory");
@injectable()
export class DeviceViewWidget extends TreeWidget {
  readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
  device_list?: { [key: string]: number };
  ppid: string | undefined;
  tinymobile: Window | null = null;
  unity: Window | null = null;
  url: string = "";

  constructor(
    @inject(TreeProps) protected readonly treePros: TreeProps,
    @inject(TreeModel) model: TreeModel,
    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer,
    @inject(UdcService) protected readonly udcService: UdcService,
    @inject(MessageService) protected readonly messageService: MessageService,
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry,
    @inject(ApplicationShell) protected applicationShell: ApplicationShell,
    @inject(LocalStorageService) protected readonly lss: LocalStorageService,
    @inject(UdcWatcher) protected readonly uwc: UdcWatcher,
    @inject(WorkspaceService) protected readonly ws: WorkspaceService,
    @inject(WidgetManager) protected readonly wm: WidgetManager,
    @inject(FileTreeWidget) protected readonly ftw: FileTreeWidget,
    @inject(ViewContainer) protected readonly vc: ViewContainer
  ) { 
    super(treePros, model, contextMenuRenderer);
    this.id = "device-view";
    // this.title.label = "题目目录";
    this.title.caption = "Device";
    this.title.closable = true;
    this.title.iconClass = "fa fa-gg";
    this.addClass("theia-udcdevice-view");
    window.addEventListener("message", message => {
      if (message.data == "scc") {
        // alert("get")
        this.tinymobile!.postMessage(this.url, "*");
        window.blur();
        this.tinymobile!.focus();
      }
    });
  }
  submitEnableWithJudgeTag: boolean = false;
  rootdir: string = `${LINKLAB_WORKSPACE}`;
  viewType: string = "";
  setSize = (size: number) => {
    console.log("rendering");
    // this.applicationShell.activateWidget(this.id)
    this.applicationShell.setLayoutData({
      version: this.applicationShell.getLayoutData().version,
      activeWidgetId: this.id,
      leftPanel: {
        type: "sidepanel",
        size: size
      }
    });
  };
  protected renderTree(): React.ReactNode {
    return (
      <View
        initPid={this.initPid}
        openConfigFile={this.openConfigFile}
        initLinkedge={this.initLinkedgeConfig}
        gotoPhone={this.gotoPhone}
        gotoUnity={this.gotoUnity}
        openUnity={this.openUnity}
        openDevice={this.openDevice}
        openMobile={this.openMobile}
        compileDevice={this.compileDevice}
        complileMobile={this.complileMobile}
        createOnelinkProject={this.createOnelinkProject}
        remove={this.remove}
        linkEdgeGetDevicesInfo={this.linkEdgeGetDevicesInfo}
        linkEdgeProjectAdd={this.linkEdgeProjectAdd}
        linkEdgeDevelop={this.linkEdgeDevelop}
        linkEdgeConnect={this.linkEdgeConnect}
        openDrawBoard={this.openDrawBoard}
        gotoVirtualScene={this.gotoVirtualScene}
        virtualOpen={this.virtualOpen}
        virtualSubmit={this.virtualSubmit}
        train={this.train}
        openExplorer={this.openExplorer}
        openFileView={this.openFileView}
        openWorkSpace={this.openWorkSpace}
        terminateExe={this.terminateExe}
        continueExe={this.continueExe}
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
        disconnect={this.disconnect}
        connect={this.connect}
        callUpdate={this.callUpdate}
        openSrcFile={this.openSrcFile}
        postSrcFile={this.postSrcFile}
        saveAll={this.saveAll}
        getSubmitEnableWithJudgeTag={this.getSubmitEnableWithJudgeTag}
        setSubmitEnableWithJudgeTag={this.setSubmitEnableWithJudgeTag}
      />
      // <LinkEdgeView initPidQueueInfo={this.initPidQueueInfo} linkEdgeConnect={this.linkEdgeConnect}></LinkEdgeView>
    );
  }
  gotoPhone = () => {
    window.blur();
    this.tinymobile!.focus();
  };
  gotoUnity = () => {
    window.blur();
    this.unity!.focus();
  };
  openUnity = () => {
    this.unity = window.open(
      "http://47.97.253.23:12311/static/publish/index.html"
    );
  };
  openTinyMobile = (url: string) => {
    this.url = url;
    // if (this.tinymobile == null) {
    //   this.tinymobile = window.open(
    //     "http://120.55.102.225:12359/phone/index.html"
    //   );
    //   this.tinymobile!.onclose = () => {
    //     this.tinymobile = null;
    //   };
    // } else {
    //   this.tinymobile.postMessage(url, "*");
    // }
    this.tinymobile = window.open(
      "http://120.55.102.225:12359/phone/index.html"
    );
    // setTimeout(()=>{
    //   this.tinymobile!.postMessage(this.url,"*")
    // })
    this.tinymobile!.onclose = () => {
      this.tinymobile = null;
    };
  };
  remove = (pid: string, index: string) => {
    return this.udcService.remove(pid, index);
  };
  setSubmitEnableWithJudgeTag = (val: boolean) => {
    this.submitEnableWithJudgeTag = val;
  };
  getSubmitEnableWithJudgeTag = () => {
    return this.submitEnableWithJudgeTag;
  };
  literalAnalysis() {
    let val = $("pre[id*=codingInfoArea]").attr("title");
    if (val == undefined) {
      this.outputResult("invalid html title");
      return;
    }
    this.udcService.literalAnalysis(val!);
  }
  appproveClick() {
    this.submitEnableWithJudgeTag = true;
  }
  openExecutePanel() {
    Logger.info("showing", "showing");
    // $(".simInfo").css("display","inline")
    $(".simInfo").show();
  }
  submitOnMenu() {
    // alert($("textarea").text())
    $(document).on(".freeCodingSubmit", () => {});
    let val = $(".title_timer").attr("title");
    Logger.info("start connecting from frontend");
    if (val == undefined) {
      Logger.info("val is undefined");
      return;
    }
    this.postFreeCodingFile(val);
    // this.openExplorer()
    // this.connect("a", "b", val!, "20")
    //_this.props.callUpdate()
    // this.ws.open(new URI("file:/home/project/串口打印"))
  }
  openWorkSpace = (urlStr: string) => {
    if (
      decodeURI(window.location.href)
        .split("/")
        .pop() != urlStr.split("/").pop()
    )
      this.ws.open(new URI(`${urlStr}`), { preserveWindow: true });
  };
  enableClick() {
    Logger.info("enableclick");
    Logger.info($("[id*=submitSrcButton]").removeAttr("disabled"));
    $("[id*=connectButton]").removeAttr("disabled");
  }
  continueExe = () => {
    this.udcService.continueExe();
  };
  terminateExe = () => {
    this.udcService.terminateExe();
  };
  openShell = () => {
    // if (this.applicationShell.activateWidget("udc-shell")) {
    //     alert("shell open")
    // }
    if (!this.applicationShell.isExpanded("bottom")) {
      this.commandRegistry.executeCommand("udc:shell:toggle");
    }
  };
  closeTabs = async () => {
    await this.applicationShell.closeTabs("main");
    await this.applicationShell.closeTabs("bottom");
    await this.applicationShell.closeTabs("right");
  };
  openFile(pid: string, filename: string) {
    this.udcService.openFile(pid, filename);
  }
  openFileView = () => {
    let _this = this;
    let wds = this.applicationShell.widgets;
    for (let item of wds) {
      console.log(item.id);
    }
    // _this.commandRegistry.executeCommand("UDC devices")
    _this.applicationShell.activateWidget("files");
    // _this.applicationShell.leftPanelHandler.dockPanel.addClass("theia-maximized")
    // _this.applicationShell.leftPanelHandler.setLayoutData({})
    // _this.applicationShell.closeTabs("left")
  };
  outputResult = (res: string, types?: string) => {
    // this.udcService.outputResult(res,types)
    color.enable();
    let client = this.uwc.getUdcWatcherClient();
    switch (types) {
      case "wrongAnswer":
        client.OnDeviceLog("::" + res.red);
        break;
      case "rightAnswer":
        client.OnDeviceLog("::" + res.blue);
        break;
      default:
        client.OnDeviceLog("::" + res.green);
        break;
    }
  };
  say = (verbose: string) => {
    this.messageService.info(verbose);
  };

  openDrawBoard = () => {
    this.commandRegistry.executeCommand("drawboardView:toggle");
  };
  connect = async (
    loginType: string,
    model: string,
    pid: string,
    timeout: string
  ): Promise<boolean> => {
    let res = await this.commandRegistry.executeCommand<boolean>(
      UdcCommands.Connect.id,
      loginType,
      model,
      pid,
      timeout
    );
    return res!;
  };
  isconnected = async () => {
    return this.udcService.is_connected();
  };

  disconnect = async () => {
    await this.commandRegistry.executeCommand(UdcCommands.DisConnect.id);
  };
  // config = (url: string, name: string, passwd: string) => {
  //     this.commandRegistry.executeCommand("iot.plugin.tinylink.scence.config", url, name, passwd)
  // }

  callUpdate = () => {
    this.update();
  };
  openExplorer = () => {
    this.viewType = "freeCoding";
    // this.applicationShell.activateWidget("files")
    // console.log("click file")
    // setTimeout(() => {
    //     $("#shell-tab-files").trigger("click")

    // }, 9000);
  };

  setCookie = (cookie: string) => {
    this.udcService.setCookie(`JSESSIONID=${cookie}; Path=/; HttpOnly`);
    // this.udcService.setCookie(cookie);
  };
  linkEdgeProjectAdd = (pid: string, deviceInfo: any) => {
    return this.udcService.addLinkEdgeProject(pid, deviceInfo);
  };
  linkEdgeConnect = (pid: string, threeTuple: any) => {
    return this.udcService.linkEdgeConnect(pid, threeTuple);
  };
  linkEdgeDevelop = (pid: string, indexStr: string) => {
    console.log("develop");
    return this.udcService.developLinkEdgeProject(pid, indexStr);
  };
  linkEdgeGetDevicesInfo = (pid: string) => {
    return this.udcService.getLinkEdgeDevicesInfo(pid);
  };
  postSrcFile = (fn: string) => {
    this.udcService.postSrcFile(fn);
  };

  postFreeCodingFile = (pid: string) => {
    this.udcService.postFreeCodingFile(pid);
  };
  initPid=(pid:string)=>{
    this.ppid=pid
  }
  openSrcFile = (pid: string) => {
    // this.commandRegistry.executeCommand(UdcCommands.OpenCommand.id, uri)
    this.ppid = pid;
    this.udcService.openPidFile(pid);
  };
  gotoCode(file: string) {
    if (this.ppid == undefined) {
      this.outputResult("err happened,try to refresh the page");
      return;
    }
    this.openFile(this.ppid, file);
  }

  gotoVideo = (uri: string, videoName: string) => {
    this.setSize(574);
    this.commandRegistry.executeCommand(
      UdcCommands.openViewPanel.id,
      uri,
      videoName
    );
  };
  storeData = (data: string) => {
    this.udcService.storeState(data);
  };
  getData = (type: string) => {
    console.log("in device widget type is :" + type);
    return this.udcService.getState(type);
  };
  setQueue = () => {
    this.udcService.setQueue();
  };
  setPidQueueInfo = (
    pid: string,
    content: {
      loginType: string;
      timeout: string;
      model: string;
      waitID: string;
      fns?: string;
      dirName?: string;
      deviceRole: string[] | undefined;
    }
  ) => {
    this.udcService.setPidInfos(pid, content);
  };
  initPidQueueInfo = (infos: string): Promise<string> => {
    console.log(infos + "....................................info");
    let infoObj = JSON.parse(infos);
    infos = JSON.stringify(infoObj);
    return this.udcService.initPidQueueInfo(infos);
  };
  setTinyLink = (name: string, passwd: string) => {
    this.udcService.setTinyLink(name, passwd);
  };
  config = () => {
    this.udcService.config();
  };
  saveLocal = (key: string, obj: object) => {
    // alert(`save key:${key},obj:${JSON.stringify(obj)}`)
    this.lss.setData(key, obj);
  };
  getLocal = async (key: string, obj: object) => {
    let val = await this.lss.getData(key, obj);
    // alert(`get key:${key},obj:${JSON.stringify(val)}`)
    return val;
  };
  programSingleFile = (pidAndFn: string) => {
    this.udcService.programSingleFile(pidAndFn);
  };
  postSimFile = (pid: string) => {
    this.udcService.postSimFile(pid);
  };
  saveAll = async () => {
    await this.applicationShell.saveAll();
  };
  train = (pid: string) => {
    this.udcService.train(pid);
  };
  virtualSubmit = (pid: string) => {
    this.udcService.virtualSubmit(pid);
  };
  virtualOpen = () => {
    this.commandRegistry.executeCommand("iot.plugin.tinylink.unity");
  };
  gotoVirtualScene = () => {
    if (
      this.applicationShell.getTabBarFor("main") != null &&
      this.applicationShell.getTabBarFor("main")!.titles.some((w, i) => {
        if (w.label == "unity") {
          this.applicationShell.revealWidget(w.owner.id);
          return true;
        } else {
          return false;
        }
      })
    ) {
      // this.applicationShell.getTabBarFor("main")!.
    } else {
      // this.outputResult("no find unity")
      this.virtualOpen();
    }
  };
  createOnelinkProject = async (project: string, pid: string) => {
    return this.udcService.createOnelinkProject(project, pid);
  };
  openDevice = async () => {
    this.udcService.openDevice();
  };
  openMobile = async () => {
    this.udcService.openMobile();
  };
  complileMobile = async () => {
    await this.saveAll();
    await this.udcService.compileMobile();
    window.blur();
    this.tinymobile!.focus();
    return true;
  };
  compileDevice = async () => {
    this.udcService.compileDevice();
    return true;
  };
  initLinkedgeConfig = async (pid: string) => {
    return this.udcService.initLinkedgeConfig(pid);
  };
  openConfigFile = (pid: string) => {
    this.udcService.openConfigFile(pid);
  };
}
