import {injectable} from "inversify"
import { DrawboardService } from "../common/drawboardservice";
import {  Client } from "../common/drawboardproxy";
const container = require('rhea');
const crypto = require('crypto');
const iot =require( 'alibabacloud-iot-device-sdk');
@injectable()
export class DrawboardServiceImpl implements DrawboardService{
    client:Client|null =null 
    connection:any
    device:any
    aliIotDevAuthen:{
    "ProductKey": string,
    "DeviceName": string,
    "DeviceSecret": string}={
        "ProductKey": "a1Lufk6fEdk",
        "DeviceName": "qWupdz488DPrdpGQQD6v",
        "DeviceSecret": "UNRUSv4kObnlTUk93Hg3mam2FciwrfeU"
      }
    aliIotAuthen:{    
        uid:string,
        regionId:string,
        YourClientId:string,
        YourAccessKeyID:string,
        YourConsumerGroupId:string,
        YourAccessKeySecret:string
    }|null=null
    constructor(){        
        // const uid="1798257112763226"
        // const regionId="cn-shanghai"
        // const YourClientId="U1ilJ1n8oxIeNc5glsa6"
        // const YourAccessKeyID="LTAI4Ffvym2nwGLdKkP8R61q"
        // const YourConsumerGroupId="8BYG3MDP1fgxLKVPYq9L000100"
        // const YourAccessKeySecret="HZStcyKAQDPv1caoba28NfZwW6IKNP"
        // //Create Connection
        // let profile={
        //     'host': `${uid}.iot-amqp.${regionId}.aliyuncs.com`,
        //     'port': 5671,
        //     'transport':'tls',
        //     'reconnect':true,
        //     'idle_time_out':60000,
        //     'username':`${YourClientId}|authMode=aksign,signMethod=hmacsha1,timestamp=15734890881710,authId=${YourAccessKeyID},consumerGroupId=${YourConsumerGroupId}|`,
        //     'password': this.hmacSha1(`${YourAccessKeySecret}`, `authId=${YourAccessKeyID}&timestamp=15734890881710`),
        // }
        // console.log(JSON.stringify(profile))
        // const connection = container.connect(profile);
        //  connection.open_receiver();

        // //handle received message
        // container.on('message',  (context:any)=> {
        //     console.log("message")
        //     var msg = context.message;
        //     var messageId = msg.message_id;
        //     var topic = msg.application_properties.topic;
        //     var content = Buffer.from(msg.body.content).toString();
        //     console.log(content+topic+messageId)
        //     //ACK
        //     this.client!.fire({"type":"data",data:JSON.parse(content)})
        //     context.delivery.accept();
        // })
    }
  async  connectIot( authen:{    
        uid:string,
        regionId:string,
        YourClientId:string,
        YourAccessKeyID:string,
        YourConsumerGroupId:string,
        YourAccessKeySecret:string,
        "ProductKey": string,
        "DeviceName": string,
        "DeviceSecret": string
        
    }) :Promise<boolean>{
        try {         
        this.aliIotDevAuthen.DeviceName=authen.DeviceName
        this.aliIotDevAuthen.DeviceSecret=authen.DeviceSecret
        this.aliIotDevAuthen.ProductKey=authen.ProductKey
        this.aliIotAuthen=authen
        //Create Connection
        let profile={
            'host': `${this.aliIotAuthen.uid}.iot-amqp.${this.aliIotAuthen.regionId}.aliyuncs.com`,
            'port': 5671,
            'transport':'tls',
            'reconnect':true,
            'idle_time_out':60000,
            'username':`${this.aliIotAuthen.YourClientId}|authMode=aksign,signMethod=hmacsha1,timestamp=15734890881710,authId=${this.aliIotAuthen.YourAccessKeyID},consumerGroupId=${this.aliIotAuthen.YourConsumerGroupId}|`,
            'password': this.hmacSha1(`${this.aliIotAuthen.YourAccessKeySecret}`, `authId=${this.aliIotAuthen.YourAccessKeyID}&timestamp=15734890881710`),
        }
        console.log(JSON.stringify(profile))
        this.connection = container.connect(profile);
        this.connection.open_receiver();
        //handle received message
        container.on('connection_error',  (context:any)=> {
            throw "connection_error"
        })
       
         container.on('message',  (context:any)=> {
            console.log("message")
            var msg = context.message;
            var messageId = msg.message_id;
            var topic = msg.application_properties.topic;
            var content = Buffer.from(msg.body.content).toString();
            console.log(content+topic+messageId)
            //ACK
            this.client!.fire({"type":"data",data:JSON.parse(content)})
            context.delivery.accept();
        })
      
        return await new Promise((res)=>{      
            setTimeout(()=>{
                res(false)
                },30000)      
                        container.once('connection_open',  (context:any)=> {
                        console.log("connection open")
             
                        res(true) 
                        }) 
                     })
                && 
                await new Promise(res=>{
                    console.log("sdf")
                    setTimeout(()=>{
                        res(false)
                        },30000)
                    this.device=iot.device(
                        this.aliIotDevAuthen
                    )        
                    this.device.on("error",()=>{
                        this.device.end()
                        res(false)
                    })
                    this.device.once('connect',  () => {
                        console.log('device connect successfully!');
                        
                        res(true)
                        })
                    })
    } catch (error) {
            return false;        
    }
    }
   async disconnectIot():Promise<boolean>{
       let p=new Promise<boolean>((res)=>{
        setTimeout(()=>{
            res(false)
        },3000)
        this.device.once("close",()=>{
            this.device=null
            res(true)
        })
       })
        let s=new Promise<boolean>((res)=>{
            setTimeout(()=>{
                res(false)
            },3000)
            this.connection.once("connection_close",()=>{
                this.connection=null
                res(true)
            })
           })
        this.device.end()
        this.connection.close()
        return await p &&await s
    }
    hmacSha1(key:any, context:any) {
        return Buffer.from(crypto.createHmac('sha1', key).update(context).digest())
            .toString('base64');
    }
    getDataFromIotPlatform(): Promise<string> {
        console.log("somthing")
       return  new Promise(res=>{
           res("somthing")
       })
    }
      pushDataToIotPlatform(data :any): Promise<boolean> {
        // this.device.publish(`${this.aliIotDevAuthen.ProductKey}/${this.aliIotDevAuthen.DeviceName}/user/abcde`,JSON.stringify(data))
        return new Promise((res)=>{
            return res(true)
        })
    }
    setClient(client:Client){
        this.client=client
    }


}