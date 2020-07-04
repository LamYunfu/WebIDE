import { TinySim } from './../../services/tinysim/tinysim';
import { OneLinkData } from './../../data_center/one_link_data';
import { injectable, inject, interfaces } from "inversify";
import { OneLinkDataService } from "../../services/data_service/onelink_data_service";
export function bindTaoFactoryController(bind: interfaces.Bind) {
    bind(TaoFactoryController).toSelf().inSingletonScope()
}
@injectable()
export class TaoFactoryController {
    codeTag = false;
    algorithmTag = false;
    constructor(
        //相关服务
        @inject(OneLinkDataService) protected oneLinkDataService: OneLinkDataService,
        //题目信息数据
        @inject(OneLinkData) protected oneLinkData: OneLinkData,
        @inject(TinySim) protected tinySim: TinySim
    ) {

    }
    async submitCode(pid: string){
        this.oneLinkDataService.outputResult("scanner.cpp submitted successfully");
        this.codeTag = true;
    }
    
    async submitAlgorithm(pid: string, currentId:string){
        if(currentId.includes("cam")){
            this.oneLinkDataService.outputResult(currentId + " submitted successfully");
            this.algorithmTag = true;
            if(this.codeTag == true){
                this.oneLinkDataService.parseVirtualConfig(pid)
                let simServer = this.oneLinkData.projects![0].simServer!
                this.oneLinkDataService.outputResult(this.oneLinkDataService.getCurrentDir());
                //return await this.tinySim.virtualSubmit(simServer, this.oneLinkDataService.getCurrentDir())
            }
            this.oneLinkDataService.outputResult("entering the virtual simulation scene...");
          }else{
            this.oneLinkDataService.outputResult("open the camera and write the code first or move the web view to the algorithm!");
          }
            
    }
}