import {  injectable} from "inversify";
import { BackendClient, GuildBackendService} from "../common/protocol";
// import * as path from "path";
// import * as fs from "fs-extra";
// import {ROOTPATH} from "udc-extension/lib/setting/backend-config";
//import URI from "@theia/core/lib/common/uri";

@injectable()
export class GuildBackendServiceImpl implements GuildBackendService {
   
    client : BackendClient;

    createProject(jsonFile: string) : boolean {
        //解析从前端传递过来的json配置文件
        console.log("蓝云甫");
        console.log(jsonFile);
        //let config = JSON.parse(JSON.parse(jsonFile));
        //console.log(config);

        return true;
    }

    test():string{
        return "来了来了";
    }
    dispose(): void {
        // do nothing
    }
    setClient(client: BackendClient): void {
        this.client = client;
    }

    
}


