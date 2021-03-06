
import { JsonRpcServer } from "@theia/core/lib/common/messaging";

// common/protocol.ts
export const WIZARD_BACKEND_PATH = '/services/guildPageBackend';
// 变量声明
export const WizardBackendServiceSymbol = Symbol('WizardBackendServiceSymbol');
// 类型声明
export interface WizardBackendService extends JsonRpcServer<BackendClient>{
    createProject(jsonFile: string) : boolean
}
export const BackendClient = Symbol('BackendClient');
export interface BackendClient {
    openWorkSpace(urlStr:string):void;
}