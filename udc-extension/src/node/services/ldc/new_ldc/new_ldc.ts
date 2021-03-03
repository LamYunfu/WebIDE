import { EventDefinition } from './../../tools/event_definition';
import { EventCenter } from './../../tools/event_center';
import { FileServerInterface } from './../interfaces/file_server_interface';
import { LdcShell } from './../../ldc_shell/ldc_shell';
import { ProjectData } from './../../../data_center/project_data';
import { inject, injectable } from "inversify";
import * as FormData from "form-data"
import * as http from "http"
import * as WS from "ws"
import { LdcClientControllerInterface } from "../interfaces/ldc_client_controller_interface";
import { QueueBurnElem, Skeleton } from "../../../data_center/program_data";
import { UserInfo } from '../../../data_center/user_info';
import { fstat, readFileSync, stat } from 'fs-extra';
import { LdcShellInterface } from '../../ldc_shell/interfaces/ldc_shell_interface';
class TaskItem {
    "boardname": string | null=null
    "deviceid": string  | null=null
    "runtime": number | null=null
    "filehash": string | null=null
    "clientid": string | null=null
    "taskindex": number | null=null
}
class LdcDataPacket{
    
        "code": number| null=null
        "type": string| null=null
        "timestamp": number| null=null
        "data": LogData|DeviceList| null=null
}
class LogData{
         static example=new LogData()
        "groupid": string| null=null
        "taskindex": number| null=null
        "type": string| null="TaskLogMsg"
        "msg": string| null=null
        "data":{"ctimestamp":string,"dtimestamp":string}| null=null
}
class DeviceInfo{
        static example=new DeviceInfo()
        "boardname": string| null=null
        "deviceid": string| null=null
        "busy": boolean| null=null
        "clientid": string| null=null

}
class DeviceList{
    static example=new DeviceList()
        "devices": DeviceInfo[
        ]   | null=null
}
class TaskAllocate {
     static=new TaskAllocate()
    "groupid": string|null=null
    "taskindex": number|null=null
    "type":string= "TaskAllocateMsg"
    "msg":string |null=null
    "data":{[key:string]:string}|null=null
}
class TaskBurnMsg {
    static example=new TaskBurnMsg()
   "groupid": string|null=null
   "taskindex": number|null=null
   "type":string= "TaskBurnMsg"
   "msg":string |null=null
}
class TaskEndRunMsg{
    static=new TaskEndRunMsg()
    "groupid": string|null=null
    "taskindex": number|null=null
    "type":string= "TaskEndRunMsg"
    "msg":string |null=null
}
@injectable()
export class LdcLogger implements LdcClientControllerInterface ,FileServerInterface{
    loginHostName = "kubernetes.tinylink.cn"
    loginPath = "/linklab/device-control-v2/login-authentication/user/login"
    burnPath = "/linklab/device-control-v2/user-service/api/device/burn"
    authorization: string = ""
    wsPath = "ws://kubernetes.tinylink.cn/linklab/device-control-v2/user-service/api/ws"
    ws: WS | undefined
    uploadPath = "/linklab/device-control-v2/file-cache/api/file"
    constructor(
        // @inject(LdcData) protected ldcData: LdcData
        @inject(UserInfo) protected uif: UserInfo,
        @inject(ProjectData) protected pdata: ProjectData,
        @inject(LdcShellInterface) protected ldcshell :LdcShellInterface,
        @inject(EventCenter) protected eventCenter:EventCenter,
        @inject(EventDefinition) protected eventDefinition:EventDefinition
     ) {
    }
    async dispose() {
        if (this.ws == undefined) {
            return;
        }
        this.ws.removeAllListeners()
        this.ws = undefined
    }
    isValidated(raw:any,beValidated:any){
        let p =Object.keys(raw)
        // p.forEach((val)=>{
        //     console.log(val)
        // })      
        let q =Object.keys(beValidated)
        // q.forEach((val)=>{
        //     console.log(val)
        // })
        let fwd =p.some((val)=>{
            return !q.includes(val)
        })
        let bwd=q.some((val)=>{
            return !p.includes(val)
        })
        if(fwd||bwd){
            return false;
        }else{
            return raw.type==beValidated.type
        }
    }
    async connect() {
    //    this.outputResult("connect to new_ldc")
     await this.prepare()
     return await new Promise<boolean>((bk)=>{
            this.ws = new WS(`${this.wsPath}`, {
            headers: {
                Authorization: this.authorization
            }
        })
        this.ws.addEventListener("open", (msg) => {
            // this.outputResult("open ldc connection ")
            bk(true)
        })
        this.ws.addEventListener("message", (msg) => {
            // this.outputResult("receive message!!!!!!!!!!!!!")
            // this.outputResult(msg.data)
            let json:LdcDataPacket=JSON.parse(msg.data)
            let data:any =json.data
            // console.log("ws receive " + data.msg)
            if( this.isValidated(LogData.example,data)){
                this.outputResult(data.msg,"log")
                // console.log("--------dd:"+data.msg)
            }else  if( this.isValidated(DeviceList.example,data)){             
                console.log("--------dd:"+data.msg)
            }else if( this. isValidated(TaskBurnMsg.example,data)){
                if(json.code==0){
                    this.eventCenter.emit(this.eventDefinition.programState,true)
                }else{
                    this.eventCenter.emit(this.eventDefinition.programState,false)
                }
            }
            bk(true)
        })
        this.ws.addEventListener("close", () => {
            // this.outputResult("close ldc ")
            bk(true)
            // this.dispose()
        })
        this.ws.addEventListener('error', () => {
            this.outputResult("connection to ldc error ")
            bk(true)
            this.dispose()
        })
    })
}
    async disconnect() {
        // console.log("disconnect ws")
        if (this.isConnected()) {
            this.ws.removeAllListeners()
            this.ws!.close();
            this.ws = undefined
        }
        return true
    }
    isConnected() {
        return this.ws != undefined
    }
    async login() {
        // this.outputResult("login")
        return await new Promise((bk) => {
            let request = http.request(
                {
                    method: "POST",
                    hostname: this.loginHostName,
                    path: this.loginPath
                }
                ,
                (res) => {
                    let tmp: Buffer | undefined = undefined
                    res.on("data", (data) => {
                        if (tmp == undefined) {
                            tmp = data
                        } else {
                            tmp = Buffer.concat([tmp, data])
                        }
                    })
                    res.on("close", () => {
                        let raw = tmp!.toString()
                        let json = JSON.parse(raw);
                        if (json["code"] == 0) {

                            this.authorization = json["data"]["token"];
                            // this.outputResult(json["data"]["token"])
                            bk(true)
                        } else {
                            // this.outputResult(json["msg"])
                            bk(false)
                        }
                    })

                }
            )
            request.write(JSON.stringify({  "id": this.uif.username, "password":"6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918" }))
            request.end()
        }
        )

        // fm.pipe(request)       
    }
    async prepare() {
        if (this.authorization == "") {
            return await this.login()
        }
        return true;
    }
    async burn(skelton: Skeleton): Promise<boolean> {
        let tag = await this.prepare()
        if (!tag) {
            this.outputResult(" User doesn't not login", "err")
        }
        console.log("new_ldc burn ");
        // this.outputResult("burn")
        let tasks: TaskItem[] = []
        let ps = skelton.program;
        if (ps == undefined || ps.length == 0) {
            return false;
        }
        for (let i in ps) {
            let item = ps[i]
            console.log(i+JSON.stringify(this.pdata))
            if (item instanceof QueueBurnElem) {               
                tasks.push({
                    // boardname: "ESP32DevKitC",
                    boardname: this.pdata.subModelTypes[i]!="null"? this.pdata.subModelTypes[i]:this.pdata.subBoardTypes[i],
                    deviceid: "",
                    clientid: "",
                    runtime: item.runtime!,
                    filehash: (await this.uploadToLdc(item.filehash!,this.pdata.subBoardTypes[i],this.pdata.subModelTypes[i]!="null"?this.pdata.subModelTypes[i]:this.pdata.subBoardTypes[i],this.pdata.subCompileTypes[i],i))!,
                    taskindex: parseInt(i) + 1
                })
            } else {
               
                tasks.push({
                    boardname: this.pdata.subModelTypes[i]!="null"?this.pdata.subModelTypes[i]:this.pdata.subBoardTypes[i],
                    deviceid: item.devPort!,
                    clientid: item.clientId!,
                    runtime: item.runtime!,
                    filehash:  (await this.uploadToLdc(item.filehash!,this.pdata.subBoardTypes[i],this.pdata.subModelTypes[i]!="null"?this.pdata.subModelTypes[i]:this.pdata.subBoardTypes[i],this.pdata.subCompileTypes[i],i))!,
                    taskindex: parseInt(i) + 1
                })
            }
        }
        let p = await new Promise<boolean>((bk) => {
            let request = http.request(
                {
                    method: "POST",
                    hostname: this.loginHostName,
                    path: this.burnPath,
                    headers: {
                        Authorization: this.authorization
                    }
                }
                ,
                (res) => {
                    let tmp: Buffer | undefined = undefined
                    res.on("data", (data) => {
                        if (tmp == undefined) {
                            tmp = data
                        } else {
                            tmp = Buffer.concat([tmp, data])
                        }
                    })
                    res.on("close", () => {
                        let raw = tmp!.toString()
                        let json = JSON.parse(raw);
                        if (json["code"] == 0) {
                            // this.outputResult(raw)
                            bk(true)
                        } else {
                            // this.outputResult(json["msg"])
                            bk(false)
                        }
                    })
                }
            )
            let d 
            if(this.pdata.experimentType=="experiment"||this.pdata.experimentType==undefined){
                d=JSON.stringify({ tasks: tasks,pid:this.pdata.pid });               
            }else{
                d=JSON.stringify({ tasks: tasks })
            }
            console.log(d+this.pdata.experimentType)
            request.write(d)
            request.end()
        }
        )
        return true
    }
    outputResult(msg: string, level: string = "sys") {
        this.ldcshell.outputResult(msg,level)
        console.log(msg)
    }
    async uploadToLdc(hash: string, boardType: string,deviceType:string ,compileType: string,index:string=""){
       
        let buff
        if(compileType=="tinylink"){
            // buff=
            return this.pdata.fileHash[parseInt(index)]
        }else{
            if(this.pdata.language == "python") {
                console.log(" this.pdata.language == python index = " + index + " pythonFileData = " + this.pdata.pythonFileData);
                buff = this.pdata.pythonFileData[parseInt(index)];
            } else {
                buff=await this.downloadHex(hash,boardType,compileType)
            }
        }      
        if(!buff){
            console.log("buff is null");
            return ""
        }
        return await this.uploadHex(buff,deviceType)
    }
    async uploadHex(buffer: Buffer, boardname: string):Promise<string|undefined> {
        await this.prepare()
        console.log("upload:"+boardname)
        let fm = new FormData()
        if(this.pdata.language == "python") {
            fm.append("file", buffer, "file.zip")
        } else {    
            fm.append("file", buffer, "file")
        }
        fm.append("parameters", JSON.stringify({
            boardname: boardname
        }))
        
        let p = new Promise<string|undefined>((bk) => {
            let request = http.request(
                {
                    method: "POST",
                    hostname: this.loginHostName,
                    path: this.uploadPath,
                    headers:{
                        ...fm.getHeaders(),
                        Authorization:this.authorization   ,
                        
                    }
                    
                }
                ,
                (res) => {
                    let tmp: Buffer | undefined = undefined
                    res.on("data", (data) => {
                        if (tmp == undefined) {
                            tmp = data
                        } else {
                            tmp = Buffer.concat([tmp, data])
                        }
                    })
                    res.on("close", () => {
                        let raw = tmp!.toString()
                        let json = JSON.parse(raw.toString());
                        console.log("upload res :"+raw)
                        if (json["code"] == 0) {
                            // this.outputResult("up---"+raw)
                            bk(json["data"]["filehash"])
                        } else {
                            this.outputResult(json["msg"],"err")
                            bk(undefined)
                        }
                    })
                }
            )
            fm.pipe(request)
            request.end()
        }
        )
       return await p;
    }
    async downloadHex(hash: string, boardType: string, compileType: string): Promise<Buffer | undefined> {
        let path =`/linklab/compilev2/api/compile/block?filehash=${hash}&boardtype=${boardType}&compiletype=${compileType}`
        console.log(path)
        return await new Promise((bk) => {
            let request = http.request(
                {
                    method: "GET",
                    hostname: this.loginHostName,
                    path: path
                }
                ,
                (res) => {
                    let tmp: Buffer | undefined = undefined
                    res.on("data", (data) => {
                        if (tmp == undefined) {
                            tmp = data
                        } else {
                            tmp = Buffer.concat([tmp, data])
                        }
                    })
                    res.on("close", () => {
                        if (res.headers["content-type"] == "application/octet-stream") {
                            bk(tmp);
                            return
                        }
                        let raw = tmp!.toString()
                        console.log(raw)
                        let json = JSON.parse(raw);
                        if (json["code"] == 0) {
                            // this.outputResult("download--"+raw)
                            bk(undefined)
                        } else {
                            bk(undefined)
                        }
                    })
                }
            )
            request.write("")
            request.end()
        })
        // http://kubernetes.tinylink.cn/linklab/compilev2/api/compile/block\?filehash\="98bca5e26f43055315c81dc79cda22d29950f3d2"\&boardtype\="developerkit"\&compiletype\="alios"
    }

}
// let lg = new LdcLogger()
// lg.login().then(() => {
//     lg.burn('{"tasks":[{"boardname":"ArduinoMega2560","deviceid":"/dev/ArduinoMega2560-8","runtime":30,"filehash":"eb3920b037e505b19c9a0ce0d8f28ae56f5ed28d9f70830ed22e11fd07d01c82","clientid":"ClientTest","taskindex":1},{"boardname":"ESP32DevKitC","deviceid":"/dev/ESP32DevKitC-0","runtime":30,"filehash":"6ec0d4238b7164784a62f4b163c712c480b45b2a931ed6c2c6b00e4c66890ca1","clientid":"ClientTest","taskindex":2}]}')
// }).then(() => {
//     lg.getLog()
// })
