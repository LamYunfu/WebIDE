import { JsonRpcServer } from "@theia/core/lib/common/messaging";

// common/protocol.ts
export const GUILD_BACKEND_PATH = '/services/guildBackend';
// 变量声明
export const GuildBackendServiceSymbol = Symbol('GuildBackendServiceSymbol');
// 类型声明
export interface GuildBackendService extends JsonRpcServer<BackendClient>{
    test():string;
    createProject(jsonFile: string) : boolean
}

export const BackendClient = Symbol('BackendClient');
export interface BackendClient {
    openWorkSpace(urlStr:string):void;
}