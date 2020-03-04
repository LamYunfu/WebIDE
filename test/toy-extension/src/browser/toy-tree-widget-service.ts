import { injectable, inject } from "inversify";
import { WidgetFactory, Widget } from "@theia/core/lib/browser";
import { ToyViewWidgetFactory, ToyViewWidget, ToyViewSymbolInformationNode } from "./toy-tree-widget";
// import { IssueViewWidgetFactory, IssueViewWidget, IssueViewSymbolInformationNode } from "./issue-view-widget";
import { DisposableCollection } from "@theia/core/lib/common/disposable";
import { Emitter } from "@theia/core/lib/common/event";



@injectable()
export class ToyViewService implements WidgetFactory{
    id: string = 'Toy-view';

    protected readonly onDidChangeToyEmitter = new Emitter<ToyViewSymbolInformationNode[]>();
    protected readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    protected readonly onDidOpenEmitter = new Emitter<ToyViewSymbolInformationNode>();
    protected readonly onDidSelectEmitter = new Emitter<ToyViewSymbolInformationNode>();
    protected widget?: ToyViewWidget;

    constructor(
        @inject(ToyViewWidgetFactory) protected factory: ToyViewWidgetFactory
    ){}

    createWidget():Promise<Widget> {
        this.widget = this.factory();
        const disposables = new DisposableCollection();
        disposables.push(this.widget.onDidChangeOpenStateEmitter.event(open => this.onDidChangeOpenStateEmitter.fire(open)));
        disposables.push(this.widget.model.onOpenNode(node => this.onDidOpenEmitter.fire(node as ToyViewSymbolInformationNode)));
        disposables.push(this.widget.model.onSelectionChanged(selection => this.onDidSelectEmitter.fire(selection[0] as ToyViewSymbolInformationNode)))

        this.widget.disposed.connect(()=>{
            this.widget = undefined;
            disposables.dispose();
        })
        return Promise.resolve(this.widget);
    }


}
