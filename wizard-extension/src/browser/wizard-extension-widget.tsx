import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
//import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { ProjectView } from './ProjectView';
import { BackendClient, WizardBackendService, WizardBackendServiceSymbol } from '../common/protocol';
import { WorkspaceService } from "@theia/workspace/lib/browser";
import URI from '@theia/core/lib/common/uri';
import { ApplicationShell } from '@theia/core/lib/browser';


@injectable()
export class WizardExtensionWidget extends ReactWidget {

    static readonly ID = 'New Project';
    static readonly LABEL = 'New Project';


    @inject(WizardBackendServiceSymbol)
    protected wbs:WizardBackendService;

    constructor(){
        super();
    }
    
    
    @postConstruct()
    protected async init(): Promise < void> {
        this.id = WizardExtensionWidget.ID;
        this.title.label = WizardExtensionWidget.LABEL;
        this.title.caption = WizardExtensionWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-window-maximize'; // example widget icon.
        this.update();
    }

    protected render(): React.ReactNode {
        return <div id='widget-container'>
            <ProjectView projectCreation = {this.projectCreation.bind(this)}></ProjectView>
            {/* <button className='theia-button secondary' title='Display Message' onClick={_a => this.test()}>显示消息2</button> */}
        </div>
    }

    protected projectCreation(config_json:string, otherConfig:string):void{
        //alert(config_json);
        this.wbs.createProject(JSON.stringify(config_json), JSON.stringify(otherConfig));  
    }


}

@injectable()
export class BackendClientImpl implements BackendClient {
  @inject(WorkspaceService) protected readonly ws: WorkspaceService;
  @inject(ApplicationShell) protected applicationShell: ApplicationShell;
   //打开文件的工作空间
   openWorkSpace = (urlStr: string) => {
        urlStr = "/" + urlStr;
        // alert(urlStr);
        if (
        decodeURI(window.location.href)
            .split("/")
            .pop() != urlStr.split("/").pop() &&
        decodeURI(window.location.href)
            .split("\\")
            .pop() != urlStr.split("\\").pop()
        )
        console.log("so baby pull closer in the back seat");
        this.ws.open(new URI(urlStr), { preserveWindow: true }); 
        //关掉之前所有打开的文件
        //alert("the workspace has been opened successfully!");
        //this.applicationShell.closeTabs("main");
  };
}