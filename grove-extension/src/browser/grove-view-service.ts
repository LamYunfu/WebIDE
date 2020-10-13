import { injectable, inject } from 'inversify';
import { Event, Emitter, DisposableCollection } from '@theia/core';
import { WidgetFactory } from '@theia/core/lib/browser';
import { GroveViewWidget, GroveViewWidgetFactory, GroveSymbolInformationNode } from './grove-view-widget';
import { Widget } from '@phosphor/widgets';
import { GroveProxyObject } from '../common/groveproxy';

@injectable()
export class GroveViewService implements WidgetFactory {

    id = 'grove-view';
    protected widget?: GroveViewWidget;
    protected readonly onDidChangeGroveEmitter = new Emitter<GroveSymbolInformationNode[]>();
    protected readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    protected readonly onDidSelectEmitter = new Emitter<GroveSymbolInformationNode>();
    protected readonly onDidOpenEmitter = new Emitter<GroveSymbolInformationNode>();

    constructor(@inject(GroveViewWidgetFactory) protected factory: GroveViewWidgetFactory,
    @inject(GroveProxyObject) protected readonly po :GroveProxyObject ) {
        this.widget = this.factory()
        let _this = this;
        this.po.register(e=>{
            console.log("返回一个GroveViewWidget对象");
            console.log("_this.widget是：" + _this.widget);
            if(_this.widget != undefined){
                //console.log(e);
                _this.widget.setDotData(e);
            }
        })
     }

    get onDidSelect(): Event<GroveSymbolInformationNode> {
        return this.onDidSelectEmitter.event;
    }

    get onDidOpen(): Event<GroveSymbolInformationNode> {
        return this.onDidOpenEmitter.event;
    }

    get onDidChangeGrove(): Event<GroveSymbolInformationNode[]> {
        return this.onDidChangeGroveEmitter.event;
    }

    get onDidChangeOpenState(): Event<boolean> {
        return this.onDidChangeOpenStateEmitter.event;
    }

    get open(): boolean {
        return this.widget !== undefined && this.widget.isVisible;
    }
    
    publish(roots: GroveSymbolInformationNode[]): void {
        if (this.widget) {
            this.widget.setGroveTree(roots);
            this.onDidChangeGroveEmitter.fire(roots);
        }
    }
    createWidget(): Promise<Widget> {
        this.widget = this.factory();
        const disposables = new DisposableCollection();
        disposables.push(this.widget.onDidChangeOpenStateEmitter.event(open => this.onDidChangeOpenStateEmitter.fire(open)));
        disposables.push(this.widget.model.onOpenNode(node => this.onDidOpenEmitter.fire(node as GroveSymbolInformationNode)));
        disposables.push(this.widget.model.onSelectionChanged(selection => this.onDidSelectEmitter.fire(selection[0] as GroveSymbolInformationNode)));
        this.widget.disposed.connect(() => {
            this.widget = undefined;
            disposables.dispose();
        });
        return Promise.resolve(this.widget);
    }
}
