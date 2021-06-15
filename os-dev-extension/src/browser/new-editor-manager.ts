import { inject, injectable} from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { EditorManager, EditorOpenerOptions } from '@theia/editor/lib/browser/editor-manager';
import { WidgetOpenerOptions } from '@theia/core/lib/browser/widget-open-handler';
import { EditorWidget } from '@theia/editor/lib/browser/editor-widget';
import { OSdevBackendService, OSdevBackendServiceSymbol } from '../common/protocol';
//import { UdcService } from "../common/udc-service";
//import {OSdevExtensionWidget} from "os-dev-extension/lib/browser/os-dev-extension-widget";
@injectable()
export class CustomEditorManager extends EditorManager {
    //private static remoteTag:boolean = false;
    //@inject(OSdevExtensionWidget) protected os:OSdevExtensionWidget;
   // @inject(UdcService) protected udcService:UdcService;
   
   @inject(OSdevBackendServiceSymbol)
   protected wbs:OSdevBackendService;
    /**
     * 表示是系统开发，每次用户点击文件需要从远端下载文件
     */
    setOsDev(){
        //CustomEditorManager.remoteTag = true;
//       this.udcService.setParam(name,version,rootDir);
    }

    canHandle(uri: URI, options?: WidgetOpenerOptions): number {
        return 100;
    }

    /**
     * 表示是应用开发，用户直接打开文件
     */
    setAppDev(){
        //CustomEditorManager.remoteTag = false;
    }

    async open(uri: URI, options?: EditorOpenerOptions): Promise<EditorWidget> {
        if(uri.toString().includes("SystemDev")){
            //先从远端下载文件
            let path_uri:string = uri.toString();
            //console.log("从远端下载文件 " + uri.toString()); 
            //获取文件路径
            let a = path_uri.indexOf("/");
            let b = path_uri.indexOf("/", a+1);
            let c = path_uri.indexOf("/", b+1);
            let d = path_uri.indexOf("/", c+1);
            let file_path = path_uri.substr(d+1);
            console.log("截取的文件路径为：" + file_path);
            //下载该文件
            //console.log("是否已经注入了后端变量" + this.wbs.toString());
            if(file_path != "config.json"){
                //this.wbs.testReturnWord();
                await this.wbs.downLoadSingleFile(file_path, uri.toString(true));
            }
        }
        const editor = await super.open(uri, options);
        this.revealSelection(editor, options);
        return editor;
    }
    
}