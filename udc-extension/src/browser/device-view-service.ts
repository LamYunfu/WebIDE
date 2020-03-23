import { Logger } from './../node/util/logger';
import { injectable, inject } from "inversify";
import { WidgetFactory, Widget, ApplicationShell } from "@theia/core/lib/browser";
import { DeviceViewWidgetFactory, DeviceViewWidget, DeviceViewSymbolInformationNode } from "./device-view-widget";
// import { IssueViewWidgetFactory, IssueViewWidget, IssueViewSymbolInformationNode } from "./issue-view-widget";
import { DisposableCollection } from "@theia/core/lib/common/disposable";
import { Emitter } from "@theia/core/lib/common/event";

@injectable()
export class DeviceViewService implements WidgetFactory {

    id: string = 'device-view';
    protected readonly onDidChangeDeviceEmitter = new Emitter<DeviceViewSymbolInformationNode[]>();
    protected readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();
    protected readonly onDidOpenEmitter = new Emitter<DeviceViewSymbolInformationNode>();
    protected readonly onDidSelectEmitter = new Emitter<DeviceViewSymbolInformationNode>();
    protected widget?: DeviceViewWidget;


    constructor(
        @inject(DeviceViewWidgetFactory) protected factory: DeviceViewWidgetFactory,
        @inject(ApplicationShell) protected shell: ApplicationShell

    ) { }
    openExecutePanel() {
        this.widget!.openExecutePanel()
    }

    createWidget(): Promise<Widget> {

        this.widget = this.factory();
        const disposables = new DisposableCollection();
        disposables.push(this.widget.onDidChangeOpenStateEmitter.event(open => this.onDidChangeOpenStateEmitter.fire(open)));
        disposables.push(this.widget.model.onOpenNode(node => this.onDidOpenEmitter.fire(node as DeviceViewSymbolInformationNode)));
        disposables.push(this.widget.model.onSelectionChanged(selection => this.onDidSelectEmitter.fire(selection[0] as DeviceViewSymbolInformationNode)))

        this.widget.disposed.connect(() => {
            this.widget = undefined;
            disposables.dispose();
        })
        return Promise.resolve(this.widget);
    }
    setLampStatus(status:boolean){
        this.widget!.changeLampStatus(status)
    }
    approveClick() {
        this.widget!.setSubmitEnableWithJudgeTag(true)
    }
    openTinyMobile(url:string){
        this.widget!.openTinyMobile(url)
    }
    enableClick() {
        Logger.info(this.widget == null)
        this.widget!.enableClick()
    }
    openShell() {
        this.widget!.openShell()
    }
    push(devices: { [key: string]: number }): void {
    }
    openWorkspace(url: string) {
        this.widget!.openWorkSpace(url)
    }
    openExplorer() {
        this.widget!.viewType != "" && this.shell.revealWidget("files")
    }
    submitOnMenu() {
        // this.widget!.openFileView()
        this.widget!.submitOnMenu()
    }
    public clearDevices(): void {
    }
    close() {
        this.widget!.close()
    }
    literalAnalysis() {
        this.widget!.literalAnalysis()
    }
    gotoCode(file: string) {
        this.widget!.gotoCode(file)
    }

}
