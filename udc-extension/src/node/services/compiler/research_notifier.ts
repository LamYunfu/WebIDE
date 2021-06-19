import { LdcShellInterface } from './../ldc_shell/interfaces/ldc_shell_interface';
import { ProjectData } from './../../data_center/project_data';
import { RESEARCHING_API } from './../../../setting/backend-config';
import * as https from "https"
import * as http from "http"
import * as fm from "form-data"
import { inject, injectable, interfaces } from 'inversify';
import { UserInfo } from '../../data_center/user_info';
import * as path from "path"
export function bindResearchNotifier(bind: interfaces.Bind) {
    bind(ResearchNotifier)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class  ResearchNotifier{
    url:string=""
    constructor(@inject(ProjectData) protected readonly pd:ProjectData,
    @inject(UserInfo) protected readonly ui:UserInfo,
    @inject(LdcShellInterface) protected shell:LdcShellInterface
    ){
        
    }
    setURL(url:string){
        this.url=url
    }
     notify(){//通知科研版在编译器上拿编译好的文件
         let _this=this
        let url =this.url
        let data =new fm();
        let rq=  http.request({
             host:RESEARCHING_API,
             path:"/research/firmware/webideFirmware",
             method:"POST",             
             headers:{ ...data.getHeaders(),
                    Cookie:this.ui.cookie
                }
         },(msg)=>{
             let x =""
             msg.on("data",(bf:Buffer)=>{
                x+=bf.toString("utf8")                
             })
	     msg.on("close",()=>{
	     	 console.log("state:"+msg.statusCode +"cookie:"+rq.getHeader("Cookie"))
                _this.shell.outputResult("Save binary success","sys")
                 console.log("--bk:"+x)
             })
             msg.on("err",()=>{
                _this.shell.outputResult("Save binary error","sys")
                console.log("--err:"+x)
            })
         })
       
         data.append("userId",this.ui.username)
         data.append("firewareName",this.pd.projectRootDir)
         data.append("firmwareUrl",url)
         data.append("descriptions","none")
         data.append("compileType",this.pd.subCompileTypes[0])
         data.on("close",()=>{
            console.log("----------------upload to research")
        })      
         data.pipe(rq);       
    }
    notifyPath(){//通知科研版在后端服务器拿源码
        let pt = `/root/userWorkspace/${this.ui.username}/${this.ui.username}/${this.pd.projectRootDir}/${this.pd.subProjectArray[0]}`
        let _this=this
        let url =this.url
        let data =new fm();
        let rq=  http.request({
             host:RESEARCHING_API,
             path:"/research/firmware/webideFirmware",
             method:"POST",             
             headers:{ ...data.getHeaders(),
                    Cookie:this.ui.cookie
                }
         },(msg)=>{
             let x =""
             msg.on("data",(bf:Buffer)=>{
                x+=bf.toString("utf8")                
             })
	     msg.on("close",()=>{
	     	 console.log("state:"+msg.statusCode +"cookie:"+rq.getHeader("Cookie"))
                _this.shell.outputResult("Save binary success","sys")
                 console.log("--bk:"+x)
             })
             msg.on("err",()=>{
                _this.shell.outputResult("Save binary error","sys")
                console.log("--err:"+x)
            })
         })
       
         data.append("userId",this.ui.username)
         data.append("firewareName",this.pd.projectRootDir)
         data.append("firmwarePath",pt)
         data.append("descriptions","none")
         data.append("compileType",this.pd.subCompileTypes[0])         
         data.on("close",()=>{
            console.log("----------------upload to research")
        })      
         data.pipe(rq);  


    }
}
