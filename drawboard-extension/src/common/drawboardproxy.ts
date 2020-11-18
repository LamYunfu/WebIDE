import { Emitter ,Event} from "@theia/core"
import {interfaces,injectable} from "inversify"
export const Client =Symbol("Client")
export const SERVICE_PATH="/services/drawboardproxy"
export interface Client {
    fire(data:{type:string,data:any}):void
}
@injectable()
export class ProxyObject{
    protected  em:Emitter<{type:string,data:any}>=new Emitter<{type:string,data:any}>()
    get register():Event<{type:string,data:any}>{
        const em =this.em
        return em.event
    }
    getClient(){ 
        const em =this.em
        return {
            fire(data:{type:string,data:any}){
                em.fire(data)
            }
        }
    }
}
export function createCommonBind(bind:interfaces.Bind){
    bind(ProxyObject).toSelf().inSingletonScope()
}