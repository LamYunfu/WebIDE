import { UserInfo } from './../../data_center/user_info';
import { ProjectData } from './../../data_center/project_data';
import { LdcShellInterface } from './../ldc_shell/interfaces/ldc_shell_interface';
import { inject, interfaces } from 'inversify';
import { DEPLOY_SERVER_DOMAIN } from './../../../setting/backend-config';
import * as yaml from "js-yaml"
import * as FormData from "form-data"
import * as http from "http"
import * as fs from "fs-extra"
import { injectable } from "inversify"
export function bindKubege(bind:interfaces.Bind){
    bind(Kubedge).toSelf().inSingletonScope()
}
@injectable()
export class Kubedge{
    constructor(@inject(LdcShellInterface) readonly ldcShell:LdcShellInterface,
    @inject(ProjectData) readonly projectData:ProjectData,
    @inject(UserInfo) readonly userInfo:UserInfo){        
        
    }
     init(srcPath: string,user: string=this.userInfo.username) {        
         if(this.projectData.experimentType!="LinkEdge"){
             return
         }
        try {
            let src =fs.readFileSync(srcPath)
//             let src = `apiVersion: v1
// kind: Pod
// metadata:
//     name: deploy-pod
// spec:
//     containers:
//     - name: hello-world
//     image: registry.cn-hangzhou.aliyuncs.com/tinyedge/hello-world
//     imagePullPolicy: IfNotPresent`
            let ob: any = yaml.load(
                src
            )
            ob["metadata"]["name"] = user
            console.log(JSON.stringify(ob))
            console.log(yaml.dump(ob))
            fs.writeFileSync(srcPath,yaml.dump(ob))
        } catch (error) {
            this.ldcShell.outputResult("Parsing deployment.yaml error,try to delete deploy.yaml","err")
            
        }
        // let src =fs.readFileSync(srcPath)
    
    }
    async  createNameSpace(name: string=this.userInfo.username) {
        if(this.projectData.experimentType!="LinkEdge"){
            return
        }
        let fm = new FormData();
        fm.append("namespace", name)
        await new Promise<boolean>((res) => {
            let req = http.request({
                method: "POST",
                headers: fm.getHeaders(),
                host: `${DEPLOY_SERVER_DOMAIN}`,
                port: 8080,
                path: `/namespace/create`
            })
            req.on("response", (response) => {
                let bf: Buffer[] = []
                response.on("data", (buff: Buffer) => {
                    bf.push(buff);
                })
                response.on("close", () => {
                    let raw = Buffer.concat(bf).toString()
                    console.log(raw)
                    try {
                        let ob = JSON.parse(raw)
                        if (ob["code"] == 0) {
                            res(true)
                        } else {
                            res(false)
                            console.log(ob["msg"])
                        }
                    } catch (error) {
                        res(false)
                    }
                })
            })
            fm.pipe(req);
        })
    }
    async  deleteNameSpace(name: string=this.userInfo.username) {
        if(this.projectData.experimentType!="LinkEdge"){
            return
        }
        let fm = new FormData();
        fm.append("namespace", name)
        await new Promise<boolean>((res) => {
            let req = http.request({
                method: "POST",
                headers: fm.getHeaders(),
                host: `${DEPLOY_SERVER_DOMAIN}`,
                port: 8080,
                path: `/namespace/delete`
            })
            req.on("response", (response) => {
                let bf: Buffer[] = []
                response.on("data", (buff: Buffer) => {
                    bf.push(buff);
                })
                response.on("close", () => {
                    let raw = Buffer.concat(bf).toString()
                    console.log(raw)
                    try {
                        let ob = JSON.parse(raw)
                        if (ob["code"] == 0) {
                            res(true)
                        } else {
                            res(false)
                            console.log(ob["msg"])
                        }
                    } catch (error) {
                        res(false)
                    }
                })
            })
            fm.pipe(req);
        })
    }
}


// init()
// createNameSpace("liangfq")
// deleteNameSpace("liangfq")