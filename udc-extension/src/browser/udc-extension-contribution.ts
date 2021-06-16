import { OutExperimentSetting } from './outer-experiment-setting';
import { DeviceViewWidget } from './device-view-widget';
import { UI_Setting } from './isEnable';
import { LocalBurnData } from './localburn_data';
import {
  WidgetManager,
  OpenerService,
  CommonMenus,
  quickCommand,
} from "@theia/core/lib/browser";
import { CommandRegistry, InMemoryResources } from "@theia/core";
import { UdcWatcher } from "./../common/udc-watcher";
import { AboutDialog } from "./about-dailog";
import { UdcService } from "../common/udc-service";
import { injectable, inject } from "inversify";
import {
  DebugAdapterContribution,
  DebugAdapterSessionFactory,
  CommunicationProvider,
  DebugAdapterSession,
} from "@theia/debug/lib/common/debug-model";
import { DebugConfiguration } from "@theia/debug/lib/common/debug-configuration";
import {
  CommandContribution,
  MenuContribution,
  MenuModelRegistry,
  MessageService,
  MAIN_MENU_BAR,
  Command,
} from "@theia/core/lib/common";
import {
  LanguageGrammarDefinitionContribution,
  TextmateRegistry,
  GrammarDefinition,
} from "@theia/monaco/lib/browser/textmate";
import { WorkspaceService } from "@theia/workspace/lib/browser/";
import { FileDialogService } from "@theia/filesystem/lib/browser";
import { FileSystem } from "@theia/filesystem/lib/common";
import {
  QuickOpenService,
  QuickOpenModel,
  QuickOpenItem,
  QuickOpenItemOptions,
  ApplicationShell,
  KeybindingRegistry,
} from "@theia/core/lib/browser";
import { UdcConsoleSession } from "./udc-console-session";
import { DeviceViewService } from "./device-view-service";
import URI from "@theia/core/lib/common/uri";
import { EditorManager } from "@theia/editor/lib/browser";
import { EditorQuickOpenService } from "@theia/editor/lib/browser/editor-quick-open-service";
import { LampWidget } from "./lamp";
import { WebSocketChannel } from "@theia/core/lib/common/messaging/web-socket-channel";
import {NewWidgetFactory} from "new_widget/lib/browser/new-widget-factory";
import {Esp32WidgetFactory} from "esp32_widget/lib/browser/esp32-widget-factory";
//import {STM32WidgetFactory} from "stm32_widget/lib/browser/stm32-widget-factory";
import {HaaS100WidgetFactory} from "haas100_widget/lib/browser/haas100-widget-factory";
import {STM32WidgetFactory} from "stm32_widget/lib/browser/stm32-widget-factory";
import {DrawboardViewService} from "drawboard-extension/lib/browser/drawboard-view-service"

export const UdcExtensionCommand = {
  id: "UdcExtension.command",
  label: "test node server",
};

export namespace UdcMenus {
  export const UDC = [...MAIN_MENU_BAR, "1_udc"];
  //在主菜单新增project菜单
  export const project = [...MAIN_MENU_BAR, "1_project"];
  export const linkedge = [...MAIN_MENU_BAR, "2_edge"];
  export const UDC_FUNCTION = [...UDC, "2_function"];
  export const UDC_ABOUT = [...UDC, "3_about"];
}

export namespace UdcCommands {
  const UDC_MENU_CATEGORY = "Udc Menu";
  const LINKEDGE_CATEGORY = "linkedge";
  const PROJECT_MENU_CATEGORY = "Projet Menu"
  export const OpenCommand: Command = {
    id: "OpenCommand",
    category: UDC_MENU_CATEGORY,
    label: "no label",
  };

  export const GotoCommand: Command = {
    id: "gotoCode",
    category: UDC_MENU_CATEGORY,
    label: "no label",
  };
  export const Connect: Command = {
    id: "udc.menu.connect",
    category: UDC_MENU_CATEGORY,
    label: "connect",
  };

  export const DisConnect: Command = {
    id: "udc.menu.disconnect",
    category: UDC_MENU_CATEGORY,
    label: "disconnect",
  };

  export const GetDevList: Command = {
    id: "udc.menu.get_devlist",
    category: UDC_MENU_CATEGORY,
    label: "devlist",
  };

  export const Program: Command = {
    id: "udc.menu.program",
    category: UDC_MENU_CATEGORY,
    label: "program",
  };
  export const LocalBurnView: Command = {
    id: "udc.menu.local_burn_view",
    category: UDC_MENU_CATEGORY,
    label: "local_burn",
  };
  export const LocalBurn: Command = {
    id: "udc.menu.local_burn",
    category: UDC_MENU_CATEGORY,
    label: "local_burn",
  };
  export const Compile_Save: Command = {
    id: "udc.menu.compile_save",
    category: UDC_MENU_CATEGORY,
    label: "compile save",
  };
  export const local_compile_burn: Command = {
    id: "udc.menu.local_compile_burn",
    category: UDC_MENU_CATEGORY,
    label: "local_compile_burn",
  };
  export const PrintLog: Command = {
    id: "printLog",
    category: UDC_MENU_CATEGORY,
    label: "print_log",
  };
  export const SetPort: Command = {
    id: "setPort",
    category: UDC_MENU_CATEGORY,
    label: "set_port",
  };
  export const Reset: Command = {
    id: "udc.menu.reset",
    category: UDC_MENU_CATEGORY,
    label: "reset",
  };
  export const Judge: Command = {
    id: "udc.menu.judge",
    category: UDC_MENU_CATEGORY,
    label: "judge",
  };

  export const ABOUT: Command = {
    id: "udc.menu.about",
    category: UDC_MENU_CATEGORY,
    label: "About",
  };
  export const openLab: Command = {
    id: "udc.menu.openLab",
    category: UDC_MENU_CATEGORY,
    label: "openLab",
  };
  export const JudgeButton: Command = {
    id: "udc.menu.judgebutton",
    category: UDC_MENU_CATEGORY,
    label: "judgebutton",
  };
  export const PostSrcFile: Command = {
    id: "udc.menu.postsrcfile",
    category: UDC_MENU_CATEGORY,
    label: "postsrcfile",
  };
  export const literalAnalysis: Command = {
    id: "udc.menu.Analysis",
    category: UDC_MENU_CATEGORY,
    label: "codeLiteralAnalysis",
  };
  export const QueryStatus: Command = {
    id: "udc.menu.querystatus",
    category: UDC_MENU_CATEGORY,
    label: "querystatus",
  };
  export const SetJudgeHostandPort: Command = {
    id: "udc.menu.setjudgehostandport",
    category: UDC_MENU_CATEGORY,
    label: "setjudgehostandport",
  };
  export const openViewPanel: Command = {
    id: "openViewPanel",
    label: "no label",
  };
  export const openFile: Command = {
    id: "openFile",
    label: "no label",
  };
  export const SubmitOnMenu: Command = {
    id: "submitonmenu",
    label: "connect",
  };
  export const connectLinkedge: Command = {
    id: "connectLinkedge",
    category: LINKEDGE_CATEGORY,
    label: "connect",
  };
  export const releaseLinkedge: Command = {
    id: "realseLinkedge",
    category: LINKEDGE_CATEGORY,
    label: "release",
  };
  export const compileEdge: Command = {
    id: "compileEdge",
    category: LINKEDGE_CATEGORY,
    label: "Compile",
  };
  export const startLinkedge: Command = {
    id: "startLinkedge",
    category: LINKEDGE_CATEGORY,
    label: "start",
  };
  export const stopLinkedge: Command = {
    id: "stopLinkedge",
    category: LINKEDGE_CATEGORY,
    label: "stop",
  };
  export const LinkedgeView:Command={
    id:"LinkEdge",
    category:LINKEDGE_CATEGORY,
    label:"OpenLinkedgeView"
  }
  export const esp32View:Command={
    id:"esp32",
    category:LINKEDGE_CATEGORY,
    label:"OpenLinkedgeView"
  }
  export const stm32View:Command={
    id:"stm32",
    category:LINKEDGE_CATEGORY,
    label:"OpenLinkedgeView"
  }
  export const arduinoView:Command={
    id:"arduino",
    category:LINKEDGE_CATEGORY,
    label:"OpenLinkedgeView"
  }
  export const haas100View:Command={
    id:"haas100",
    category:LINKEDGE_CATEGORY,
    label:"OpenLinkedgeView"
  }
  export const ldcShellView:Command={
    id:"ldcShell",
    category:LINKEDGE_CATEGORY,
    label:"OpenLDCShell"
  }  
  export const wizardView:Command={
    id:"wizard",
    category:PROJECT_MENU_CATEGORY,
    label:"NewProject"
  }
}

@injectable()
export class UdcExtensionCommandContribution
  implements CommandContribution, QuickOpenModel {
  selectDeviceModel = "";
  x: Window | null = null;
  url: string = "";

  async onType(
    lookFor: string,
    acceptor: (items: QuickOpenItem<QuickOpenItemOptions>[]) => void
  ): Promise<void> {
    let items = await this.udcService.list_models();
    if (!items.includes(lookFor) && lookFor != "") {
      items.push(lookFor);
    }
    let opts = items.map(
      (t) =>
        new QuickOpenItem({
          label: t,
          description: t,
          run: (mode: any) => {
            this.selectDeviceModel = t;
            return true;
          },
        })
    );
    acceptor(opts);
  }

  constructor(
    @inject(MessageService) private readonly messageService: MessageService,
    @inject(UdcService) protected readonly udcService: UdcService,
    @inject(AboutDialog) private readonly aboutDialog: AboutDialog,
    @inject(LampWidget) private readonly lp: LampWidget,
    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService,
    @inject(FileDialogService)
    protected readonly fileDialogService: FileDialogService,
    @inject(FileSystem) protected readonly fileSystem: FileSystem,
    @inject(UdcWatcher) protected readonly udcWatcher: UdcWatcher,
    @inject(QuickOpenService)
    protected readonly quickOpenService: QuickOpenService,

    @inject(UdcConsoleSession)
    protected readonly udcConsoleSession: UdcConsoleSession,
    @inject(DeviceViewService)
    protected readonly deviceViewService: DeviceViewService,
    @inject(EditorManager) protected em: EditorManager,
    @inject(InMemoryResources) protected imr: InMemoryResources,
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry,
    @inject(ApplicationShell) protected applicationShell: ApplicationShell,
    @inject(KeybindingRegistry) protected kr: KeybindingRegistry,
    @inject(DeviceViewService) protected ds: DeviceViewService,
    @inject(WidgetManager) protected wm: WidgetManager,
    @inject(EditorQuickOpenService) readonly eqos: EditorQuickOpenService,
    @inject(OpenerService) readonly os: OpenerService,
    @inject(NewWidgetFactory) readonly nf: NewWidgetFactory,
    @inject(Esp32WidgetFactory) readonly esp32WidgetFactory: Esp32WidgetFactory,
    @inject(HaaS100WidgetFactory) readonly hass100WidgetFactory: HaaS100WidgetFactory,
    @inject(DrawboardViewService) readonly drawboardFactory: DrawboardViewService,
    @inject(LocalBurnData) readonly lbd :LocalBurnData,
    @inject(UI_Setting) readonly ui_Setting:UI_Setting,
    @inject(OutExperimentSetting) readonly outExperimentSetting:OutExperimentSetting,
    @inject(STM32WidgetFactory) readonly stm32:STM32WidgetFactory
  ) {
    this.udcWatcher.onConfigLog(
      async (data: { name: string; passwd: string }) => {
        let tmp = data;
        let drawboardwidget = this.drawboardFactory.widget;
        // drawboardwidget.showNumber();
        // drawboardwidget.showImage();
        if (data.name == "openSrcFile") {
          console.log(data.passwd);
          // this.commandRegistry.executeCommand(UdcCommands.OpenCommand.id,`file://`+data.passwd)
          console.log("open file :" + data.passwd)
          await this.em.open(new URI("file://" + data.passwd));
          // this.os.getOpener(new URI(data.passwd)).then(async (res) => {

          //   await res.open(new URI("file://" + data.passwd));
          // });
          return;
        } else if (data.name == "openWorkspace") {
          await this.ds.openWorkspace(data.passwd);
          return;
        } else if (data.name == "openShell") { 
          this.deviceViewService.openShell();
          return;
        } else if (data.name == "submitEnable") {
          this.deviceViewService.enableClick();
          return;
        } else if (data.name == "submitEnableWithJudge") {
          this.deviceViewService.approveClick();
          return;
        } else if (data.name == "executeSelectPanel") {
          this.deviceViewService.openExecutePanel();
          return;
        }  else if (data.name == "local_burn") {
          let myHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
        });
          fetch(`http://localhost:${this.lbd.port}${data.passwd}`,
          {
              method: 'GET',
              headers: myHeaders,
              mode: 'cors'
          })
          return;
        } else if( data.name=="research"&&this.outExperimentSetting.expType=="research"){
          console.log("research!!!")
          let ob ={
            code:0,
            message:"ok",
            data:{
              url:data.passwd
            }
          }
          this.udcService.notifyResearcher()
          window.opener.postMessage(JSON.stringify(ob),"*")        
          return
        }     
        else if (data.name == "redirect") {
          // // this.url=data.passwd
          this.ds.openTinyMobile(data.passwd);
          // this.x= window.open("http://120.55.102.225:12359/phone/index.html")
          // setTimeout(() => {
          //     this.x!.postMessage(this.url,"*")
          // }, 2000);
          return;
        }
        applicationShell.closeTabs("bottom");
        // applicationShell.closeTabs("left")
        console.log(JSON.stringify(data) + "::::::front ");
        this.commandRegistry.executeCommand(
          "iot.plugin.tinylink.scence.config",
          "http://tinylink.cn:12352/tinylink/tinylinkApp/login.php",
          tmp.name,
          tmp.passwd
        );
        this.commandRegistry.executeCommand(
          "iot.plugin.tinylink.scence.node",
          tmp.name,
          tmp.passwd
        );
      }
    );
    
    //把后端返回的信息打印到ldc shell里面
    this.udcWatcher.onDeviceLog((data: string) => {
      // console.log("data is :" + data + "............................")
      //let drawboardwidget = this.drawboardFactory.widget;
      //drawboardwidget.showNumber();
      let notPrint = false;
      let array = data.split(":");
      let log = array
        .slice(2)
        .join(":")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      let lp = this.nf.widget;
      let esp32Lamp = this.esp32WidgetFactory.widget;
      let a = log.match("(0E0010)|(0E0011)");             //与Arduino的亮灯进行匹配
      let esp32Match = log.match("(0E0012)|(0E0013)");    //与esp32的开关灯日志进行匹配
      let stm32Match = log.match("rgb");           //与stm32亮灯日志进行匹配
      let haas100Lamp = this.hass100WidgetFactory.widget;
      let stm32Lamp = this.stm32.widget;
      //判断是不是HaaS100控制灯亮灭的
      let n = log.search(/LED\s[1-5]/);
      if(n != -1){
        notPrint = true;
        //console.log("该对象是否存在8" + haas100Lamp.haasLamp);
        haas100Lamp.haasLamp.lightChange(log.substring(n));
      }
      
      if (esp32Match != null){
        notPrint = true;
        if(esp32Lamp.lamp){
          if (esp32Match[0].trim() == "0E0013") {
            esp32Lamp.lamp.lightoff();
            return;
          } else if (esp32Match[0].trim() == "0E0012") {
            esp32Lamp.lamp.lighton();
            return;
          }
        }
      }
      else if (a != null) {
        notPrint = true;
        if (lp.lp) {
          if (a[0].trim() == "0E0010") {
            lp.lp.lightoff();
            return;
          } else if (a[0].trim() == "0E0011") {
            lp.lp.lighton();
            return;
          }
        }
      }else if (stm32Match != null){
        //调用stm32接口控制灯亮灭
        let rgb_str = log.substr(log.indexOf("rgb") + 6, 5);
        let rgb_num = rgb_str.split(",").map(Number);
        console.log(rgb_num.map(String));
        stm32Lamp.lamp.lightChange(rgb_num);
        console.log(rgb_str);
      } else {
        //在arduino开发板显示屏幕上输出内容
        this.udcConsoleSession.appendLine(log);
        log = log.replace(
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ""
        );
        let nt = log.replace(/^\[.*\]/g, "").trim();
        if (!lp.lp) return;
        if (nt.length > 13) {
          lp.lp.writeOnScreen(nt.substr(0, 10) + "...");
        } else {
          lp.lp.writeOnScreen(nt);
        }
      }
    });

    this.udcWatcher.onDeviceList((data) => {
      this.deviceViewService.push(data);
    });
  }

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(UdcCommands.PrintLog,{
      execute:(log:string )=>{
        this.udcConsoleSession.appendLine(log)
      }
    })
    registry.registerCommand(UdcCommands.esp32View,{
      isEnabled:()=>this.ui_Setting.esp32Status,
      execute:()=>{
       registry.executeCommand('esp32_widget:command')
      }
    })
    registry.registerCommand(UdcCommands.stm32View,{
      isEnabled:()=>this.ui_Setting.stm32Status,
      execute:()=>{
       registry.executeCommand('STM32_widget:command')
      }
    })
    registry.registerCommand(UdcCommands.ldcShellView,{
      isEnabled:()=>this.ui_Setting.ldcShellStatus,
      execute:()=>{
       registry.executeCommand("udc:shell:toggle")
      }
    })
    registry.registerCommand(UdcCommands.arduinoView,{
      isEnabled:()=>this.ui_Setting.arduinoStatus,
      execute:()=>{
       registry.executeCommand("new_widget:command")
      }
    })
    //注册点击HaaS100之后的事件，调出HaaS100的图片
    registry.registerCommand(UdcCommands.haas100View,{
      //设置是否可点击
      isEnabled:()=>this.ui_Setting.haas100Status,
      execute:()=>{
       registry.executeCommand("haas100_widget:command")
      }
    })
    registry.registerCommand(UdcCommands.SetPort,{
      execute:(log:any )=>{
        this.lbd.port=log
      }
    })
    registry.registerCommand(UdcCommands.LinkedgeView, {
      isEnabled:()=>this.ui_Setting.linkedgeViewStatus,
      execute: () => {
        registry.executeCommand("something")
      },
    });
    registry.registerCommand(UdcCommands.ABOUT, {
      execute: () => {
        this.aboutDialog.open();
      },
    });
    registry.registerCommand(UdcCommands.openLab, {
      execute: () => {
        this.applicationShell.addWidget(this.lp, {
          area: "right",
        });
      },
    });
    registry.registerCommand(UdcCommands.startLinkedge, {
      execute: () => {
        this.udcService.linkEdgeConnect("32", { action: "start" });
      },
    });
    registry.registerCommand(UdcCommands.stopLinkedge, {
      execute: () => {
        this.udcService.linkEdgeConnect("32", { action: "stop" });
      },
    });
    registry.registerCommand(UdcCommands.connectLinkedge, {
      execute: () => {
        this.udcService.linkEdgeConnect("32", { action: "connect" });
      },
    });
    registry.registerCommand(UdcCommands.releaseLinkedge, {
      isEnabled:()=>this.ui_Setting.linkedgeViewStatus,
      execute: () => {
        this.udcService.linkEdgeConnect("32", { action: "release" });
      },
    });
    registry.registerCommand(UdcCommands.compileEdge, {
      isEnabled:()=>this.ui_Setting.linkedgeCompileStatus,
      execute: () => {
        this.udcService.tinyEdgeCompile("35");
      },
    });
    registry.registerCommand(UdcCommands.OpenCommand, {
      execute: async (uri: URI | string) => {
        // this.imr.add(uri,"")

        console.log("Exec uri open :" + uri);
        if (typeof uri == "string") {
          console.log(uri);
          uri = new URI(uri);
        }
        this.em
          .open(uri)
          .then((res) => console.log("openscc"), (err) => console.log(err));
      },
    });
    registry.registerCommand(UdcCommands.openFile, {
      execute: async (pid: string, filename: string) => {
        // this.imr.add(uri,"")
        await this.udcService.openFile(pid, filename);
      },
    });

    registry.registerCommand(UdcCommands.Connect, {
      execute: async (
        loginType: string,
        model: string,
        pid: string,
        timeout: string
      ) => {
        console.log("pid in front end :" + pid);
        // let connected = await this.udcService.is_connected();
        // if (connected === true) {
        //     this.messageService.info('Already Connected');
        // } else {
        let res = await this.udcService.connect(loginType, model, pid, timeout);
        return res;
        // .then(async re => {
        // this.messageService.info(re)
        //     }).catch(err => {
        //         this.messageService.error(err)
        //     })
        // }
      },
    });

    registry.registerCommand(UdcCommands.DisConnect, {
      execute: () => {
        this.udcService
          .disconnect()
          .then((re) => {
            // this.messageService.info(re)
          })
          .catch((err) => {
            this.messageService.error(err);
          });
      },
    });
    registry.registerCommand(UdcCommands.literalAnalysis, {
      execute: (pid) => {
        this.ds.literalAnalysis();
      },
    });
    registry.registerCommand(UdcCommands.GotoCommand, {
      execute: (file: string) => {
        this.ds.gotoCode(file);
      },
    });
    registry.registerCommand(UdcCommands.openViewPanel, {
      execute: async (uri: string, videoName: string) => {
        console.log("<<<<<<<<<<<<<<<<<<<<=video name" + videoName);
        registry.executeCommand("iot.plugin.tinylink.compile", uri, videoName);
      },
    });
    registry.registerCommand(UdcCommands.LocalBurnView, {
      isEnabled:()=>this.ui_Setting.remoteBurnStatus,
      execute: async () => {
       
        registry.executeCommand("iot.plugin.LocalBurner");
      },
    });
    registry.registerCommand(UdcCommands.JudgeButton, {
      execute: () => {
        this.udcService
          .disconnect()
          .then((re) => {
            this.messageService.info(re);
          })
          .catch((err) => {
            this.messageService.error(err);
          });
      },
    });
    registry.registerCommand(UdcCommands.Compile_Save, {
      execute: () => {
        this.outExperimentSetting.expType="research"
        this.commandRegistry.executeCommand(UdcCommands.local_compile_burn.id)
      },
    });
    // registry.registerCommand(UdcCommands.QueryStatus, {
    //     execute: (x: string) => {
    //         this.udcService.queryStatus(x).then((out) => console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" + out))
    //         .catch(err => {
    //             this.messageService.error(err)
    //         })
    //     }
    // })

    registry.registerCommand(UdcCommands.GetDevList, {
      execute: () => {
        this.udcService.get_devices().then((re) => {
          for (let k in re) {
            this.messageService.info(k + " use=" + re[k]);
          }
        });
      },
    });
    registry.registerCommand(UdcCommands.SubmitOnMenu, {
      isEnabled:()=>this.ui_Setting.remoteBurnStatus,
      execute: () => {
        // this.applicationShell.activateWidget("files")
        this.applicationShell.saveAll();
        this.ds.submitOnMenu();
      },
    });
    registry.registerCommand(UdcCommands.LocalBurn, {
      execute: () => {
        // this.applicationShell.activateWidget("files")
        this.applicationShell.saveAll();
        this.ds.localBurnOnMenu(false);
      },
    });
    registry.registerCommand(UdcCommands.local_compile_burn, {
      isEnabled:()=>this.ui_Setting.remoteCompileStatus,
      execute: () => {
        // this.applicationShell.activateWidget("files")
        this.applicationShell.saveAll();
        this.ds.localBurnOnMenu(true);
      },
    });
    registry.registerCommand(UdcCommands.Reset, {
      execute: async () => {
        let dev_list = await this.udcService.get_devices();
        let devstr = "";
        for (let k in dev_list) {
          devstr = k;
          break;
        }
        this.udcService
          .control(devstr, "reset")
          .then((re) => {
            let result = re === true ? "reset succeed" : "reset failed";
            this.messageService.info(result);
          })
          .catch((err) => {
            this.messageService.error(err);
          });
      },
    });
    //注册打开Project wizard命令
    registry.registerCommand(UdcCommands.wizardView,{
      execute:()=>{
       registry.executeCommand("wizard-extension:command")
      }
    })
    this.kr.registerKeybinding({
      command: "submitonmenu",
      keybinding: "ctrl+m",
    });
    this.kr.registerKeybinding({
      command: "local_burn",
      keybinding: "",
    });
  }
}
@injectable()
export class debugAdapterSessionFactory implements DebugAdapterSessionFactory {
  get(
    sessionId: string,
    communicationProvider: CommunicationProvider
  ): DebugAdapterSession {
    return {
      id: sessionId,
      start: (channel: WebSocketChannel): Promise<void> => {
        return new Promise<void>((res) => {
          res();
        });
      },
      stop: (): Promise<void> => {
        return new Promise<void>((res) => {
          res();
        });
      },
    };
  }
}

@injectable()
export class DAC implements DebugAdapterContribution {
  type = "embedcpp";
  label = "embedcpp";
  languages = ["cpp"];
  debugAdapterSessionFactory = {
    get(
      sessionId: string,
      communicationProvider: CommunicationProvider
    ): DebugAdapterSession {
      console.log("debug:+++");
      return {
        id: sessionId,
        start: (channel: WebSocketChannel): Promise<void> => {
          return new Promise<void>((res) => {
            res();
          });
        },
        stop: (): Promise<void> => {
          return new Promise<void>((res) => {
            res();
          });
        },
      };
    },
  };
  provideDebugAdapterExecutable = (config: DebugConfiguration) => {
    console.log("type:" + config.type);
    return undefined;
  };
}
@injectable()
export class UdcExtensionMenuContribution implements MenuContribution {
  registerMenus(menus: MenuModelRegistry): void {
    menus.registerSubmenu(UdcMenus.UDC, "LinkLab");
    //在主菜单栏上注册Project这个菜单栏
    menus.registerSubmenu(UdcMenus.project, "Project");
    // menus.registerSubmenu([...UdcMenus.UDC, 'submit'], 'submit');
      // menus.registerSubmenu([...UdcMenus.UDC, 'submit'], 'submit');
      menus.registerMenuAction([...UdcMenus.project], {
        commandId: UdcCommands.wizardView.id,
        label: "New Project",
        icon: "x",
        order: "a_1",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        commandId: UdcCommands.SubmitOnMenu.id,
        label: "Remote Burn",
        icon: "x",
        order: "a_2",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        
        commandId: UdcCommands.local_compile_burn.id,
        label: "Compile",
        icon: "x",
        order: "a_1",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        commandId: UdcCommands.LocalBurnView.id,
        label: "Local Burn",
        icon: "x",
        order: "a_3",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        commandId: UdcCommands.Compile_Save.id,
        label: "Save Binary",
        icon: "x",
        order: "a_3",
      });
      let sub =UdcMenus.UDC
      let t =[...sub ,"1_subtest"]
      menus.registerSubmenu(t,"Virtual Device"); 
      menus.registerMenuAction([...t], {
        commandId: UdcCommands.esp32View.id,
        label: "Esp32",
        icon: "x",
        order: "a_3",
      });
      menus.registerMenuAction([...t], {
        commandId: UdcCommands.stm32View.id,
        label: "STM32",
        icon: "x",
        order: "a_5",
      });
      menus.registerMenuAction([...t], {
        commandId: UdcCommands.arduinoView.id,
        label: "Arduino",
        icon: "x",
        order: "a_3",
      });
      menus.registerMenuAction([...t], {
        commandId: UdcCommands.haas100View.id,
        label: "HaaS100",
        icon: "x",
        order: "a_4",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        commandId: UdcCommands.compileEdge.id,
        label: "Edge Compile",
        icon: "x",
        order: "a_5",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        commandId: UdcCommands.LinkedgeView.id,
        label: "Open Linkedge",
        icon: "x",
        order: "a_6",
      });
      menus.registerMenuAction([...UdcMenus.UDC], {
        commandId: UdcCommands.ldcShellView.id,
        label: "Open LDC Shell",
        icon: "x",
        order: "a_6",
      });
    

    // menus.registerSubmenu(UdcMenus.linkedge, "linkedge");
    // // menus.registerSubmenu([...UdcMenus.UDC, 'submit'], 'submit');
    // menus.registerMenuAction([...UdcMenus.linkedge], {
    //   commandId: UdcCommands.connectLinkedge.id,
    //   label: "connect",
    //   icon: "x",
    //   order: "a_1"
    // });
    // menus.registerMenuAction([...UdcMenus.linkedge], {
    //   commandId: UdcCommands.releaseLinkedge.id,
    //   label: "release",
    //   icon: "x",
    //   order: "a_2"
    // });
    // menus.registerMenuAction([...UdcMenus.linkedge], {
    //   commandId: UdcCommands.startLinkedge.id,
    //   label: "start",
    //   icon: "x",
    //   order: "a_3"
    // });
    // menus.registerMenuAction([...UdcMenus.linkedge], {
    //   commandId: UdcCommands.stopLinkedge.id,
    //   label: "stop",
    //   icon: "x",
    //   order: "a_4"
    // });
    menus.unregisterMenuAction({
      commandId: "outlineView:toggle ",
    });
    menus.unregisterMenuAction({
      commandId: "callhierachy:toggle",
    });
    menus.unregisterMenuAction({
      commandId: "output:toggle",
    });
    menus.unregisterMenuAction({
      commandId: "scmView:toggle",
    });
    menus.unregisterMenuAction({
      commandId: "scmView:toggle",
    });
    menus.unregisterMenuAction({
      commandId: quickCommand.id,
      label: "Find Command....",
    });
    // console.log(menus.getMenu(['menubar']).children.length)
    // for(let item of menus.getMenu(['menubar']).children ){
    //     console.log(item.id)
    // }

    let menuBar = menus.getMenu(["menubar"]);
    menuBar.removeNode("1_file")
    menuBar.removeNode("9_help");
    menuBar.removeNode("7_terminal");
    menuBar.removeNode("6_debug");
    menuBar.removeNode("");
    menuBar.removeNode("3_selection")
    menuBar=menus.getMenu(["menubar","4_view","1_views"])
    menuBar.removeNode("drawboardView:toggle")
    menuBar.removeNode("debug:toggle")
    menuBar.removeNode("device-view")
    menuBar.removeNode("debug:console:toggle")
    menuBar.removeNode("outlineView:toggle")
    menuBar.removeNode("pluginsView:toggle")
    menuBar.removeNode("problemsView:toggle")
    menuBar.removeNode("search-in-workspace.toggle")
    menuBar=menus.getMenu(["menubar","4_view"])
    menuBar.removeNode("2_layout")

    // menus.registerMenuAction([...UdcMenus.UDC], { commandId:UdcCommands.OpenCommand.id });
  }
}

@injectable()
export class UdcExtensionHighlightContribution
  implements LanguageGrammarDefinitionContribution {
  readonly id = "cpp";
  readonly scopeName = "source.cpp";
  readonly config: monaco.languages.LanguageConfiguration = {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: "(", close: ")" },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "/*", close: " */", notIn: ["string"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: new RegExp("^\\s*#pragma\\s+region\\b"),
        end: new RegExp("^\\s*#pragma\\s+endregion\\b"),
      },
    },
  };
  readonly pyId = "python";
  readonly pyConfig: monaco.languages.LanguageConfiguration = {
    comments: {
      lineComment: "#",
    },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: "(", close: ")" },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: '"', close: '"', notIn: ["string"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: new RegExp("^\\s*#pragma\\s+region\\b"),
        end: new RegExp("^\\s*#pragma\\s+endregion\\b"),
      },
    },
    onEnterRules: [
      {
        beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  };

  registerTextmateLanguage(registry: TextmateRegistry): void {
    monaco.languages.register({
      id: this.id,
      extensions: [
        ".cpp",
        ".cc",
        ".cxx",
        ".hpp",
        ".hh",
        ".hxx",
        ".h",
        ".ino",
        ".inl",
        ".ipp",
        "cl",
        ".c",
      ],
      aliases: ["C++", "Cpp", "cpp", "c"],
    });
    monaco.languages.setLanguageConfiguration(this.id, this.config);
    registry.registerTextmateGrammarScope(this.scopeName, {
      async getGrammarDefinition() {
        return {
          format: "json",
          content: require("../../data/cpp.tmLanguage.json"),
        };
      },
    });
    registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    monaco.languages.register({
      id: this.pyId,
      extensions: [
        ".py",
        ".rpy",
        ".pyw",
        ".cpy",
        ".gyp",
        ".gypi",
        ".snakefile",
        ".smk", 
        
      ],
      aliases: ["Python", "py"],
      firstLine: "^#!\\s*/.*\\bpython[0-9.-]*\\b",
    });

    monaco.languages.setLanguageConfiguration(this.pyId, this.pyConfig);

    const platformGrammar = require("../../data/MagicPython.tmLanguage.json");
    registry.registerTextmateGrammarScope("source.python", {
      async getGrammarDefinition(): Promise<GrammarDefinition> {
        return {
          format: "json",
          content: platformGrammar,
        };
      },
    });

    const cGrammar = require("../../data/MagicRegExp.tmLanguage.json");
    registry.registerTextmateGrammarScope("source.regexp.python", {
      async getGrammarDefinition(): Promise<GrammarDefinition> {
        return {
          format: "json",
          content: cGrammar,
        };
      },
    });
    registry.mapLanguageIdToTextmateGrammar(this.pyId, "source.python");
        monaco.languages.register({
	      id: "myjs",
	            extensions: [
		            ".js",       
			          ],
				        aliases: ["JavaScript", "js"]
					    });
					        // monaco.languages.setLanguageConfiguration(this.pyId, this.config);
						    const jsplatformGrammar = require("../../data/MagicJS.tmLanguage.json");
						        registry.registerTextmateGrammarScope("source.js", {
							      async getGrammarDefinition(): Promise<GrammarDefinition> {
								              return {
									                format: "json",
											          content: jsplatformGrammar,
												          };
													        },
														    });

														        registry.mapLanguageIdToTextmateGrammar("myjs", "source.js");
															    
															    monaco.languages.register({
															          id: "html",
																        extensions: [
																	        ".html",       
																		      ],
																		            aliases: ["html"]
																			        });
																				    // monaco.languages.setLanguageConfiguration(this.pyId, this.config);
																				        const htmlplatformGrammar = require("../../data/html.tmLanguage.json");
																					    registry.registerTextmateGrammarScope("text.html.basic", {
																					          async getGrammarDefinition(): Promise<GrammarDefinition> {
																							          return {
																								            format: "json",
																									              content: htmlplatformGrammar,
																										              };
																											            },
																												        });

																													    registry.mapLanguageIdToTextmateGrammar("html", "text.html.basic");
																													        monaco.languages.register({
																														      id: "json",
																														            extensions: [
																															            ".json",       
																																          ],
																																	        aliases: ["json"]
																																		    });
																																		        // monaco.languages.setLanguageConfiguration(this.pyId, this.config);
																																			    const jsonplatformGrammar = require("../../data/json.tmLanguage.json");
																																			        registry.registerTextmateGrammarScope("source.json", {
																																				      async getGrammarDefinition(): Promise<GrammarDefinition> {
																																					              return {
																																						                format: "json",
																																								          content: jsonplatformGrammar,
																																									          };
																																										        },
																																											    });
																																											        registry.mapLanguageIdToTextmateGrammar("json", "source.json");
  }
}
