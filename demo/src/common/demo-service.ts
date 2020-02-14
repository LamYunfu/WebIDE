import { Client } from "./test";

export const DemoService=Symbol("DemoService")
export interface DemoService{
    say():void;
    setClient(client:Client):void
}