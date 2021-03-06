import {  injectable} from "inversify";
import { BackendClient, WizardBackendService} from "../common/protocol";
import * as path from "path";
import * as fs from "fs-extra";
import {ROOTPATH} from "udc-extension/lib/setting/backend-config";
//import URI from "@theia/core/lib/common/uri";

@injectable()
export class WizardBackendServiceImpl implements WizardBackendService {
   
    client : BackendClient;

    createProject(jsonFile: string) : boolean {
        let config = JSON.parse(JSON.parse(jsonFile));
        console.log(config);
        //let pageConfig = JSON.parse(jsonFile);
        let folderName:string = config.project_name;
        let rootPath:string = ROOTPATH;
        //拼接文件夹路径
        let uri = path.join(rootPath, folderName);
        //let uri = `${rootPath}/${folderName}`
        console.log("路径是：" + uri);
        //创建文件夹
         fs.existsSync(uri) ? "" : fs.mkdirSync(uri);
        // console.log("111111111");
        // //新建配置文件config.json
        // let configJsonUri = path.join(uri, "config.json");
        // //将配置json内容jsonFile,存储起来，放在新建文件config.json内
        // if(fs.existsSync(configJsonUri)){
        //     fs.removeSync(configJsonUri);
        // }
        // console.log("222222222");
        // //以美化的方式写入json配置文件
        // fs.writeFileSync(configJsonUri, JSON.stringify(config, null, "\t"));
        // console.log("33333333333");
        //打开调用前端方法文件夹工作空间，在右边显示
        uri.replace(/\\/g,"\/");
        this.client.openWorkSpace(uri);
        console.log("44444444444");

        return true;
    }

    dispose(): void {
        // do nothing
    }
    setClient(client: BackendClient): void {
        this.client = client;
    }

    
}



