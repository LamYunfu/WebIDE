import { ContainerModule } from "inversify";
import { HaaS100_widgetContribution } from "./haas100_widget-contribution";
import {
  bindViewContribution,
  FrontendApplicationContribution,
  WidgetFactory,
} from "@theia/core/lib/browser";

//import "./style/index.css";
import { HaaS100WidgetFactory } from "./haas100-widget-factory";
import { HaaS100Widget } from "./haas100_widget-widget";
// import { NewWidget } from "./new_widget-widget";yy

export default new ContainerModule((bind) => {
  bindViewContribution(bind, HaaS100_widgetContribution);
  bind(FrontendApplicationContribution).toService(HaaS100_widgetContribution);
  bind(HaaS100Widget)
    .toSelf()
    .inSingletonScope();
  bind(HaaS100WidgetFactory)
    .toSelf()
    .inSingletonScope();
  bind(WidgetFactory).toService(HaaS100WidgetFactory);
});
