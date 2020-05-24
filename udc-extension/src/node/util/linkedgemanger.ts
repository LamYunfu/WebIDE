import { UdcTerminal } from "./udc-terminal";
import { injectable, inject } from "inversify";
// import * as path from 'path'
// import * as fs from 'fs-extra';
// import { Logger } from './logger'
import { Programer } from "./programmer";
import * as path from "path";
import * as fs from "fs";
import { Logger } from "./logger";
import { CONFIGPATH, RootDirPath } from "../../setting/backend-config";
import { OS } from "@theia/core";

@injectable()
export class LinkEdgeManager {
  constructor(
    @inject(UdcTerminal) protected readonly ut: UdcTerminal,
    @inject(Programer) protected readonly pm: Programer,
    @inject(RootDirPath) public rootDir: RootDirPath
  ) {}
  async delayNs(limit: number, f: (...[]) => boolean): Promise<boolean> {
    for (let i = 0; i < limit; i++) {
      let res = f();
      if (res) {
        return true;
      }
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
      console.log("delay");
    }
    return false;
  }
  getIotId(): string {
    try {
      let raw = fs
        .readFileSync(
          path.join(this.rootDir.val, "LinkEdge", "Config", "config.json")
        )
        .toString();
      let ob = JSON.parse(raw);
      return ob["IoTId"];
    } catch (error) {
      this.ut.outputResult("config.json is incorrect!\nPlease check it or restore it to default!","err");
      return "";
    }
  }
  async openConfigFile(pid: string) {
    let { dirName } = this.ut.pidQueueInfo[pid];
    let filePath = path.join(
      this.ut.rootDir.val,
      dirName,
      "Config",
      "config.json"
    );
    if (OS.type() == OS.Type.Linux) {
      this.ut.udcClient &&
        this.ut.udcClient.onConfigLog({
          name: "openSrcFile",
          passwd: path.join(filePath),
        });
    } else {
      this.ut.udcClient &&
        this.ut.udcClient.onConfigLog({
          name: "openSrcFile",
          passwd: `/` + path.join(filePath),
        });
    }
  }

  async initConfigDir(pid: string): Promise<boolean> {
    let configContent = `{"deviceUsage":"QUEUE","gatewayType":"raspberry_pi","hexFileDir":"hexFiles","gatewayConnectCommand":"cd /linkEdge&&./link-iot-edge-standard.sh --config $ProductKey $DeviceName  $DeviceSecret && ./link-iot-edge-standard.sh --start","gatewayStopCommand":"cd /linkEdge&&./link-iot-edge-standard.sh --stop","gatewayStartCommand":"cd /linkEdge&&./link-iot-edge-standard.sh --start","projects":[],"burningDataQueue":{"program":{"runtime":30,"address":"0x10000"}}}`;
    !fs.existsSync(CONFIGPATH) ? fs.mkdirSync(CONFIGPATH) : "";

    if (
      await this.delayNs(4, () => {
        if (
          this.ut.pidQueueInfo[pid] == undefined ||
          this.ut.pidQueueInfo[pid].dirName == undefined
        ) {
          return false;
        }
        return true;
      })
    ) {
      console.log("error c");
    } else {
      console.log("ok");
    }
    let { dirName } = this.ut.pidQueueInfo[pid];
    let currentPath = path.join(CONFIGPATH, dirName);
    !fs.existsSync(currentPath) ? fs.mkdirSync(currentPath) : "";
    let hexDir = path.join(CONFIGPATH, dirName, "hexFiles");
    !fs.existsSync(hexDir) ? fs.mkdirSync(hexDir) : "";
    let filePath = path.join(currentPath, "config.json");
    //
    fs.existsSync(hexDir) ? fs.writeFileSync(filePath, configContent) : "";
    return true;
  }
  async programGateWay(pid: string, threeTuple: any) {
    this.ut.parseLinkEdgeConfig(pid);
    Logger.info("programGateWay:" + pid);
    let { dirName } = this.ut.pidQueueInfo[pid];
    this.ut.parseLinkEdgeConfig(pid, threeTuple);
    let filehash = await this.pm.fileUpload(
      path.join(CONFIGPATH, dirName, "hexFiles", "command.hex")
    );
    if (filehash == "err") return "err";
    let burnOption = this.ut.LinkEdgeConfig["burningGateway"];
    let op = {
      type: "QUEUE",
      pid: "19",
      groupId: "4274281479971534",
      program: [
        {
          filehash: "230ef251e73074bce1e40dc5d7c5ee4d563406b8",
          waitingId: "9617087952215092",
          model: "tinylink_platform_1",
          runtime: 30,
          address: "0x10000",
        },
      ],
    };
    burnOption = {
      ...this.ut.LinkEdgeConfig["burningDataQueue"],
      pid: pid,
      type: "QUEUE",
      groupId: (
        Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
        Math.pow(10, 15)
      ).toString(),
    };
    burnOption["program"] = [
      {
        ...burnOption["program"],
        filehash: filehash,
        model: this.ut.LinkEdgeConfig["gatewayType"],
        waitingId: (
          Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
          Math.pow(10, 15)
        ).toString(),
      },
    ];
    this.ut.is_connected ? "" : this.ut.connect("", "", pid, "3");
    for (let i = 4; ; i--) {
      //等待四秒分配设备
      let devInfo = this.ut.get_devlist();
      if (devInfo != undefined && devInfo != null) {
        break;
      }
      if (i == 0) {
        this.ut.outputResult(
          "No device information returned from LDC.\n Please disconnect and retry!.","err"
        );
        return "fail";
      }
      Logger.info("waiting for allocate device");
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
    }
    return await this.ut.program_device(pid, JSON.stringify(burnOption));
  }
  async processLinkEdgeConnect(pid: string, threeTuple: any) {
    this.programGateWay(pid, threeTuple);
  }
  async addProjectToLinkEdge(pid: string, deviceInfo: any) {
    this.ut.parseLinkEdgeConfig(pid);
    let index = parseInt(deviceInfo.index);
    let p: any[] = this.ut.LinkEdgeConfig["projects"];
    if (
      p.some((value) => {
        return value.deviceName == deviceInfo.deviceName;
      })
    ) {
      return false;
    }

    this.ut.LinkEdgeConfig["projects"][index] == undefined
      ? this.ut.LinkEdgeConfig["projects"].push({
          projectName: deviceInfo.deviceName,
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
        })
      : (this.ut.LinkEdgeConfig["projects"][index] = {
          projectName: deviceInfo.deviceName,
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
        });
    this.ut.flushLinkEdgeConfig(pid);
    return true;
  }
  async removeProjectInLinkEdge(pid: string, indexStr: string) {
    Logger.info("remove a device");
    let index = parseInt(indexStr);
    let { dirName } = this.ut.pidQueueInfo[pid];
    let project = this.ut.LinkEdgeConfig["projects"][index];
    let subDirName = project.projectName;
    let subDirPath = path.join(
      this.ut.rootDir.val,
      dirName,
      "device",
      subDirName
    );
    this.ut.LinkEdgeConfig["projects"].splice(index, 1);
    fs.existsSync(subDirPath) &&
      fs.readdirSync(subDirPath).forEach((value) => {
        fs.unlinkSync(path.join(subDirPath, value));
      });
    fs.existsSync(subDirPath) && fs.rmdirSync(subDirPath);
    this.ut.flushLinkEdgeConfig(pid);
    return true;
  }
  async developLinkEdgeProject(pid: string, indexStr: string) {
    let index = parseInt(indexStr);
    console.log("develop");
    let project = this.ut.LinkEdgeConfig["projects"][index];
    let { deviceType, projectName } = project;
    if (deviceType == undefined || projectName == undefined) {
      this.ut.outputResult("invaild deviceType or device name ");
      return;
    }
    this.ut.requestFixedTemplate(pid, deviceType, projectName);
    return true;
  }
}
