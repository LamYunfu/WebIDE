import { injectable, interfaces } from 'inversify';
import { ProjectData } from './../../data_center/project_data';
import { inject } from 'inversify';
import { UserInfo } from './../../data_center/user_info';
import * as Hs from "http"
import * as fm from "form-data"
const host  ="api.test.tinylink.cn"
const path ="/userActivity/record"
// type Behavior={
  
// }
class Behavior{    
    constructor(UID:string,activityName:string,startTime:number,activityId:string){
        this.UID=UID
        this.activityName=activityName
        this.startTime= startTime.toString()
        this.activityId=activityId
    }
   
    UID:string
    activityName:string 
    startTime: string//事件戳
    activityId: string//id
}
@injectable()
export class  BehaviorRecorder{
constructor(@inject(UserInfo)  readonly user:UserInfo,
@inject(ProjectData) readonly pd :ProjectData){
}
en:string
async submit(){
    await this.send(new Behavior(this.user.username,`${this.user.username}用户提交${this.en}实验`,new Date().getTime(),"30"))
}
async compile(){
    await this.send(new Behavior(this.user.username,`${this.user.username}用户${this.en}实验开始编译`,new Date().getTime(),"31"))
}
async burn(){
     await this.send(new Behavior(this.user.username,`${this.user.username}用户${this.en}实验开始烧写`,new Date().getTime(),"32"))
}
async judge(res:string){
    await this.send(new Behavior(this.user.username,`${this.user.username}用户${this.en}实验的判题结果是${res}`,new Date().getTime(),"33"))
}
async close(){
    await this.send(new Behavior(this.user.username,`${this.user.username}用户${this.en}实验的关闭`,new Date().getTime(),"34"))
}
async send(behavior:Behavior){
    console.log("record :" +JSON.stringify(behavior))
    let f =new fm()
    f.append("UID",behavior.UID)
    f.append("activityId",behavior.activityId)
    f.append("activityName",behavior.activityName)
    f.append("startTime",behavior.startTime)
    let p = new Promise<string>((resolve) => {
        console.log(p);
        let gf = Hs.request(
          {
            // protocol: "https:",
            method: "post",
            host: host,
            path: path,
            headers:f.getHeaders()
          },
          (response) => {
            let x: Buffer[] = [];  
            response.on("data", (buffer: Buffer) => {
              if (x.length % 10000) console.log("downloading");
              x.push(buffer);
            });
            response.on("close", () => {
              if(response.statusCode!=200){
                 console.log(" record error :"+JSON.stringify(behavior)+(Buffer.concat(x)).toString()+response.statusCode)
              }else{
                console.log(Buffer.concat(x).toString())
              }
              resolve("")
            });
          }
        );
        gf.on("error", () => {
         console.log(" record network error :"+JSON.stringify(behavior))
          resolve("error");
        });
       f.pipe(gf)
      });

      await p;
}
}
export function bindBehaviorRecorder( bind :interfaces.Bind){
    bind(BehaviorRecorder).toSelf().inSingletonScope()
}