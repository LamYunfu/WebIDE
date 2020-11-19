import {injectable} from "inversify"
import { GroveService } from "../common/groveservice";
import {  Client } from "../common/groveproxy";
import {GrooveToDot} from "./toDot-service"
@injectable()
export class GroveServiceImpl implements GroveService{
    converter:GrooveToDot|null = null;

    constructor(){
        this.converter = new GrooveToDot();  
        setTimeout(async ()=>{
            this.pushDotMatrix();
        }, 10000); 
    }
    pushDotMatrix(sentence:string="hello, world!"): void {
        let dotMatrix:number[][] = this.converter!.getGrooveDot(sentence);    //获取点阵
        console.log("hello, world aleady changed");
        this.client!.fire(dotMatrix);
    }
    client:Client|null =null 

    setClient(client:Client){
        this.client=client
    }
}