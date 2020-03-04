import { ContainerModule,interfaces } from "inversify";
import { DemoContribution } from "./demo-contribution";
import {  bindViewContribution, createTreeContainer, TreeProps, defaultTreeProps,  WidgetFactory, WebSocketConnectionProvider, ContextMenuRenderer, Tree, TreeModel,  } from "@theia/core/lib/browser";
import { DemoWidget, DemoWidgetFactory } from "./demo-widget";
import { DemoViewService } from "./demo-widget-sservice";
import { ClientObject, Client } from "../common/test";
import { DemoService } from "../common/demo-service";
import { KeybindingContext, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { NavigatorActiveContext } from '@theia/navigator/lib/browser/navigator-keybinding-context';
import { createFileTreeContainer, FileTree, FileTreeModel, FileTreeWidget } from '@theia/filesystem/lib/browser';
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { ApplicationShell } from "@theia/core/lib/browser/shell/application-shell";
import{FileNavigatorTree} from  '@theia/navigator/lib/browser/navigator-tree'

import {
  FileNavigatorModel,
  FileNavigatorWidget,
  
} from "@theia/navigator/lib/browser/";
import { FileSystem } from "@theia/filesystem/lib/common/filesystem";
import { CommandService, SelectionService } from "@theia/core"
import { TabBarToolbarContribution } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import {createFileNavigatorContainer} from "@theia/navigator/lib/browser/navigator-container"
import {NAVIGATOR_CONTEXT_MENU} from "@theia/navigator/lib/browser/navigator-contribution"
export const FILE_NAVIGATOR_PROPS = <TreeProps>{
    ...defaultTreeProps,
    contextMenuPath: NAVIGATOR_CONTEXT_MENU,
    multiSelect: true,

    
    search: true,
    globalSelection: true
};

export default new ContainerModule(bind => {
    // add your contribution bindings here

  
    // bindFileNavigatorPreferences(bind);
    // bind(FileNavigatorFilter).toSelf().inSingletonScope();
    bind(FileNavigatorModel).toSelf().inSingletonScope()
    // bind(ContextMenuRenderer).toSelf().inSingletonScope()
    // bind(CommandService).toSelf().inSingletonScope()
    // bind(SelectionService).toSelf().inSingletonScope()
    // bind(WorkspaceService).toSelf().inSingletonScope()
    // bind(ApplicationShell).toSelf().inSingletonScope()
    // bind(FileSystem).toSelf().inSingletonScope()
    bind(FrontendApplicationContribution).toService(DemoContribution);
    bind(TabBarToolbarContribution).toService(DemoContribution);
    bind(KeybindingContext).to(NavigatorActiveContext).inSingletonScope();
    bind(DemoWidget).toDynamicValue(ctx =>
        createDemoWeiget(ctx.container)
    );
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
    // const child = createTreeContainer(parent);
    // child.rebind(TreeProps).toConstantValue({ ...defaultTreeProps, search: false });
    // child.bind(DemoWidget).toSelf();
    return creatContainer(parent).get(DemoWidget);
}
function creatContainer(parent: interfaces.Container){
    const child = createFileTreeContainer(parent);

    child.unbind(FileTree);
    child.bind(FileNavigatorTree).toSelf();
    child.rebind(Tree).toService(FileNavigatorTree);

    child.unbind(FileTreeModel);
    child.bind(FileNavigatorModel).toSelf();
    child.rebind(TreeModel).toService(FileNavigatorModel);

    child.unbind(FileTreeWidget);
    child.bind(DemoWidget).toSelf();

    child.rebind(TreeProps).toConstantValue(FILE_NAVIGATOR_PROPS);
    return child;

    // child.bind(NavigatorDecoratorService).toSelf().inSingletonScope();
    // child.rebind(TreeDecoratorService).toService(NavigatorDecoratorService);
    // bindContributionProvider(child, NavigatorTreeDecorator);

}
