import { Emitter,Event } from "@theia/core";
import {injectable} from 'inversify'
export const Client =Symbol("Client")
export interface Client{
    fire(somthing:string):void
}
@injectable()
export class ClientObject{
    protected onDeviceLogEmitter = new Emitter<string>();
    get register() :Event<string>{
        return this.onDeviceLogEmitter.event
    }
    fire(){
        const onDeviceLogEmitter=this.onDeviceLogEmitter
      return{
       fire(somthing :string){
           onDeviceLogEmitter.fire(somthing)
       }
      } 
    }
}