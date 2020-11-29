// import { getCompilerType } from './../globalconst';
import { UdcTerminal } from "./udc-terminal";
import { FileMapper } from "./filemapper";
import { Logger } from "./logger";
import { injectable, inject } from "inversify";
import * as fs from "fs-extra";
import * as path from "path";
import * as unzip from "unzip";
import { RootDirPath } from "../../setting/backend-config";

@injectable()
export class Extractor {
  constructor(
    @inject(FileMapper) protected readonly fm: FileMapper,
    @inject(UdcTerminal) protected readonly ut: UdcTerminal,
    @inject(RootDirPath) public rootDir: RootDirPath
  ) {}

  projectDir: string = "";
  hexFileDir: string = "";
  init(projectName: string, dirName: string) {
    this.hexFileDir = path.join(this.rootDir.val, projectName, dirName);
    !fs.existsSync(this.hexFileDir) ? fs.mkdirsSync(this.hexFileDir) : "";
    this.projectDir = path.join(this.rootDir.val, projectName);
  }
  get hexFileDirectory() {
    return this.hexFileDir;
  }
  getHexName(fn: string) {
    let x = "B";
    return x + new Buffer(fn).toString("hex");
  }
  async extract(pid: string) {
    //提取成功返回“scc”
    Logger.info("start extract file");
    let _this = this;
    let { deviceRole, dirName } = this.ut.getPidInfos(pid);
    this.init(dirName, "hexFiles");
    let filePath = "";
    let r = "";
    for (let item of deviceRole!) {
      Logger.info("extract :" + item);
      item = item.split(".")[0];
      filePath = path.join(this.rootDir.val, dirName, `${item}Install.zip`);
      r = await new Promise((res, reject) => {
        let p = setTimeout(() => {
          this.ut.outputResult("Can't find the hex file in this zip", "err");
          res("err");
        }, 20000);
        fs.createReadStream(filePath)
          .pipe(unzip.Parse())
          .on("entry", function(entry) {
            let fileName: string = entry.path;
            let suffix = fileName.split(".").pop();
            let hexName = fileName.split("/").pop();
            if (suffix == "hex" || suffix == "bin") {
              Logger.info("find hex : " + hexName);
              clearTimeout(p);

              let fss = fs.createWriteStream(
                path.join(
                  _this.rootDir.val,
                  dirName,
                  "hexFiles",
                  _this.getHexName(item) + "sketch.ino.hex"
                )
              );
              fss.on("close", () => {
                // fss.close()
                let tmp: { [rawname: string]: string } = {};
                //tslint
                tmp[item] = _this.getHexName(item) + "sketch.ino.hex";
                Logger.info(
                  `extract a hex file(raw:${item} transform:${tmp[item]})`
                );
                _this.fm.setFileNameMapper(pid, tmp);
                res("scc");
              });
              entry.pipe(fss);
            } else {
              entry.autodrain();
            }
          });
      });
    }
    // let etArr = this.fm.getFileNameMapper(pid)
    // if (typeof (etArr) == 'string')
    //     return "failed"
    // for (let item of fnArr) {
    //     item = item.split(".")[0]
    //     console.log(item)
    //     if (etArr == undefined)
    //         return "failed"
    // }
    // return "scc"
    // }
    if (r == "scc") return "scc";
    else return "err";
  }
  async extractSingleFile(pid: string, fn: string) {
    //提取成功返回“scc”
    let _this = this;
    let { dirName } = this.ut.getPidInfos(pid);
    this.init(dirName, "hexFiles");
    let filePath = "";
    let item = fn.split(".")[0];
    filePath = path.join(this.projectDir, item + "Install.zip");
    await new Promise((res, reject) =>
      fs
        .createReadStream(filePath)
        .pipe(unzip.Parse())
        .on("entry", function(entry) {
          let fileName: string = entry.path;
          let suffix = fileName.split(".").pop();
          let hexName = fileName.split("/").pop();
          if (
            hexName!.match("sketch.*") ||
            suffix == "hex" ||
            suffix == "bin"
          ) {
            Logger.info("find hex : " + hexName);
            let fss = fs.createWriteStream(
              path.join(
                _this.hexFileDir,
                _this.getHexName(item) + "sketch.ino.hex"
              )
            );
            entry.pipe(fss);
            fss.on("close", () => {
              fss.close();
              let tmp: { [rawname: string]: string } = {};
              //tslint
              tmp[item] = _this.getHexName(item) + "sketch.ino.hex";
              Logger.info(
                `extract a hex file(raw:${item} transform:${tmp[item]})`
              );
              _this.fm.setFileNameMapper(pid, tmp);
              res("scc");
            });
          } else {
            entry.autodrain();
          }
        })
    );
    fs.unlinkSync(filePath);
    let etArr = this.fm.getFileNameMapper(pid);
    if (typeof etArr == "string" || etArr == undefined) return "failed";
    return "scc";
  }
  outputResult(arg0: string) {
    throw new Error("Method not implemented.");
  }
}