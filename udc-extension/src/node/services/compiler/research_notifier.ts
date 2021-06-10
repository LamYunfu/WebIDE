import { ProjectData } from './../../data_center/project_data';
import { RESEARCHING_API } from './../../../setting/backend-config';
import * as https from "https"
import * as fm from "form-data"
import { inject, injectable, interfaces } from 'inversify';
import { UserInfo } from '../../data_center/user_info';
export function bindResearchNotifier(bind: interfaces.Bind) {
    bind(ResearchNotifier)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class  ResearchNotifier{
    url:string=""
    constructor(@inject(ProjectData) protected readonly pd:ProjectData,
    @inject(UserInfo) protected readonly ui:UserInfo
    ){
        
    }
    setURL(url:string){
        this.url=url
    }
     notify(){
        let url =this.url
        let rq=  https.request({
             host:RESEARCHING_API,
             path:"/research/webideFirmware",
             method:"POST",
         })
         let data =new fm();
         data.append("userId",this.ui.username)
         data.append("firewareName",this.pd.subProjectArray[0])
         data.append("firmwareUrl",url)
         data.on("close",()=>{
            console.log("----------------upload to research")
        })      
         data.pipe(rq);
        

    }
}