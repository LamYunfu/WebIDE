import { injectable, inject } from 'inversify';
import { Event, Emitter, DisposableCollection } from '@theia/core';
import { WidgetFactory } from '@theia/core/lib/browser';
import { DrawboardViewWidget, DrawboardViewWidgetFactory, DrawboardSymbolInformationNode } from './drawboard-view-widget';
import { Widget } from '@phosphor/widgets';

@injectable()
export class DrawboardViewService implements WidgetFactory {

    id = 'drawboard-view';

    protected widget?: DrawboardViewWidget;
    protected readonly onDidChangeDrawboardEmitter = new Emitter<DrawboardSymbolInformationNode[]>();
    protected readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    protected readonly onDidSelectEmitter = new Emitter<DrawboardSymbolInformationNode>();
    protected readonly onDidOpenEmitter = new Emitter<DrawboardSymbolInformationNode>();

    constructor(@inject(DrawboardViewWidgetFactory) protected factory: DrawboardViewWidgetFactory) { }

    get onDidSelect(): Event<DrawboardSymbolInformationNode> {
        return this.onDidSelectEmitter.event;
    }

    get onDidOpen(): Event<DrawboardSymbolInformationNode> {
        return this.onDidOpenEmitter.event;
    }

    get onDidChangeDrawboard(): Event<DrawboardSymbolInformationNode[]> {
        return this.onDidChangeDrawboardEmitter.event;
    }

    get onDidChangeOpenState(): Event<boolean> {
        return this.onDidChangeOpenStateEmitter.event;
    }

    get open(): boolean {
        return this.widget !== undefined && this.widget.isVisible;
    }

    publish(roots: DrawboardSymbolInformationNode[]): void {
        if (this.widget) {
            this.widget.setDrawboardTree(roots);
            this.onDidChangeDrawboardEmitter.fire(roots);
        }
    }

    createWidget(): Promise<Widget> {
        this.widget = this.factory();
        const disposables = new DisposableCollection();
        disposables.push(this.widget.onDidChangeOpenStateEmitter.event(open => this.onDidChangeOpenStateEmitter.fire(open)));
        disposables.push(this.widget.model.onOpenNode(node => this.onDidOpenEmitter.fire(node as DrawboardSymbolInformationNode)));
        disposables.push(this.widget.model.onSelectionChanged(selection => this.onDidSelectEmitter.fire(selection[0] as DrawboardSymbolInformationNode)));
        this.widget.disposed.connect(() => {
            this.widget = undefined;
            disposables.dispose();
        });
        return Promise.resolve(this.widget);
    }
}
