import { injectable, inject } from "inversify";
import * as fs from "fs-extra";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import { AdhocSetting, QueueSetting } from "../../data_center/freecoding_data";
import { ProjectData } from "../../data_center/project_data";
import { MultiProjectData } from "../../data_center/multi_project_data";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import * as path from "path";
@injectable()
export class FreeCodingDataService {
  constructor(
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
  ) { }
  async parseAllData() {
    console.log("---parse all data---")
    let ob = this.multiProjectData.dataMap
    for (let item of Object.keys(this.multiProjectData.dataMap)) {
      if (!!ob[item].experimentType && (ob[item].experimentType!.trim() == "freecoding"|| ob[item].experimentType!.trim() == "displayboard"))
        await this.parseProjectDataFromFile(ob[item])
    }

    Object.assign(this.projectData, this.multiProjectData.dataMap[this.projectData.pid])
    console.log("---after parse All multiProjectData" + JSON.stringify(this.multiProjectData))
    console.log("---after parse All projectData:" + JSON.stringify(this.projectData))

  }
  parseProjectDataFromFile(pd: ProjectData): boolean {
    console.log("------parseProjectDataFromFile")
    let cpath = path.join(
      this.multiProjectData.rootDir,
      pd.projectRootDir,
      "config.json"
    );
    let ob_: AdhocSetting | undefined
    let ob: QueueSetting | undefined
    try {
      let rawConfig: Buffer
      try {
        rawConfig = fs.readFileSync(cpath);
      } catch (error) {
        this.outputResult("Error reading config.json,try to delete the project directory and retry", "err")
        return false
      }

      let jc = new JsonConvert();
      jc.operationMode = OperationMode.ENABLE; // print some debug data
      jc.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
      jc.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL;

      let err, err_
      try {
        ob = jc.deserializeObject(
          JSON.parse(rawConfig.toString()),
          QueueSetting
        );
      } catch (error) {
        err = error
        ob = undefined
      }
      console.log(JSON.stringify(ob));
      if (!ob) {
        try {
          ob_ = jc.deserializeObject(
            JSON.parse(rawConfig.toString()),
            AdhocSetting
          );
        } catch (error) {
          err_ = error
          ob_ = undefined
        }
      }
      if (!ob_ && !ob) {
        this.outputResult(err.toString())
        this.outputResult(err_.toString())
        return false
      }
    } catch (error) {
      console.log(error);
      return false
    }
    if (!!ob_) {
      this.convertSettingToProjectData(ob_, pd)
    }
    if (!!ob) {
      this.convertSettingToProjectData(ob, pd)
    }
    return true
  }
  convertSettingToProjectData(
    st: AdhocSetting | QueueSetting,
    pd: ProjectData
  ): boolean {
    if (!st.version || st.version.trim() != "1.0.0") {
      this.outputResult("The version of config.json is not consistent with current system,this may cause failure,try delete the project and refresh this page!")
    }
    try {
      pd.loginType = "adhoc";
      pd.serverType = st.serverType!;
      let subProjects = st.projects;
      if (subProjects == null) return false;
      let clientIds: string[] = [];
      let devPorts: string[] = [];
      let models: string[] = [];
      let addresses: string[] = [];
      let boardTypes: string[] = [];
      let hexFileDirs: string[] = [];
      let names: string[] = [];
      let compileTypes: string[] = [];
      let timeouts: number[] = [];
      for (let it of subProjects) {
        addresses.push(it.program!.address!);
        hexFileDirs.push(st.hexFileDir!);
        boardTypes.push(it.boardType!);
        names.push(it.projectName!);
        compileTypes.push(it.compileType!);
        timeouts.push(it.program!.runtime!);
      }
      if (st instanceof AdhocSetting) {
        for (let it of st.projects!) {
          clientIds.push(it.program!.clientId!);
          devPorts.push(it.program!.devPort!);
        }
      } else {
        for (let it of st.projects!) {
          models.push(it.program!.model!)
        }
      }
      pd.address = addresses;
      pd.subClientId = clientIds;
      pd.subClientPort = devPorts;
      pd.subHexFileDirs = hexFileDirs;
      pd.subBoardTypes = boardTypes;
      pd.subProjectArray = names;
      pd.subCompileTypes = compileTypes;
      pd.subTimeouts = timeouts;
      pd.subModelTypes = models;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
