import { injectable, inject } from "inversify";
import { WidgetFactory, Widget, ApplicationShell } from "@theia/core/lib/browser";
// import { IssueViewWidgetFactory, IssueViewWidget, IssueViewSymbolInformationNode } from "./issue-view-widget";
import { DisposableCollection } from "@theia/core/lib/common/disposable";
import { Emitter } from "@theia/core/lib/common/event";
import { DemoViewSymbolInformationNode, DemoWidgetFactory, DemoWidget } from "./demo-widget";

@injectable()
export class DemoViewService implements WidgetFactory {

    id: string = 'demo-view';
    protected readonly onDidChangeDemoEmitter = new Emitter<DemoViewSymbolInformationNode[]>();
    protected readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    protected readonly onDidOpenEmitter = new Emitter<DemoViewSymbolInformationNode>();
    protected readonly onDidSelectEmitter = new Emitter<DemoViewSymbolInformationNode>();
    protected widget?: DemoWidget;

    constructor(
        @inject(DemoWidgetFactory) protected factory: DemoWidgetFactory,
        @inject(ApplicationShell) protected shell: ApplicationShell

    ) { }
    createWidget(): Promise<Widget> {

        this.widget = this.factory();
        const disposables = new DisposableCollection();
        disposables.push(this.widget.onDidChangeOpenStateEmitter.event(open => this.onDidChangeOpenStateEmitter.fire(open)));
        disposables.push(this.widget.model.onOpenNode(node => this.onDidOpenEmitter.fire(node as DemoViewSymbolInformationNode)));
        disposables.push(this.widget.model.onSelectionChanged(selection => this.onDidSelectEmitter.fire(selection[0] as DemoViewSymbolInformationNode)))

        this.widget.disposed.connect(() => {
            this.widget = undefined;
            disposables.dispose();
        })
        return Promise.resolve(this.widget);
    }
    say(s:string){
        // alert(s)
    }
}
