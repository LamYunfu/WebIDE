import { MultiProjectData } from './../../data_center/multi_project_data';
import { ProjectData } from './../../data_center/project_data';
import * as Process from "child_process"
import { inject, injectable ,interfaces} from "inversify";
import * as pth from "path"
export function bindDiffer( bind :interfaces.Bind){
    bind(Differ).toSelf().inSingletonScope()
}
@injectable()
export class  Differ{
    constructor(@inject(ProjectData) readonly projectData:ProjectData,
    @inject(MultiProjectData) readonly multiProjectData: MultiProjectData){
        
    }
    getCheckSum(path:string ){
        let tmp =pth.join(this.multiProjectData.rootDir,this.projectData.projectRootDir,"getOrigmtime.py")
        Process.execSync(`python ${tmp} ${path}`)
    }
    getZipFile(input:string,output:string){
        let tmp =pth.join(this.multiProjectData.rootDir,this.projectData.projectRootDir,"getModifiedFile_real.py")
        Process.execSync(`python ${tmp} ${input} ${output} `);
    }

}