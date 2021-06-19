import { inject, injectable, interfaces, named } from "inversify";
import { UserInfo } from "../../data_center/user_info";
import { ProjectData } from "../../data_center/project_data";
import { ProgramerInterface } from "../programers/interfaces/programer_interface";
import { DistributedCompiler } from "../compiler/ds_compiler";
import { ProgramBurnDataFactory } from "../../data_center/program_data";
import { LdcFileServer } from "../ldc_file_server/ldc_file_server";
import { LdcClientControllerInterface } from "../ldc/interfaces/ldc_client_controller_interface";
import { DataService } from "../data_service/data_service";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { MultiProjectData } from "../../data_center/multi_project_data";
import { TinyLinkCompiler } from "../compiler/tiny_link_compiler";
import { Indicator } from "../indicator/indicator";
import * as path from "path";
import * as fs from "fs";
export function bindLocalBurnService( bind :interfaces.Bind){
  bind(LocalBurningService).toSelf().inSingletonScope();
  
}
@injectable()

export class LocalBurningService{   
    constructor(
        @inject(UserInfo) protected userInfo: UserInfo,
        @inject(ProjectData)
        protected projectData: ProjectData,
        @inject(ProgramerInterface)
        @named("queue")
        protected queueProgramer: ProgramerInterface,
        @inject(ProgramerInterface)
        @named("adhoc")
        protected adhocProgramer: ProgramerInterface,
        @inject(DistributedCompiler) protected dsc: DistributedCompiler,
        @inject(ProgramBurnDataFactory)
        protected programBurnDataFactory: ProgramBurnDataFactory,
        @inject(LdcFileServer) protected ldcFileServer: LdcFileServer,
        @inject(LdcClientControllerInterface)
        protected lcc: LdcClientControllerInterface,
        @inject(DataService) protected dService: DataService,
        @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
        @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
        @inject(TinyLinkCompiler) protected tinyLinkCompiler: TinyLinkCompiler,
        @inject(Indicator) protected waitingIndicator:Indicator
      ) { }
      async submitQueue(): Promise<boolean> {    
        let projectData = this.projectData;
        let pa: Promise<boolean>[] = [];
        for (let i in projectData.subProjectArray) {
          let srcPath = path.join(
            this.multiProjectData.rootDir,
            projectData.projectRootDir,
            projectData.subProjectArray[i]
          );
          let targetPath = path.join(
            this.multiProjectData.rootDir,
            projectData.projectRootDir,  
            projectData.subProjectArray[i],
            projectData.subHexFileDirs[i],
            "sketch.hex"
          );
          this.outputResult(`Compiling ${this.projectData.subProjectArray[i]}...`)
          this.waitingIndicator.register()
          if (projectData.subCompileTypes[i].trim() == "tinylink") {
            let fa = fs.readdirSync(srcPath)
            pa.push(this.tinyLinkCompiler.compile(path.join(srcPath, fa[0]), i))
          } else {
            pa.push(
              this.dsc.compile(
                srcPath,
                targetPath,
                projectData.subBoardTypes[i],
                projectData.subCompileTypes[i],
                i
              )
            );
          }    
        }
        let ra = await Promise.all(pa);
        this.waitingIndicator.unRegister();
        for (let r of ra) {
          if (!r) return false;
        }
        this.outputResult("Command local burning")
        // this.waitingIndicator.register()
        // this.waitingIndicator.unRegister()
        return true ;

    }
    outputResult(res: string, type: string = "systemInfo") {
        this.ldcShell.outputResult(res, type);
      }
}