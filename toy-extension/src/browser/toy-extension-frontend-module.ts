import { TreeWidget, TreeProps, defaultTreeProps, FrontendApplicationContribution } from '@theia/core/lib/browser';

import { HelloWorldExtensionCommandContribution } from './toy-extension-contribution';
import {
    CommandContribution,
} from "@theia/core/lib/common";

import { ContainerModule, interfaces } from "inversify";
import {
    createTreeContainer,
    bindViewContribution,
    WidgetFactory,
} from '@theia/core/lib/browser';
import { ToyViewWidgetFactory, ToyViewWidget } from './toy-tree-widget';
import { ToyViewContribution } from './toy-tree-widget-contribution';
import { ToyViewService } from './toy-tree-widget-service';
import '../../src/browser/styles/index.css';

export default new ContainerModule((bind: interfaces.Bind) => {
    // bind(DefaultOpenerService).toSelf()
    bind(CommandContribution).to(HelloWorldExtensionCommandContribution);
    bind(ToyViewWidgetFactory).toFactory(ctx => () => createToyViewWeiget(ctx.container));
    bind(ToyViewService).toSelf().inSingletonScope();
    bind(WidgetFactory).toService(ToyViewService);
    bindViewContribution(bind, ToyViewContribution);
    bind(FrontendApplicationContribution).toService(ToyViewContribution);
});
function createToyViewWeiget(parent: interfaces.Container): ToyViewWidget {
    const child = createTreeContainer(parent);
    child.rebind(TreeProps).toConstantValue({ ...defaultTreeProps, search: true });
    child.unbind(TreeWidget)
    child.bind(ToyViewWidget).toSelf();
    return child.get(ToyViewWidget);

}
