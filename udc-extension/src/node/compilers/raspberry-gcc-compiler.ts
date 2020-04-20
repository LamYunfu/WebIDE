import { FileMapper } from "./../util/filemapper";
// import { UdcTerminal } from "./../util/udc-terminal";
import * as http from "http";
import * as fs from "fs-extra";
import * as ach from "archiver";
import * as crypto from "crypto";
import * as FormData from "form-data";
import { injectable, inject } from "inversify";
import { Logger } from "../util/logger";
import {
  RASPBERRY_GCC_IP,
  RASPBERRY_GCC_PORT,
  RootDirPath,
} from "../../setting/backend-config";
import * as path from "path";
import { CompilerInterFace } from "./compilerInterface";
import { UdcTerminal } from "../util/udc-terminal";
import { DistributedCompiler } from "./distributedcompiler";
@injectable()
export class RaspeberryGccCompiler implements CompilerInterFace {
  constructor(
    @inject(UdcTerminal) protected readonly udc: UdcTerminal,
    @inject(FileMapper) protected readonly fm: FileMapper,
    @inject(RootDirPath) public rootDir: RootDirPath,
    @inject(DistributedCompiler) protected readonly dc: DistributedCompiler
  ) {}
  outputResult(str: string) {
    this.udc.outputResult(str);
  }
  //   async postNameAndType(pid: string) {
  //     let { dirName, deviceRole } = await this.getPidInfos(pid);
  //     for (let item of deviceRole!) {
  //       this.outputResult(`compile:${item}`);
  //       let res = await this.postSingleSrcFile(dirName, item, pid);
  //       if (res != "scc") return "err";
  //     }
  //     return "scc";
  //   }
  async archiveFile(fileDir: string, outputPath: string): Promise<string> {
    try {
      let st = fs.createWriteStream(outputPath); //打包
      let achst = ach.create("zip").directory(fileDir, false);
      achst.pipe(st);
      achst.finalize();
      await new Promise((res) =>
        st.on("close", () => {
          console.log("------------------finish archive");
          res();
        })
      );
      return outputPath;
    } catch (error) {
      this.outputResult(error);
      return "err";
    }
  }
  async config(data: any): Promise<string> {
    let _this = this;
    return new Promise((resolve) => {
      let configRequest = http.request(
        {
          //
          method: "POST",
          hostname: RASPBERRY_GCC_IP,
          port: RASPBERRY_GCC_PORT,
          path: "/config",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (mesg) => {
          if (mesg == null) {
            _this.outputResult("network error");
            resolve("err");
            return;
          }
          let bf = "";
          mesg.on("data", (b: Buffer) => {
            bf += b.toString("utf8");
          });

          mesg.on("end", () => {
            let res: any = JSON.parse(bf);
            if (res.result) {
              console.log("RASPBERRY_GCC Post Config SCC!");
            } else {
              console.log("RASPBERRY_GCC Post Config Err:" + res.status);
              _this.outputResult("RASPBERRY_GCC Post Config Err:" + res.status);
            }
            resolve("scc");
            Logger.info("config state :" + res.status);
          });
        }
      );
      configRequest.write(JSON.stringify(data));
      configRequest.end();
      configRequest.on("error", () => {
        _this.outputResult("network error");
        resolve("err");
      });
    });
  }
  async upload(fm: FormData): Promise<string> {
    let _this = this;
    return new Promise((resolve) => {
      let uploadRequest = http.request(
        {
          //传zip
          method: "POST",
          hostname: RASPBERRY_GCC_IP,
          port: RASPBERRY_GCC_PORT,
          path: "/upload",
          headers: fm.getHeaders(),
        },
        (mesg) => {
          if (mesg == null) {
            _this.outputResult("network error");
            resolve("err");
            return;
          }
          let bf = "";
          mesg.on("data", (b: Buffer) => {
            bf += b.toString("utf8");
            console.log(bf);
          });
          mesg.on("error", () => {
            Logger.info("error happened while upload in RASPBERRY_GCC");
            _this.outputResult("network error");
            resolve("err");
          });
          mesg.on("end", () => {
            console.log(bf);
            let res: any = JSON.parse(bf);
            if (res.result) {
              console.log("RASPBERRY_GCC Post Upload SCC!");
              resolve("scc");
            } else {
              console.log("RASPBERRY_GCC Post Upload Err:" + res.status);
              _this.outputResult(`RASPBERRY_GCC Post Upload Err:${res.status}`);
            }
          });
        }
      );
      uploadRequest.on("error", () => {
        _this.outputResult("network error");
        resolve("err");
      });
      fm.pipe(uploadRequest);
    });
  }
  async getFile(data: any, filePath: string): Promise<string> {
    let _this = this;
    console.log("start downloading");
    let res: string = await new Promise((resolve) => {
      let downloadRequest = http.request(
        {
          //下载
          method: "POST",
          hostname: RASPBERRY_GCC_IP,
          port: RASPBERRY_GCC_PORT,
          path: "/download",
          headers: {
            "Content-Type": "application/json",
          },
        },
        async (mesg) => {
          if (mesg == undefined) {
            _this.outputResult("network error");
            Logger.info("error happened while downloading");
            resolve("err");
            return;
          }
          let bufferStore = "";
          if (mesg.headers["content-type"] == "application/octet-stream") {
            let ws = fs.createWriteStream(filePath, {
              encoding: "binary",
            });
            ws.on("close", () => {
              resolve("scc");
              console.log("download scc");
            });
            mesg.on("data", (b: Buffer) => {
              console.log("downloading");
              bufferStore += b.toString("binary");
            });
            mesg.on("end", () => {
              ws.write(new Buffer(bufferStore, "binary"), () => {
                ws.close();
              });
            });
          } else {
            mesg.on("data", (b: Buffer) => {
              console.log("downloading");
              bufferStore += b.toString();
            });
            mesg.on("end", () => {
              _this.outputResult(
                "compile err:" + JSON.parse(bufferStore).status
              );
              resolve("err");
            });
          }
          mesg.on("error", () => {
            Logger.info("error happened while download in RASPBERRY_GCC");
            _this.outputResult("network error");
            resolve("err");
          });
        }
      );
      downloadRequest.on("error", () => {
        Logger.info("get file err");
        _this.outputResult("network error");
        resolve("err");
      });
      downloadRequest.write(JSON.stringify(data));
      downloadRequest.end();
    });
    return res;
  }
  async compile(fileDir: string, outputPath: string) {
    if (!fs.existsSync(fileDir)) {
      this.outputResult("not exist " + fileDir);
      return "err";
    }
    let srczip = await this.archiveFile(
      fileDir,
      path.join(__dirname, "tmp.zip")
    );
    if (srczip == "err") {
      Logger.info("arvhive file err");
      return "err";
    }
    let buff = new Buffer(fs.readFileSync(srczip));
    let hashObj = crypto.createHash("sha1");
    let hasval = hashObj.update(buff).digest("hex");
    console.log("hash------------------:" + hasval);
    let confRes = await this.config({ filehash: hasval });
    if (confRes == "err") {
      Logger.info("config file err");
      return "err";
    }
    let fm = new FormData();
    fm.append("file", buff, "src.zip");
    fs.unlinkSync(srczip);
    let uploadRes = await this.upload(fm);
    if (uploadRes == "err") {
      Logger.info("upload file err");
      return "err";
    }
    return await this.getFile({ filehash: hasval }, outputPath);
  }
  async processFreeCoding(pid: string) {
    Logger.info("start compile raspberry");
    try {
      let { dirName } = this.udc.pidQueueInfo[pid];
      let { projectName } = this.udc.freeCodingConfig["projects"][0];
      let outputPath = path.join(
        this.rootDir.val,
        dirName,
        "hexFiles",
        new Buffer(projectName).toString("hex") + ".hex"
      );
      let fileDir = path.join(this.rootDir.val, dirName, projectName);
      
      // let res = await this.compile(fileDir, outputPath);
      let res = await this.dc.compile(
        fileDir,
        outputPath,
        "raspberrypi3",
        "raspbian"
      );
      this.fm.setFileNameMapper(pid, {
        projectName: new Buffer(projectName).toString("hex") + ".hex",
      });
      return res;
    } catch (error) {
      Logger.info(error);
      return "err";
    }
  }
}
