import { TinySim } from './../../services/tinysim/tinysim';
import { OneLinkData } from './../../data_center/one_link_data';
import { injectable, inject, interfaces } from "inversify";
import { OneLinkDataService } from "../../services/data_service/onelink_data_service";
import { MultiProjectData } from '../../data_center/multi_project_data';
import { ProjectData } from '../../data_center/project_data';
import * as path from "path"
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
        @inject(TinySim) protected tinySim: TinySim,
        @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
        @inject(ProjectData) protected projectData: ProjectData,
    ) {

    }
    // async submitCode(pid: string, isOpened: boolean){
    //     if(isOpened){
    //         this.oneLinkDataService.outputResult("scanner.cpp submitted successfully");
    //         this.codeTag = true;
    //     }else{
    //         this.oneLinkDataService.outputResult("open the scanner.cpp and write the code first!");
    //     }       
    // }

    /**
     * 提交对应的算法
     * @param pid  实验题的id
     * @param currentId  当前提交实验文件的文件名
     * @param uid  用户的id
     */
    async submitAlgorithm(pid: string, currentId:string, uid:string){
        if(currentId.includes("cam")){
            this.oneLinkDataService.outputResult(currentId + " submitted successfully");
            this.oneLinkDataService.parseVirtualConfig(pid)
            let simServer = this.oneLinkData.projects![0].simServer!
            //this.oneLinkDataService.outputResult(this.oneLinkDataService.getCurrentDir());
            let srcDir = path.join(this.oneLinkDataService.getCurrentDir(), this.oneLinkData.projects![0].projectName!.toString());
            // console.log("进入了提交界面！");
            await this.tinySim.virtualSubmitTao(simServer, srcDir, currentId, uid);
            this.oneLinkDataService.outputResult("files have been uploded to the server");
          }else{
            this.oneLinkDataService.outputResult("Move the web view to the algorithm!");
          }
    }
}