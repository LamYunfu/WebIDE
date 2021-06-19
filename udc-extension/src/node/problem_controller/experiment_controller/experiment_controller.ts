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
import { BehaviorRecorder } from '../../services/behavior_recorder/behavior_recorder';
import { ResearchNotifier } from '../../services/compiler/research_notifier';
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
    @inject(Indicator) protected waitingIndicator: Indicator,
    @inject(BehaviorRecorder) readonly behaviorRecorder:BehaviorRecorder,
    @inject(ResearchNotifier) readonly researchNotifier:ResearchNotifier
  ) { }
  private _outExperimentSetting: string;
  public get outExperimentSetting(): string {
    return this._outExperimentSetting;
  }
  public set outExperimentSetting(value: string) {
    this._outExperimentSetting = value;
  }
  async submitQueue(): Promise<boolean> {
    this.behaviorRecorder.submit()
    let projectData = this.projectData;
    let pa: Promise<boolean>[] = [];

    for (let i in projectData.subProjectArray) {
      //源路径
      console.log("this.multiProjectData.rootDir is "+ this.multiProjectData.rootDir + " projectData.projectRootDir is " + projectData.projectRootDir + " projectData.subProjectArray[i] is " + projectData.subProjectArray[i]);
      let srcPath = path.join(
        this.multiProjectData.rootDir,
        projectData.projectRootDir,
        projectData.subProjectArray[i]
      );
      // srcPath = "/Users/dongwei/Desktop/Python_LED/python";
      //存放二进制代码的目标路径
      let targetPath = path.join(
        this.multiProjectData.rootDir,
        projectData.projectRootDir,
        projectData.subProjectArray[i],
        projectData.subHexFileDirs[i],
        "sketch.hex"
      );
      this.outputResult(`Compiling ${this.projectData.subProjectArray[i]}...`)
      //每隔两秒打印一次waiting
      this.behaviorRecorder.compile()
      this.waitingIndicator.register()
      // tinyLink类型的实验不需要分布式编译处理，所以这里单独拎出来
      if (projectData.subCompileTypes[i].trim() == "tinylink") {
        let fa = fs.readdirSync(srcPath)
        pa.push(this.tinyLinkCompiler.compile(path.join(srcPath, fa[0]), i))
      } 
      else {
        console.log("submitQueue projectData.language is " + projectData.language);

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
    // 将promise里面所有的编译任务全部执行一遍再执行下一步
    let ra = await Promise.all(pa);
    // 停止waiting提示
    this.waitingIndicator.unRegister();
    // ra代表编译的成功或者失败，如果有一个编译任务失败，则代表整个任务失败
    for (let r of ra) {
      if (!r) return false;
    }
    this.outputResult("Command burning")
    // 又开始等待
    this.waitingIndicator.register()
    //烧写
    this.behaviorRecorder.burn()
    let result = await this.queueProgramer.burn();
    this.waitingIndicator.unRegister()
    return result
  }
  async submitLocal(tag: boolean = false): Promise<boolean> {
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
            i,
            tag
          )
        );
      }
    }
    await Promise.all(pa);
    return true;
  }
  submitAndBurn() {
    this.submitLocal(true);
  }
  async submitAdhoc() {
    this.behaviorRecorder.submit()
    let cr = await this.lcc.connect();
    if (!cr) return false;
    let projectData = this.projectData;
    let pa: Promise<boolean>[] = [];
    this.behaviorRecorder.compile()
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
    this.behaviorRecorder.compile()
    return await this.adhocProgramer.burn();
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
