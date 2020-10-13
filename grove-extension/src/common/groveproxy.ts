import { Emitter ,Event} from "@theia/core"
import {interfaces,injectable} from "inversify"
export const Client =Symbol("Client")
export const SERVICE_PATH="/services/groveproxy"
export interface Client {
    fire(data:number[][]):void
}
@injectable()
export class GroveProxyObject{
    protected  em:Emitter<number[][]>=new Emitter<number[][]>()
    //注册事件处理器
    get register():Event<number[][]>{
        const em =this.em
        return em.event
    }
    getClient(){ 
        const em =this.em
        return {
            fire(data:number[][]){
                em.fire(data)
            }
        }
    }
}
export function createCommonBind(bind:interfaces.Bind){
    bind(GroveProxyObject).toSelf().inSingletonScope()
}