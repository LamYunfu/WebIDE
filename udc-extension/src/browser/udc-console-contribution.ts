import { AbstractViewContribution, bindViewContribution, WidgetFactory} from '@theia/core/lib/browser';
import { BaseWidget, PanelLayout, Widget, Message, MessageLoop, StatefulWidget, CompositeTreeNode } from '@theia/core/lib/browser';
// import { injectable, interfaces } from "inversify";
import { injectable, inject, postConstruct, interfaces, Container } from 'inversify';
import { ConsoleWidget, ConsoleOptions } from '@theia/console/lib/browser/console-widget';
import { ContextKey, ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { UdcConsoleSession } from './udc-console-session';
import {InputViewWidget} from './inputWidget';
import { MenuModelRegistry } from '@theia/core';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';
export type InUdcReplContextKey = ContextKey<boolean>;
export const InUdcReplContextKey = Symbol('inUdcReplContextKey');


@injectable()
export class UdcConsoleWidget extends ConsoleWidget  {//输出模块

    @inject(InputViewWidget)
    readonly inputview: InputViewWidget;

    constructor() {
        super();
    }

    @postConstruct()
    protected async init(): Promise<void> {
        const { id, title, inputFocusContextKey } = this.options;
        const { label, iconClass, caption } = Object.assign({}, title);
        this.id = id;
        this.title.closable = true;
        this.title.label = label || id;
        if (iconClass) {
            this.title.iconClass = iconClass;
        }
        this.title.caption = caption || label || id;

        const layout = this.layout = new PanelLayout();

        this.content.node.classList.add(ConsoleWidget.styles.content);
        this.toDispose.push(this.content);
        layout.addWidget(this.content);

        // this.content.node.classList.add(ConsoleWidget.styles.content);
        // this.toDispose.push(this.inputview);
        // this.inputview.node.classList.add(ConsoleWidget.styles.input);
        // layout.addWidget(this.inputview);


        const inputWidget = new Widget();
        inputWidget.node.classList.add(ConsoleWidget.styles.input);
        layout.addWidget(inputWidget);

        const input = this._input = await this.createInput(inputWidget.node);
        this.toDispose.push(input);
        this.toDispose.push(input.getControl().onDidLayoutChange(() => this.resizeContent()));
        this.toDispose.push(input.getControl().onDidChangeConfiguration(({ fontInfo }) => fontInfo && this.updateFont()));
        // this.updateFont();
        // if (inputFocusContextKey) {
        //     this.toDispose.push(input.onFocusChanged(() => inputFocusContextKey.set(this.hasInputFocus())));
        // }
    }

    protected createInput(node: HTMLElement): Promise<MonacoEditor> {
        return this.editorProvider.createInline(this.options.input.uri, node, this.options.input.options);
    }

    async execute(): Promise<void> {
        const value = this.inputview.getValue();
        if (this.session) {
            const listener = this.content.model.onNodeRefreshed(() => {
                listener.dispose();
                this.revealLastOutput();
            });
            await this.session.execute(value);
        }
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
            // options: {
            //     autoSizing: true,
            //     minHeight: 2,
            //     maxHeight: 10
            // }
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
        bind(InputViewWidget).toSelf()
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