import { ContainerModule } from "inversify";
import { Esp32_widgetContribution } from "./esp32_widget-contribution";
import {
  bindViewContribution,
  FrontendApplicationContribution,
  WidgetFactory,
} from "@theia/core/lib/browser";

//import "./style/index.css";
import { Esp32WidgetFactory } from "./esp32-widget-factory";
import { Esp32Widget } from "./esp32_widget-widget";
// import { NewWidget } from "./new_widget-widget";yy

export default new ContainerModule((bind) => {
  bindViewContribution(bind, Esp32_widgetContribution);
  bind(FrontendApplicationContribution).toService(Esp32_widgetContribution);
  bind(Esp32Widget)
    .toSelf()
    .inSingletonScope();
  bind(Esp32WidgetFactory)
    .toSelf()
    .inSingletonScope();
  bind(WidgetFactory).toService(Esp32WidgetFactory);
  //   bind(WidgetFactory)
  //     .toDynamicValue((ctx) => ({
  //       id: NewWidget.ID,
  //       createWidget: () => ctx.container.get<NewWidget>(NewWidget),
  //     }))
  //     .inSingletonScope();
});
