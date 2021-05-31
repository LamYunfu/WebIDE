import {  injectable} from "inversify";
import { BackendClient, STM32BackendService} from "../common/protocol";
import { OS } from "@theia/core";
//import URI from "@theia/core/lib/common/uri";

@injectable()
export class STM32BackendServiceImpl implements STM32BackendService {
    
    //向LDC后端发送消息
    sendMessage(message: string): string {
        console.log("尝试向后端发送消息" + message);
        return "成功访问";
    }
    
    client : BackendClient;

    dispose(): void {
        // do nothing
    }
    setClient(client: BackendClient): void {
        this.client = client;
    }
}



