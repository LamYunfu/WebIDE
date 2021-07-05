import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
//import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { ProjectView } from './ProjectView';
import { BackendClient, OSdevBackendService, OSdevBackendServiceSymbol } from '../common/protocol';
import { WorkspaceService } from "@theia/workspace/lib/browser";
import URI from '@theia/core/lib/common/uri';
import { ApplicationShell } from '@theia/core/lib/browser';
import {CustomEditorManager} from "./new-editor-manager";
import { CommandRegistry } from '@theia/core';


@injectable()
export class OSdevExtensionWidget extends ReactWidget {

    static readonly ID = 'System Development';
    static readonly LABEL = 'System';


    @inject(OSdevBackendServiceSymbol)
    protected wbs:OSdevBackendService;

    @inject(CustomEditorManager) protected editorManager:CustomEditorManager;
    
    

    constructor(){
        super();
    }
     
    
    @postConstruct()
    protected async init(): Promise < void> {
        this.id = OSdevExtensionWidget.ID;
        this.title.label = OSdevExtensionWidget.LABEL;
        this.title.caption = OSdevExtensionWidget.LABEL;
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

    protected async projectCreation(config_json:string, otherConfig:string):Promise<void>{
        //alert(config_json);
      //  let config = JSON.parse(config_json);
      //  this.editorManager.setRemoteTag(config.osType, config.branch, config.projects[0].projectName);
        let result = await this.wbs.createProject(JSON.stringify(config_json), JSON.stringify(otherConfig));
        if(!result){
            alert("存在同名项目！");
        }
        //alert("文件夹创建完毕，开始打开右边的视图");
    }

    public libRemoteBurn(){
        this.wbs.remoteBurn();
    }
    // public searchFile(file_path:string){
    //     this.wbs.downLoadSingleFile(file_path);
    // }
}

@injectable()
export class BackendClientImpl implements BackendClient {
  @inject(WorkspaceService) protected readonly ws: WorkspaceService;
  @inject(ApplicationShell) protected applicationShell: ApplicationShell;
  @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry
   //打开文件的工作空间
   openWorkSpace = async (urlStr: string) => {
       if(urlStr.indexOf("home") != -1){

       }else{
        urlStr = "/" + urlStr;
       }
        // alert(urlStr);
        if (
        decodeURI(window.location.href)
            .split("/")
            .pop() != urlStr.split("/").pop() && 
        decodeURI(window.location.href)
            .split("\\")
            .pop() != urlStr.split("\\").pop()
        )
        //alert("打开工作空间是：" + urlStr);
        await this.ws.open(new URI(urlStr), { preserveWindow: true });
        //return;
        //关掉之前所有打开的文件
        //alert("the workspace has been opened successfully!");
        //this.applicationShell.closeTabs("main");
  };

  //打开文件导航栏
  openExplore(){
    //alert("创建项目后，点击菜单栏View -> Explore打开文件视图");
    //this.commandRegistry.executeCommand("fileNavigator:toggle");
  }
}