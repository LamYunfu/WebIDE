import { FreeCodingDataService } from './freecoding_data_service';
import { LdcData } from '../../data_center/ldc_data';
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable } from "inversify";
import { CallInfoStorerInterface } from "../log/interfaces/call_storer_interface";
import { ProjectData } from "../../data_center/project_data";
import { MultiProjectData } from "../../data_center/multi_project_data";
@injectable()
export class DataService {
  constructor(
    @inject(LdcData) protected ldcData: LdcData,
    @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
    @inject(CallInfoStorerInterface) readonly cis: CallInfoStorerInterface,
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
    @inject(FreeCodingDataService) protected freeCodingDataService: FreeCodingDataService
  ) { }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
  // pidQueueInfo: {
  //   [pid: string]: {
  //     loginType: string;
  //     projectName: string | undefined;
  //     boardType:string;
  //     compilerType: string | undefined;
  //     timeout: string;
  //     model: string;
  //     waitID: string;
  //     fns: string;
  //     dirName: string;
  //     deviceRole?: string[] | undefined;
  //     ppid?: string;
  //     type?: string;
  //   };
  needReconnectServer(): boolean {
    if (this.ldcData.loginType == this.projectData.loginType && this.ldcData.serverType == this.projectData.serverType && this.ldcData.pid == this.projectData.pid) {
      return false
    }
    else {
      return true;
    }
  }

  async initDataMapFromFrontEnd(info: string): Promise<boolean> {
    console.log("----:" + info)
    try {
      let ob: {
        [pid: string]: {
          loginType: string;
          projectName: string | undefined;
          boardType: string;
          compilerType: string | undefined;
          timeout: string;
          model: string;
          waitID: string;
          fns: string;
          dirName: string;
          deviceRole?: string[] | undefined;
          ppid?: string;
          type?: string;
        };
      } = JSON.parse(info);
      console.log("not ok")
      let pa: { [pid: string]: ProjectData } = {};
      for (let key of Object.keys(ob)) {
        console.log("key:" + key)
        let pd = new ProjectData();
        pd.pid = key;
        pd.ppid = ob[key].ppid!;
        // pd.loginType = ob[key].loginType.toLowerCase();
        pd.loginType = "queue"
        pd.projectRootDir = ob[key].dirName
        !!ob[key].model ? pd.serverType = ob[key].model : ""
        pd.subBoardTypes = [];
        pd.subCompileTypes = [];
        pd.subHexFileDirs = [];
        pd.subProjectArray = [];
        pd.subModelTypes = [];
        pd.subTimeouts = [];
        let addresses: string[] = []
        let boardTypes: string[] = [];
        let compileTypes: string[] = [];
        let modelTypes: string[] = [];
        let hexFileDirs: string[] = [];
        let subProjects: string[] = [];
        let timeouts: number[] = [];
        //console.log("deviceRole的长度是 " + ob[key].deviceRole!.length);
        if (!!ob[key].deviceRole!) {
          for (let v of ob[key].deviceRole!) {
            boardTypes.push(ob[key].boardType);
            compileTypes.push(ob[key].compilerType!);
            modelTypes.push(ob[key].model);
            hexFileDirs.push("hexFiles");
            addresses.push("0x1000");
            console.log("创建目录时子目录是：" + v);
            subProjects.push(v);
            timeouts.push(parseInt(ob[key].timeout));
          }
        }
        pd.address = addresses
        pd.subBoardTypes = boardTypes;
        pd.subCompileTypes = compileTypes;
        pd.subHexFileDirs = hexFileDirs;
        pd.subProjectArray = subProjects;
        pd.subModelTypes = modelTypes;
        pd.subTimeouts = timeouts;
        pd.experimentType = ob[key].type
        // if (!!ob[key].type && ob[key].type!.trim() == "freecoding") {
        //   this.freeCodingDataService.parseProjectDataFromFile(pd)
        // }
        // else{
        //   console.log("normal project")
        // }
        pa[key] = pd;

        // if (!ob[key].type) continue;
        // this.multiProjectData.projectType = ob[key].type!;
      }
      //将数据存储到全局变量里面
      this.multiProjectData.dataMap = pa;
      console.log("----------AAA---------------------" + JSON.stringify(pa))
      //把第一个实验的数据存储为当前数据
      for (let key of Object.keys(ob)) {
        this.copyDataFromDataMap(key)
        break;
      }
      return true

    } catch (error) {
      this.outputResult("Parse JSON Error!" + error);
      return false;
    }
  }
  async copyDataFromDataMap(pid: string): Promise<boolean> {
    try {
      Object.assign(this.projectData, this.multiProjectData.dataMap[pid]);
      return true;
    } catch (error) {
      this.outputResult(error);
      return false;
    }
  }
  async resetProgramData() {
    this.projectData.subWaitingIds = []
    this.projectData.fileHash = []
  }
  copyLdcDataFromData() {
    this.ldcData.serverType = this.projectData.serverType
    this.ldcData.waitingIds = this.projectData.subWaitingIds
    this.ldcData.serverType = this.projectData.serverType
    this.ldcData.clientIds = this.projectData.subClientId
    this.ldcData.ports = this.projectData.subClientPort
    this.ldcData.pid = this.projectData.pid
    this.ldcData.serverTimeout = Math.max(...this.projectData.subTimeouts).toString()
  }

  refreshMultiData() {
    let pid = this.projectData.pid
    this.copyLdcDataFromData();
    console.log("--refresh multiData"+JSON.stringify(this.projectData))
    this.multiProjectData.dataMap[pid] = this.projectData
  }
  private generate16ByteNumber(): string {
    return (
      Math.random()
        .toString()
        .substring(3, 11) +
      Math.random()
        .toString()
        .substring(3, 11)
    );
  }
  generateWaitingID() {
    return this.generate16ByteNumber();
  }
}
