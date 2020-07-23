import { DataService } from './../../services/data_service/data_service';
import { TinyLinkCompiler } from './../../services/compiler/tiny_link_compiler';
import { UserInfo } from "../../data_center/user_info";
import { inject, injectable, named } from "inversify";
import { ProjectData } from "../../data_center/project_data";
import { LdcClientControllerInterface } from "../../services/ldc/interfaces/ldc_client_controller_interface";
import * as path from "path";
import { LdcShellInterface } from "../../services/ldc_shell/interfaces/ldc_shell_interface";
import { ProgramBurnDataFactory } from "../../data_center/program_data";
import { LdcFileServer } from "../../services/ldc_file_server/ldc_file_server";
import { ProgramerInterface } from "../../services/programers/interfaces/programer_interface";
import { DistributedCompiler } from "../../services/compiler/ds_compiler";
import { MultiProjectData } from "../../data_center/multi_project_data";
import * as fs from "fs-extra"
import { Indicator } from '../../services/indicator/indicator';
@injectable()
export class ExperimentController {
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
    this.outputResult("Command burning")
    this.waitingIndicator.register()
    let result =await this.queueProgramer.burn();
    this.waitingIndicator.unRegister()
    return result
  }
  async submitAdhoc() {
    let cr = await this.lcc.connect();
    if (!cr) return false;
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
    let ra = await Promise.all(pa);
    for (let r of ra) {
      if (!r) return false;
    }
    return await this.adhocProgramer.burn();
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
