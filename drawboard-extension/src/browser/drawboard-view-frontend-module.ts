import { ContainerModule, interfaces } from 'inversify';
import { DrawboardViewService } from './drawboard-view-service';
import { DrawboardViewContribution } from './drawboard-view-contribution';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import {
    FrontendApplicationContribution,
    createTreeContainer,
    TreeWidget,
    bindViewContribution,
    TreeProps,
    defaultTreeProps,
    TreeDecoratorService,
    WebSocketConnectionProvider
} from '@theia/core/lib/browser';
import { DrawboardViewWidgetFactory, DrawboardViewWidget } from './drawboard-view-widget';
import '../../src/browser/styles/index.css';
import { bindContributionProvider } from '@theia/core/lib/common/contribution-provider';
import { DrawboardDecoratorService, DrawboardTreeDecorator } from './drawboard-decorator-service';
import { DrawboardService } from '../common/drawboardservice';
import { SERVICE_PATH, createCommonBind, ProxyObject, Client } from '../common/drawboardproxy';

export default new ContainerModule(bind => {
    bind(DrawboardViewWidgetFactory).toFactory(ctx =>
        () => createDrawboardViewWidget(ctx.container)
    );
    createCommonBind(bind)
    bind(DrawboardService).toDynamicValue(ctx=>{
        const wsp=ctx.container.get(WebSocketConnectionProvider)
       return wsp.createProxy<Client>(SERVICE_PATH,ctx.container.get(ProxyObject).getClient())
    })
    bind(DrawboardViewService).toSelf().inSingletonScope();
    bind(WidgetFactory).toService(DrawboardViewService);
    bindViewContribution(bind, DrawboardViewContribution);
    bind(FrontendApplicationContribution).toService(DrawboardViewContribution);
});

function createDrawboardViewWidget(parent: interfaces.Container): DrawboardViewWidget {
    const child = createTreeContainer(parent);

    child.rebind(TreeProps).toConstantValue({ ...defaultTreeProps, search: false });

    child.unbind(TreeWidget);
    child.bind(DrawboardViewWidget).toSelf();

    child.bind(DrawboardDecoratorService).toSelf().inSingletonScope();
    child.rebind(TreeDecoratorService).toDynamicValue(ctx => ctx.container.get(DrawboardDecoratorService)).inSingletonScope();
    bindContributionProvider(child, DrawboardTreeDecorator);

    return child.get(DrawboardViewWidget);
}
