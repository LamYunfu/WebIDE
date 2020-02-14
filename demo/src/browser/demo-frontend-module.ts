import { ContainerModule,interfaces } from "inversify";
import { DemoContribution } from "./demo-contribution";
import {  bindViewContribution, createTreeContainer, TreeProps, defaultTreeProps,  WidgetFactory, WebSocketConnectionProvider,  } from "@theia/core/lib/browser";
import { DemoWidget, DemoWidgetFactory } from "./demo-widget";
import { DemoViewService } from "./demo-widget-sservice";
import { ClientObject, Client } from "../common/test";
import { DemoService } from "../common/demo-service";
export default new ContainerModule(bind => {
    // add your contribution bindings here

    bind(DemoWidgetFactory).toFactory(ctx => () => createDemoWeiget(ctx.container));
    bind(DemoViewService).toSelf().inSingletonScope();
    bind(WidgetFactory).toService(DemoViewService);
    bindViewContribution(bind, DemoContribution);    
    bind(ClientObject).toSelf().inSingletonScope()
    bind(Client).to(ClientObject).inSingletonScope()
    bind(DemoService).toDynamicValue(ctx=>{
        const wsProvider =ctx.container.get(WebSocketConnectionProvider)
        const client =ctx.container.get(ClientObject)
       return wsProvider.createProxy<DemoService>("/services/somthing",client.fire())      
    })
    
 
});
function createDemoWeiget(parent: interfaces.Container):DemoWidget {
    const child = createTreeContainer(parent);
    child.rebind(TreeProps).toConstantValue({ ...defaultTreeProps, search: false });
    child.bind(DemoWidget).toSelf();
    return child.get(DemoWidget);
}
