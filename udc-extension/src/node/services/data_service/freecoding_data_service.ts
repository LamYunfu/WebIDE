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
    @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
  ) { }
  parseProjectDataFromFile(pd: ProjectData) {
    // console.log(JSON.stringify({
    //   version: "1.0.0",
    //   usage: "queue",
    //   hexFileDir: "hexFiles",
    //   serverType: "tinylink_platform_1",
    //   projects: [
    //     {
    //       projectName: "tinylink",
    //       compileType: "tinylink",
    //       boardType: "tinylink",
    //       burnType: "queue",
    //       program: {
    //         model: "tinylink_platform_1",
    //         runtime: 60,
    //         address: "0x10000",
    //       },
    //     }
    //   ],
    // },))
    let cpath = path.join(
      this.multiProjectData.rootDir,
      pd.projectRootDir,
      "config.json"
    );
    try {
      let rawConfig = fs.readFileSync(cpath);
      let jc = new JsonConvert();
      jc.operationMode = OperationMode.ENABLE; // print some debug data
      jc.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
      jc.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL;
      let ob = jc.deserializeObject(
        JSON.parse(rawConfig.toString()),
        QueueSetting
      );
      console.log(JSON.stringify(ob));
      let ob_ = jc.deserializeObject(
        JSON.parse(rawConfig.toString()),
        AdhocSetting
      );
      console.log(JSON.stringify(ob_));
    } catch (error) {
      console.log(error);
    }
  }
  convertSettingToProjectData(
    st: AdhocSetting | QueueSetting,
    pd: ProjectData
  ): boolean {
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
      pd.subModelTypes = models
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
