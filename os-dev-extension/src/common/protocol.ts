import { JsonRpcServer } from "@theia/core/lib/common/messaging";
//import URI from "@theia/core/lib/common/uri";

// common/protocol.ts
export const OSDEV_BACKEND_PATH = '/services/OSdevBackend';
// 变量声明
export const OSdevBackendServiceSymbol = Symbol('OSdevBackendServiceSymbol');
// 类型声明
export interface OSdevBackendService extends JsonRpcServer<BackendClient>{
    createProject(jsonFile: string, otherConfig:string) : Promise<boolean>
    downLoadSingleFile(file_path:string, uri:string):void;
    testReturnWord():string;
    remoteBurn():void;
}
export const BackendClient = Symbol('BackendClient');
export interface BackendClient {
    openWorkSpace(urlStr:string):void;
    openExplore():void;
    openShell():void;
}