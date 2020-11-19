
import { TrainData } from '../../data_center/train_data';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { injectable, inject } from "inversify";
import * as fs from "fs-extra"
import { ProjectData } from '../../data_center/project_data';
import { MultiProjectData } from '../../data_center/multi_project_data';
import * as path from "path"
import { LdcShellInterface } from '../ldc_shell/interfaces/ldc_shell_interface';
@injectable()
export class TrainDataService {
    constructor(
        @inject(LdcShellInterface) protected ldcShellInterface: LdcShellInterface,
        @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
        @inject(ProjectData) protected projectData: ProjectData,
    ) {

    }
    parseTrainData() {
        let ob: TrainData | null = null
        let cpath = path.join(
            this.multiProjectData.rootDir,
            this.projectData.projectRootDir,
            "config.json"
        );
        let projectPath = path.join(
            this.multiProjectData.rootDir,
            this.projectData.projectRootDir
        );
        try {
            let rawConfig = fs.readFileSync(cpath);
            let jc = new JsonConvert();
            jc.operationMode = OperationMode.ENABLE; // print some debug data
            jc.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
            jc.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL;
            ob = jc.deserializeObject(
                JSON.parse(rawConfig.toString()),
                TrainData
            );
            ob.projects![0].projectName = path.join(projectPath)
        } catch (error) {
            ob = null
            this.ldcShellInterface.outputResult(error, "error")
        }
        finally {
            return ob
        }
    }
  parseAllData(){
        let ob=this.parseTrainData()
        for( let key of  Object.keys(this.multiProjectData.dataMap)){
            if(this.multiProjectData.dataMap[key].experimentType=="ai"){
                for(let x of ob!.projects!){
                   this.multiProjectData.dataMap[key].subProjectArray.push("code");
                }
            }
        }
 }
}