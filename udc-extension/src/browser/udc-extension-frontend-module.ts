import { UI_Setting } from './isEnable';
import { LocalBurnData } from './localburn_data';
import { ViewContainer } from "@theia/core/lib/browser/view-container";
import {
  FileTreeWidget,
  FileTreeModel,
  FileTree
} from "@theia/filesystem/lib/browser";
import { UdcConsoleContribution } from "./udc-console-contribution";
import {
  DeviceViewDecoratorService,
  DeviceTreeDecorator
} from "./decorator-view-service";
import { UdcWatcher } from "./../common/udc-watcher";
import { UdcService } from "./../common/udc-service";
import { AboutDialog, AboutDialogProps } from "./about-dailog";
import {
  UdcExtensionCommandContribution,
  UdcExtensionMenuContribution,
  UdcExtensionHighlightContribution,
  DAC,
  debugAdapterSessionFactory
} from "./udc-extension-contribution";
import {
  DebugAdapterSessionFactory,
  CommunicationProvider,
  DebugAdapterSession
} from "@theia/debug/lib/common/debug-model";
import {
  CommandContribution,
  MenuContribution,
  bindContributionProvider
} from "@theia/core/lib/common";
import { LanguageGrammarDefinitionContribution } from "@theia/monaco/lib/browser/textmate/textmate-contribution";
import { ContainerModule, interfaces } from "inversify";
import { udcServicePath } from "../common/udc-service";
import {
  WebSocketConnectionProvider,
  createTreeContainer,
  TreeProps,
  defaultTreeProps,
  bindViewContribution,
  FrontendApplicationContribution,
  WidgetFactory,
  TreeDecoratorService,
  OpenHandler
} from "@theia/core/lib/browser";
import { createCommonBindings } from "../common/udc-common-module";
import {
  DeviceViewWidgetFactory,
  DeviceViewWidget
} from "./device-view-widget";
import { DeviceViewContribution } from "./devices-view-contribution";
import { DeviceViewService } from "./device-view-service";
import "../../src/browser/styles/index.css";
import { LampWidget } from "./lamp";
import { DebugAdapterContribution } from "@theia/debug/lib/common/debug-model";
import { NewWidgetFactory } from "new_widget/lib/browser/new-widget-factory";
export default new ContainerModule((bind, _unbind, _isBound) => {
  // bind(DebugAdapterSessionFactory).to(debugAdapterSessionFactory);
  // bind(DebugAdapterContribution).to(DAC);
  bind(CommandContribution).to(UdcExtensionCommandContribution);
  bind(MenuContribution).to(UdcExtensionMenuContribution);
  bind(LanguageGrammarDefinitionContribution).to(
    UdcExtensionHighlightContribution
  );
  bind(UdcService)
    .toDynamicValue(ctx => {
      const provider = ctx.container.get(WebSocketConnectionProvider);
      const udcWatcher = ctx.container.get(UdcWatcher);
      return provider.createProxy<UdcService>(
        udcServicePath,
        udcWatcher.getUdcWatcherClient()
      );
    })
    .inSingletonScope();
  createCommonBindings(bind);
  bind(UI_Setting).toSelf().inSingletonScope()
  bind(AboutDialog)
    .toSelf()
    .inSingletonScope();
  bind(AboutDialogProps).toConstantValue({ title: "UDC" });
  bind(DeviceViewWidgetFactory).toFactory(ctx => () =>
    createDeviceViewWeiget(ctx.container)
  );
  bind(DeviceViewService)
    .toSelf()
    .inSingletonScope();
  bind(LampWidget)
    .toSelf()
    .inSingletonScope();
  // bind(LampViewWidgetFactory).toFactory(ctx=>()=>creatLamp(ctx.container))
  bind(WidgetFactory).toService(DeviceViewService);
  bindViewContribution(bind, DeviceViewContribution);
  // bind(ApplicationShell).toSelf().inSingletonScope()//
  bind(FrontendApplicationContribution).toService(DeviceViewContribution);
  UdcConsoleContribution.bindContribution(bind);
  bind(FileTreeWidget)
    .toSelf()
    .inSingletonScope();
  bind(FileTreeModel)
    .toSelf()
    .inSingletonScope();
  bind(FileTree)
    .toSelf()
    .inSingletonScope();
  bind(ViewContainer)
    .toSelf()
    .inSingletonScope();
    bind(LocalBurnData) .toSelf().inSingletonScope();
});

function createDeviceViewWeiget(
  parent: interfaces.Container
): DeviceViewWidget {
  const child = createTreeContainer(parent);
  child
    .rebind(TreeProps)
    .toConstantValue({ ...defaultTreeProps, search: false });
  child.bind(DeviceViewWidget).toSelf();
  child
    .bind(DeviceViewDecoratorService)
    .toSelf()
    .inSingletonScope();
  child
    .rebind(TreeDecoratorService)
    .toDynamicValue(ctx => ctx.container.get(DeviceViewDecoratorService))
    .inSingletonScope();
  bindContributionProvider(child, DeviceTreeDecorator);
  return child.get(DeviceViewWidget);
}
