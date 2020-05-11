import { ContainerModule } from "inversify";
import { New_widgetContribution } from "./new_widget-contribution";
import {
  bindViewContribution,
  FrontendApplicationContribution,
  WidgetFactory,
} from "@theia/core/lib/browser";

import "../../src/browser/style/index.css";
import { NewWidgetFactory } from "./new-widget-factory";
import { NewWidget } from "./new_widget-widget";
// import { NewWidget } from "./new_widget-widget";yy

export default new ContainerModule((bind) => {
  bindViewContribution(bind, New_widgetContribution);
  bind(FrontendApplicationContribution).toService(New_widgetContribution);
  bind(NewWidget)
    .toSelf()
    .inSingletonScope();
  bind(NewWidgetFactory)
    .toSelf()
    .inSingletonScope();
  bind(WidgetFactory).toService(NewWidgetFactory);
  //   bind(WidgetFactory)
  //     .toDynamicValue((ctx) => ({
  //       id: NewWidget.ID,
  //       createWidget: () => ctx.container.get<NewWidget>(NewWidget),
  //     }))
  //     .inSingletonScope();
});
