import { AbstractViewContribution, bindViewContribution, WidgetFactory} from '@theia/core/lib/browser';
import { injectable, interfaces } from "inversify";
import { ConsoleWidget, ConsoleOptions } from '@theia/console/lib/browser/console-widget';
import { ContextKey, ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { UdcConsoleSession } from './udc-console-session';
import { MenuModelRegistry } from '@theia/core';
export type InUdcReplContextKey = ContextKey<boolean>;
export const InUdcReplContextKey = Symbol('inUdcReplContextKey');


@injectable()
export class UdcConsoleWidget extends ConsoleWidget  {//输出模块
    constructor() {
        super();
    }
    upupup(): void {
        if (this.session) {
            const listener = this.content.model.onNodeRefreshed(() => {
                listener.dispose();
                this.revealLastOutput();
            });
        }
    }
}
/**
 * LDC Shell底部日志打印模块
 */
@injectable()
export class UdcConsoleContribution extends AbstractViewContribution< UdcConsoleWidget>{//前端Widget配置
    constructor() {
        super({
            widgetId: UdcConsoleContribution.options.id,
            widgetName: UdcConsoleContribution.options.title!.label!,
            defaultWidgetOptions: {
                area: 'bottom'
            },
            
            toggleCommandId: 'udc:shell:toggle',
            toggleKeybinding: 'ctrlcmd+shift+c'
        });
    }
        static options: ConsoleOptions = {
        id: 'udc-shell',
        title: {
            label: 'LDC shell',
            iconClass: 'theia-debug-console-icon'
        }
        ,
        input: {
            uri: UdcConsoleSession.uri,
        }

    };
    registerMenus(menus:MenuModelRegistry){
        let menuBar=menus.getMenu(["menubar","4_view"])
        menuBar.removeNode("udc-shell")
      }
    static create(parent: interfaces.Container): ConsoleWidget {
        const inputFocusContextKey = parent.get<InUdcReplContextKey>(InUdcReplContextKey);
        const child = UdcConsoleWidget.createContainer(parent, {
            ...UdcConsoleContribution.options,
            inputFocusContextKey
        });
        const widget = child.get(UdcConsoleWidget);
        widget.session = child.get(UdcConsoleSession);

        return widget;
    }   
    static bindContribution(bind: interfaces.Bind): void {//定义容器绑定方式
        bind(InUdcReplContextKey).toDynamicValue(({ container }) =>
            container.get(ContextKeyService).createKey('inUdcRepl', false)
        ).inSingletonScope()
        bind(UdcConsoleWidget).toSelf()
        bind(UdcConsoleSession).toSelf().inSingletonScope()
        bindViewContribution(bind, UdcConsoleContribution).onActivation((context, _) => {
            context.container.get(UdcConsoleSession)
            return _;
        });
        bind(WidgetFactory).toDynamicValue(({ container }) => ({
            id: UdcConsoleContribution.options.id,
            createWidget: () => UdcConsoleContribution.create(container)
        }));
    }
    
    
}