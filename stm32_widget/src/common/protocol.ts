import { JsonRpcServer } from "@theia/core/lib/common/messaging";

// common/protocol.ts
export const STM32_BACKEND_PATH = '/services/stm32Backend';
// 变量声明
export const STM32BackendServiceSymbol = Symbol('STM32BackendServiceSymbol');
// 类型声明
export interface STM32BackendService extends JsonRpcServer<BackendClient>{
    sendMessage(message:string):string;
}
export const BackendClient = Symbol('BackendClient');
export interface BackendClient {
    sendMessage(message:string):void;
}