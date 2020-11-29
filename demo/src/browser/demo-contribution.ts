import { injectable, inject } from "inversify";
import {
  AbstractViewContribution,
  FrontendApplication,
} from "@theia/core/lib/browser";
import { DemoWidget } from "./demo-widget";
import { DemoService } from "../common/demo-service";
// import { DemoViewService } from './demo-widget-sservice';
import { ClientObject } from "../common/test";
import { DemoViewService } from "./demo-widget-sservice";
import { MenuContribution, MenuModelRegistry } from "@theia/core";

@injectable()
export class DemoContribution extends AbstractViewContribution<DemoWidget>
  implements MenuContribution {
  constructor(
    // @inject(DemoService) protected readonly ds:DemoService,
    @inject(DemoViewService) protected readonly dvs: DemoViewService
  ) // @inject(ClientObject)  protected readonly co: ClientObject
  {
    super({
      widgetId: "demo-view",
      widgetName: "LinkEdge-View",

      defaultWidgetOptions: {
        area: "left",

        // rank: 1380
      },
      toggleCommandId: "something",
    });
    //   this.co.register((somthing )=>{
    //       console.log("get")
    //     //  this.dvs.say(somthing)
    //   })
  }
  onStart?(app: FrontendApplication) {
    this.openView({ toggle: true, reveal: true, activate: true });
  }
  registerMenus(menus:MenuModelRegistry){
    let menuBar=menus.getMenu(["menubar","4_view"])
    menuBar.removeNode("demo-view")
  }
}
