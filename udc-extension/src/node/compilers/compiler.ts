import { NewContikiCompiler } from "./contiki-complier";
import { NewAliosCompiler } from "./new-alios-compiler";
import { Logger } from "../util/logger";
import { UdcTerminal } from "../util/udc-terminal";
import { UdcCompiler } from "./udc-compiler";
// import { AliosCompiler } from './alios-compiler';
import { inject, injectable } from "inversify";
import { getCompilerType } from "../globalconst";
import * as path from "path";
import * as fs from "fs";
import { RaspeberryGccCompiler } from "./raspberry-gcc-compiler";
import { RootDirPath } from "../../setting/backend-config";
@injectable()
/*
编译
*/
export class Compiler {
  constructor(
    @inject(UdcCompiler) protected readonly udcCompiler: UdcCompiler,
    // @inject(AliosCompiler) protected readonly aliosCompiler: AliosCompiler,
    @inject(NewAliosCompiler)
    protected readonly newAliosCompiler: NewAliosCompiler,
    @inject(NewContikiCompiler)
    protected readonly newContikiCompiler: NewContikiCompiler,
    @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal,
    @inject(RaspeberryGccCompiler)
    protected readonly rgc: RaspeberryGccCompiler,
    @inject(RootDirPath) public rootDir: RootDirPath
  ) {}

  async linkEdgeCompile(pid: string, index: string) {}
  async compile(pid: string) {
    let { model, dirName } = this.udcTerminal.getPidInfos(pid);
    let hexFilePath = path.join(this.rootDir.val, dirName, "hexFiles");
    fs.existsSync(hexFilePath) ? "" : fs.mkdirSync(hexFilePath);
    Logger.info("start compiling");
    Logger.info("MODEL is:" + model);
    this.udcTerminal.outputResult("compiling......");
    let cmType = getCompilerType(model);
    if (cmType == "alios") {
      // this.udcCompiler.outputResult("use alios compiler")
      Logger.info("use alios compiler");
      // await this.aliosCompiler.postNameAndType(pid)
      return await this.newAliosCompiler.postNameAndType(pid);
    }
    if (cmType == "contiki") {
      Logger.info("use contiki compiler");
      return await this.newContikiCompiler.postNameAndType(pid);
    }
    if (cmType == "tinylink") {
      // this.udcCompiler.outputResult("use tinylink compiler")
      Logger.info("use tinylink compiler");
      let bv = await this.udcCompiler.postSrcFile(pid);
      if (bv != "scc") return "fail";
      return "scc";
    }
    if (cmType == "raspberry_pi") {
      if (
        this.udcTerminal.pidQueueInfo[pid].type == "freecoding" &&
        this.udcTerminal.freeCodingConfig["projects"][0]["compilationMethod"] ==
          "none"
      ) {
        Logger.info("skip compiling","skip")
        return "scc";
      } else {
        return await this.rgc.processFreeCoding(pid);
      }
    }

    Logger.info("no this type");
    return "fail";
  }
  async compileSingleFile(pid: string, fn: string) {
    let bv = await this.udcCompiler.postSrcFile(pid, fn);
    if (bv != "scc") return "fail";
    return "scc";
  }
}
