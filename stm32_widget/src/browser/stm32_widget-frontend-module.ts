import { ContainerModule } from "inversify";
import { STM32_widgetContribution } from "./stm32_widget-contribution";
import {
  bindViewContribution,
  FrontendApplicationContribution,
  WidgetFactory,
  WebSocketConnectionProvider
} from "@theia/core/lib/browser";

//import "./style/index.css";
import { STM32WidgetFactory } from "./stm32-widget-factory";
import { BackendClientImpl, STM32Widget } from "./stm32_widget-widget";
import { STM32BackendServiceSymbol,STM32BackendService, STM32_BACKEND_PATH, BackendClient } from '../common/protocol';
// import { NewWidget } from "./new_widget-widget";yy

export default new ContainerModule((bind) => {
  bindViewContribution(bind, STM32_widgetContribution);
  bind(FrontendApplicationContribution).toService(STM32_widgetContribution);
  bind(STM32Widget)
    .toSelf()
    .inSingletonScope();
  bind(STM32WidgetFactory)
    .toSelf()
    .inSingletonScope();
  bind(WidgetFactory).toService(STM32WidgetFactory);
  bind(STM32BackendServiceSymbol).toDynamicValue(ctx => {
    const connection = ctx.container.get(WebSocketConnectionProvider);
    const backendClient: BackendClient = ctx.container.get(BackendClient);
    return connection.createProxy<STM32BackendService>(STM32_BACKEND_PATH, backendClient);
  }).inSingletonScope();
  bind(BackendClient).to(BackendClientImpl).inSingletonScope();
  //   bind(WidgetFactory)
  //     .toDynamicValue((ctx) => ({
  //       id: NewWidget.ID,
  //       createWidget: () => ctx.container.get<NewWidget>(NewWidget),
  //     }))
  //     .inSingletonScope();
});
