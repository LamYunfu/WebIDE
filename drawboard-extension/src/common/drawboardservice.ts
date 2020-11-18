import {  Client } from './drawboardproxy'
export const DrawboardService =Symbol("DrawboardService")
export interface DrawboardService{
    getDataFromIotPlatform():Promise<string>
    pushDataToIotPlatform(data:any):Promise<boolean>
    setClient(client:Client):void
    connectIot(authen:{    
        uid:string,
        regionId:string,
        YourClientId:string,
        YourAccessKeyID:string,
        YourConsumerGroupId:string,
        YourAccessKeySecret:string
    }):Promise<boolean>
    disconnectIot():Promise<boolean>
}