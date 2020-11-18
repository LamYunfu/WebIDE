import { ContainerModule, interfaces } from 'inversify';
import { GroveViewService } from './grove-view-service';
import { GroveViewContribution } from './grove-view-contribution';
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
import { GroveViewWidgetFactory, GroveViewWidget } from './grove-view-widget';
import './styles/index.css';
import { bindContributionProvider } from '@theia/core/lib/common/contribution-provider';
import { GroveDecoratorService, GroveTreeDecorator } from './grove-decorator-service';
import { GroveService } from '../common/groveservice';
import { SERVICE_PATH, createCommonBind, GroveProxyObject, Client } from '../common/groveproxy';

export default new ContainerModule(bind => {
    bind(GroveViewWidgetFactory).toFactory(ctx =>
        () => createGroveViewWidget(ctx.container)
    );
    createCommonBind(bind)
    bind(GroveService).toDynamicValue(ctx=>{
        const wsp=ctx.container.get(WebSocketConnectionProvider)
       return wsp.createProxy<Client>(SERVICE_PATH,ctx.container.get(GroveProxyObject).getClient())
    })
    bind(GroveViewService).toSelf().inSingletonScope();
    bind(WidgetFactory).toService(GroveViewService);
    bindViewContribution(bind, GroveViewContribution);
    bind(FrontendApplicationContribution).toService(GroveViewContribution);
});

function createGroveViewWidget(parent: interfaces.Container): GroveViewWidget {
    const child = createTreeContainer(parent);

    child.rebind(TreeProps).toConstantValue({ ...defaultTreeProps, search: false });

    child.unbind(TreeWidget);
    child.bind(GroveViewWidget).toSelf();

    child.bind(GroveDecoratorService).toSelf().inSingletonScope();
    child.rebind(TreeDecoratorService).toDynamicValue(ctx => ctx.container.get(GroveDecoratorService)).inSingletonScope();
    bindContributionProvider(child, GroveTreeDecorator);

    return child.get(GroveViewWidget);
}
