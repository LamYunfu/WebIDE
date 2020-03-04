
import { DemoService } from '../common/demo-service';
import { Client } from '../common/test';
import {injectable} from "inversify"
@injectable()
export class ServiceImpl implements DemoService{
    protected client:Client| null =null
    say():void{
        this.client!.fire("hello")
        console.log("hello")
    }
    setClient(client:Client):void{
        this.client=client
    }
}