import {injectable,inject} from "inversify"
import { UdcTerminal } from "./udc-terminal";
import * as fs from "fs"
import * as path from "path"
import {  TINY_MOBILE_IP, TINY_MOBILE_PORT, LINKLAB_WORKSPACE } from "../../setting/backend-config";
import * as http from "http"
import * as FormData from "form-data"
import { Logger } from "./logger";
@injectable()

export class OnelinkService{
    ready:boolean
    mobileFile:string=""
    tokenPath:string=""
    projectInfo:{
        projectName:string,
        token:string 
    }={projectName:"",token:""}
    constructor(@inject(UdcTerminal) protected readonly ut:UdcTerminal){
        this.ready=false
    }
    prepare(pid:string) :void{
        let currenDir=path.join(LINKLAB_WORKSPACE ,this.ut.pidQueueInfo[pid].dirName)
        let mobileDir=path.join(currenDir,"mobile")
        let mobileFile=path.join(mobileDir,"mobile.cpp")
        let tokenPath=path.join(mobileDir,"token")
        !fs.existsSync(currenDir)?fs.mkdirSync(currenDir):""
        !fs.existsSync(mobileDir)?fs.mkdirSync(mobileDir):""
        !fs.existsSync(mobileFile)?fs.writeFileSync(mobileFile,""):""    
        this.mobileFile=mobileFile
        this.tokenPath=tokenPath
    }
    isReady(){
       return this.ready
    }
    getProjectInfo(tokenPath:string,projectName:string):{token:string,projectName:string}|null{
        let config=""
        if(fs.existsSync(tokenPath)){
            config=fs.readFileSync(tokenPath).toString()
          try {
            let res=JSON.parse(config)
            if(res.token!=""&&res.projectName!=""){
                return res
            }
            else{
                throw "error"
            }
          } catch (error) {
            this.ut.outputResult("token file is corrupted")
            Logger.info("token file is corrupted")
            return null;
          }             
        }
        else{    
            return {
                projectName:projectName,
                token:""
            }
        }
    }
    async createProject(projectName:string,pid:string):Promise<boolean>{
        this.prepare(pid)
        let projectInfo= this.getProjectInfo(this.tokenPath,projectName)
        if(projectInfo==null){
            return false;
        }else {
            this.projectInfo=projectInfo
            this.ready =projectInfo.token==""?false:true
        }
        if(this.isReady()){
            this.ut.outputResult("project has been set up")
            return true
        }else{
            this.ready =await this.createMobileApp(this.mobileFile,this.projectInfo.projectName)
            return this.ready
        }        
       }
    async compileDevice (){
        if(this.ready){
          return true
        }
        else{
            this.ut.outputResult("onelink project has not been created yet")
            return false
        }
    }
   async createMobileApp(mobileFile:string,projectName:string) :Promise<boolean>{     
        Logger.info("createMobileApp")
        let _this =this
        let data =fs.readFileSync(mobileFile).toString()
        let fm = new FormData()
        console.log("data:"+data+":"+projectName)
        fm.append("file",data,projectName)
        fm.append(`appName`,projectName)
        let backValue:any={}       
        let res= await new Promise<boolean>(async (resolve) => {
            setTimeout(()=>{
                resolve(false)
            },30000)        
            let uploadRequest = http.request({//传zip
                method: "POST",
                hostname:TINY_MOBILE_IP,
                port: TINY_MOBILE_PORT,
                path: "/api/mobile/custom",
                headers: fm.getHeaders()
            }, (mesg) => {
                if (mesg == undefined) {
                    _this.ut.outputResult("network error")
                    Logger.info("error happened when custom mobile")
                    resolve(false)
                    return
                }
                let bf = ""
                Logger.info("upload statuscode:" + mesg.statusCode)
                mesg.on("data", (b: Buffer) => {
                    Logger.info("data comming")
                    bf += b.toString("utf8")
                })
                mesg.on("error", () => {
                    Logger.info("error happened when custom mobile")
                    _this.ut.outputResult("network error")
                    resolve(false)
                })
                mesg.on("end", () => {
                    Logger.info("custom back value:" + bf)
                    let res: any = JSON.parse(bf)
                    backValue=res
                    resolve(true)
                })
            })
            uploadRequest.on("error", () => {
                this.ut.outputResult("network error")
                resolve(false)
            })   
            fm.pipe(uploadRequest).end()               
    })
    if(res==false){
        this.ut.outputResult("network error")
        return false
    }
    else{
        if(this.processBackValue(backValue)){
            this.projectInfo.token=backValue["data"]["token"]
            fs.writeFileSync(this.tokenPath,JSON.stringify(this.projectInfo))
            this.ut.outputResult("project has been set up")
            return true
        }
        else{
            return false
        }
    }   
}
processBackValue(backValue:any){
    if(backValue["code"]=="11000")   {
        this.ut.outputResult("app name has been registered")
        return false
    }else if(backValue["code"]=="11001"){
        this.ut.outputResult("app compile failed")
        this.ut.outputResult(backValue["message"])
    } else if(backValue["code"]=="11002"){
        this.ut.outputResult("the token is consistent with the appName")
    } else if(backValue["code"]=="200"){
        this.ut.outputResult("compile successfully")
        return true
    }       
    return false
}
    async complileMobile (){
        Logger.info("compile Mobile")
        return this.update(this.projectInfo.token,this.projectInfo.projectName,this.mobileFile,this.tokenPath)
    }
    async update(token:string,projectName:string,mobileFile:string,tokenPath:string){
        let _this=this
        Logger.info("update Mobile:"+token+":"+projectName)
        if(this.isReady()){
            let data =fs.readFileSync(mobileFile)
            let fm = new FormData()
            fm.append("file",data,projectName)
            fm.append(`appName`,projectName)
            fm.append("token",token)
            let backValue:any={}
            let res= await new Promise<boolean>(async (resolve) => {
                setTimeout(()=>{
                    resolve(false)
                },30000)
           
                let uploadRequest = http.request({//传zip
                    method: "POST",
                    hostname:TINY_MOBILE_IP,
                    port: TINY_MOBILE_PORT,
                    path: "/api/mobile/updateConfig",
                    headers: fm.getHeaders()
                }, (mesg) => {
                    if (mesg == undefined) {
                        _this.ut.outputResult("network error")
                        Logger.info("error happened when updateConfig mobile")
                        resolve(false)
                        return
                    }
                    let bf = ""
                    Logger.info("upload statuscode:" + mesg.statusCode)
                    mesg.on("data", (b: Buffer) => {
                        Logger.info("data comming")
                        bf += b.toString("utf8")
                    })
                    mesg.on("error", () => {
                        Logger.info("error happened when updateConfig mobile")
                        _this.ut.outputResult("network error")
                        resolve(false)
                    })
                    mesg.on("end", () => {
                        Logger.info("updateConfig back value:" + bf)
                        let res: any = JSON.parse(bf)
                        backValue=res
                        resolve(true)
                        
                    })
                })
                uploadRequest.on("error", () => {
                    this.ut.outputResult("network error")
                    resolve(false)
                })   
                fm.pipe(uploadRequest).end()
               
        })
        if(res){
            if(this.processBackValue(backValue)){
                this.projectInfo.token=backValue["data"]["token"]
                fs.writeFileSync(tokenPath,JSON.stringify(this.projectInfo))
                this.ut.udcClient!.onConfigLog({name:"redirect",passwd:`http://`+backValue["data"]["url"]})    
                return true
            }
            else {
                return false
            }        
        }
        else{
            this.ut.outputResult("network error")
            return false
        }
     }
     else{
        this.ut.outputResult("onelink project has not been created yet")
        return false
    }   
    }
    async openMobile (){
        
        this.ut.udcClient!.onConfigLog({name:"openSrcFile",passwd:this.mobileFile})

    }
    async openDevice (){
     
    }
}