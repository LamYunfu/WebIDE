import { DeviceViewService } from "./device-view-service";
import { WorkspaceService } from "@theia/workspace/lib/browser/";
import { injectable, inject } from "inversify";
import {
  AbstractViewContribution,
  FrontendApplicationContribution,
  FrontendApplication,
  ApplicationShell,
  WidgetManager,
} from "@theia/core/lib/browser";
import { DeviceViewWidget } from "./device-view-widget";
import { FrontendApplicationStateService } from "@theia/core/lib/browser/frontend-application-state";
import { CommandRegistry, MenuModelRegistry } from "@theia/core";
import { find } from "@phosphor/algorithm";
import { UdcService } from "../common/udc-service";
// import { UdcConsoleContribution } from "./udc-console-contribution";
// import { MaybePromise } from "@theia/core";
export const DEVICE_WIDGET_FACTORY_ID = "device-view";

@injectable()
export class DeviceViewContribution
  extends AbstractViewContribution<DeviceViewWidget>
  implements FrontendApplicationContribution {
  constructor(
    @inject(ApplicationShell) protected applicationShell: ApplicationShell,
    @inject(FrontendApplicationStateService)
    protected applicationState: FrontendApplicationStateService,
    @inject(CommandRegistry) protected registry: CommandRegistry,
    @inject(WorkspaceService) protected ws: WorkspaceService,
    @inject(WidgetManager) protected wm: WidgetManager,
    @inject(DeviceViewService) protected ds: DeviceViewService,
    @inject(UdcService) readonly udc: UdcService
  ) {
    super({

      widgetId: DEVICE_WIDGET_FACTORY_ID,
      widgetName: "Online IOT Study System",
      defaultWidgetOptions: {
        area: "left",
        rank: 574,
      
        // rank: 1380
      },
      toggleCommandId: "UDC devices",
    });
    
  }
  async onStart(app: FrontendApplication) {
    this.applicationState.onStateChanged(async (e) => {
      if (e == "initialized_layout") {
        console.log(" close tabs");
        //清除上次做题的状态，关闭所有打开的组件
        await this.applicationShell.closeTabs("main");
        await this.applicationShell.closeTabs("bottom");
        await this.applicationShell.closeTabs("right");
        await this.applicationShell.closeTabs("left");
        this.applicationShell.widgets.forEach(async (wg) => {
          await wg.close();
          //   alert("cc:" + wg.id);
        });
        let ld = this.applicationShell.getLayoutData();
        // console.log(JSON.stringify(ld))
        for (let wd of ld.leftPanel!.items!)
          if (wd.widget!.id != "files" && wd.widget!.id != "device-view")
            wd.widget!.close();
        // !find(this.applicationShell.getWidgets("left"), (wd) => {
        //   if (wd!.id == "files") return true;
        //   return false;
        // }) && this.registry.executeCommand("fileNavigator:toggle");
        !find(this.applicationShell.getWidgets("left"), (wd) => {
          if (wd!.id == "device-view") return true;
          return false;
        }) && this.registry.executeCommand("UDC devices");
        await this.applicationShell.revealWidget("device-view");
        ld = this.applicationShell.getLayoutData();
        ld.rightPanel!["size"] = 660;
        this.applicationShell.setLayoutData(ld);
        // this.registry.executeCommand("UDC devices")

        //
        // await this.applicationShell.closeTabs("bottom")
        // await this.applicationShell.closeTabs("right")
        // // this.registry.executeCommand("udc:shell:toggle")
        // this.applicationShell.activateWidget("device-view")
      }
      if (e == "ready") {
        // await this.applicationShell.revealWidget(DEVICE_WIDGET_FACTORY_ID)
        this.ds.openExplorer();
      }
      if(e=="closing_window"){
        this.udc.close()
        this.udc.disconnect()
      }
      // if (e == 'closing_window') {
      //     console.log("save")
      //     await this.applicationShell.saveAll()
      // }
    });
  }
  registerMenus(menus:MenuModelRegistry){
    let menuBar=menus.getMenu(["menubar","4_view"])
    menuBar.removeNode( DEVICE_WIDGET_FACTORY_ID)
  }
  async initializeLayout(app: FrontendApplication): Promise<void> {}
}
