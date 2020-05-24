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
import { FileMapper } from "../util/filemapper";
import { DistributedCompiler } from "./distributedcompiler";
import { BoardAndCompileType } from "./boardtocompilemethod";
@injectable()
/*
编译
*/
export class Compiler {
  constructor(
    @inject(BoardAndCompileType) readonly bat: BoardAndCompileType,
    @inject(UdcTerminal) protected readonly udc: UdcTerminal,
    @inject(FileMapper) protected readonly fm: FileMapper,
    @inject(DistributedCompiler) protected readonly dc: DistributedCompiler,
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
  // async compile(pid: string) {
  //   this.udcTerminal.logEnable = false;
  //   let { model, dirName } = this.udcTerminal.getPidInfos(pid);
  //   let hexFilePath = path.join(this.rootDir.val, dirName, "hexFiles");
  //   fs.existsSync(hexFilePath) ? "" : fs.mkdirSync(hexFilePath);
  //   Logger.info("start compiling");
  //   Logger.info("MODEL is:" + model);
  //   this.udcTerminal.outputResult("Compiling...");
  //   let cmType = getCompilerType(model);
  //   if (cmType == "alios") {
  //     Logger.info("use alios compiler");
  //     return await this.newAliosCompiler.postNameAndType(pid);
  //   }
  //   if (cmType == "contiki") {
  //     Logger.info("use contiki compiler");
  //     return await this.newContikiCompiler.postNameAndType(pid);
  //   }
  //   if (cmType == "tinylink") {
  //     Logger.info("use tinylink compiler");
  //     let bv = await this.udcCompiler.postSrcFile(pid);
  //     if (bv != "scc") return "fail";
  //     return "scc";
  //   }
  //   if (cmType == "raspberry_pi") {
  //     if (
  //       this.udcTerminal.pidQueueInfo[pid].type == "freecoding" &&
  //       this.udcTerminal.freeCodingConfig["projects"][0]["compilationMethod"] ==
  //         "none"
  //     ) {
  //       Logger.info("skip compiling", "skip");
  //       return "scc";
  //     } else {
  //       return await this.rgc.processFreeCoding(pid);
  //     }
  //   }

  //   Logger.info("no this type");
  //   return "fail";
  // }
  async compile(pid: string) {
    this.udcTerminal.logEnable = false;
    let { model, dirName } = this.udcTerminal.getPidInfos(pid);
    let hexFilePath = path.join(this.rootDir.val, dirName, "hexFiles");
    fs.existsSync(hexFilePath) ? "" : fs.mkdirSync(hexFilePath);
    Logger.info("start compiling");
    Logger.info("MODEL is:" + model);
    this.udcTerminal.outputResult("Compiling...");
    let cmType = this.bat.getCompileType(model);
    if (cmType == "err") {
      this.udc.outputResult(
        `There is no this kind of compiler! board type:${model}`,
        "err"
      );
      return "err";
    }
    if (cmType == "tinylink") {
      Logger.info("use tinylink compiler");
      let bv = await this.udcCompiler.postSrcFile(pid);
      if (bv != "scc") return "fail";
      return "scc";
    } else {
      return await this.compileNotTinyLink(pid);
    }
  }
  async compileSingleFile(pid: string, fn: string) {
    let bv = await this.udcCompiler.postSrcFile(pid, fn);
    if (bv != "scc") return "fail";
    return "scc";
  }

  async compileNotTinyLink(pid: string) {
    let { dirName, model, deviceRole } = await this.udc.getPidInfos(pid);
    for (let item of deviceRole!) {
      this.udc.outputResult(`Compile:${item}`);
      // let res = await this.postSingleSrcFile(dirName, item, pid);
      let p = await this.dc.compile(
        path.join(this.rootDir.val, dirName, item),
        path.join(
          this.rootDir.val,
          dirName,
          "hexFiles",
          `${new Buffer(`${item}`).toString("hex")}.hex`
        ),
        this.bat.getRealBoardType(model),
        this.bat.getCompileType(model)!
      );
      if (p == "scc") {
        let tmp: any = {};
        tmp[item] = new Buffer(`${item}`).toString("hex") + ".hex";
        this.fm.setFileNameMapper(pid, tmp);
      } else return "err";
    }
    return "scc";
  }
}
