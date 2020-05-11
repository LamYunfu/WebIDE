import { getBoardType } from "./../globalconst";
import { FileMapper } from "./../util/filemapper";
import { UdcTerminal } from "./../util/udc-terminal";
import * as http from "http";
import * as fs from "fs-extra";
import * as ach from "archiver";
import * as crypto from "crypto";
import * as FormData from "form-data";
import { injectable, inject } from "inversify";
import { Logger } from "../util/logger";
import {
  ALIOS_IP,
  ALIOS_PORT,
  RootDirPath,
} from "../../setting/backend-config";
import * as path from "path";
import { DistributedCompiler } from "./distributedcompiler";

@injectable()
export class NewAliosCompiler {
  constructor(
    @inject(UdcTerminal) protected readonly udc: UdcTerminal,
    @inject(FileMapper) protected readonly fm: FileMapper,
    @inject(RootDirPath) public rootDir: RootDirPath,
    @inject(DistributedCompiler) public dc: DistributedCompiler
  ) {}
  async postNameAndType(pid: string) {
    let { dirName, model, deviceRole } = await this.udc.getPidInfos(pid);
    for (let item of deviceRole!) {
      this.udc.outputResult(`Compile:${item}`);
      // let res = await this.postSingleSrcFile(dirName, item, pid);
      let res = await this.compileSingleFile(dirName, item, pid, model);
      if (res != "scc") return "err";
    }
    return "scc";
  }
  async compileSingleFile(
    dirName: string,
    item: string,
    pid: string,
    model: string
  ) {
    let p = await this.dc.compile(
      path.join(this.rootDir.val, dirName, item),
      path.join(
        this.rootDir.val,
        dirName,
        "hexFiles",
        `${new Buffer(`${item}`).toString("hex")}.hex`
      ),
      getBoardType(model),
      "alios"
    );
    if (p == "scc") {
      let tmp: any = {};
      tmp[item] = new Buffer(`${item}`).toString("hex") + ".hex";
      this.fm.setFileNameMapper(pid, tmp);
    }
    return p;
  }
  async postSingleSrcFile(projectName: string, role: string, pid: string) {
    Logger.info("postSingleSrcFile");
    let { model } = this.udc.getPidInfos(pid);
    let _this = this;
    let st = fs.createWriteStream(
      path.join(this.rootDir.val, projectName, `${role}.zip`)
    ); //打包
    let achst = ach
      .create("zip")
      .directory(path.join(this.rootDir.val, projectName, role), false);
    let hash = crypto.createHash("sha1");
    let hashVal = "";
    let p = new Promise((resolve) => {
      st.on("close", () => {
        console.log("Packing files successful!");
        resolve("scc");
      });
    })
      .then((res) => {
        if (res == "scc") {
          hash = crypto.createHash("sha1");
          let buff = new Buffer(
            fs.readFileSync(
              path.join(this.rootDir.val, projectName, `${role}.zip`)
            )
          ); //初始化
          hashVal = hash.update(buff).digest("hex");
          return new Promise((resolve) => {
            let configRequest = http.request(
              {
                //
                method: "POST",
                hostname: ALIOS_IP,
                port: ALIOS_PORT,
                path: "/config",
                headers: {
                  "Content-Type": "application/json",
                },
              },
              (mesg) => {
                if (mesg == null) {
                  _this.udc.outputResult("Network error!");
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
                    console.log("Alios Post Config SCC!");
                  } else {
                    console.log("Alios Post Config Err:" + res.status);
                    _this.udc.outputResult(
                      "Alios Post Config Err:" + res.status
                    );
                  }
                  resolve("scc");
                  Logger.info("config state :" + res.status);
                });
              }
            );
            configRequest.write(
              JSON.stringify({
                examplename: "helloworld",
                // "boardname": "esp32devkitc",
                boardname: getBoardType(model),
                filehash: hashVal,
              })
            );
            configRequest.end();
            configRequest.on("error", () => {
              _this.udc.outputResult("Network error!");
              resolve("err");
            });
          });
        }
      })
      .then((res) => {
        if (res == "scc") {
          console.log("start upload zip file");
          let fm = new FormData();
          return new Promise((resolve) => {
            let uploadRequest = http.request(
              {
                //传zip
                method: "POST",
                hostname: ALIOS_IP,
                port: ALIOS_PORT,
                path: "/upload",
                headers: fm.getHeaders(),
              },
              (mesg) => {
                if (mesg == null) {
                  _this.udc.outputResult("Network error!");
                  resolve("err");
                  return;
                }
                let bf = "";
                mesg.on("data", (b: Buffer) => {
                  bf += b.toString("utf8");
                  console.log(bf);
                });
                mesg.on("error", () => {
                  Logger.info("error happened while upload in Alios");
                  _this.udc.outputResult("Network error!");
                  resolve("err");
                });
                mesg.on("end", () => {
                  console.log(bf);
                  let res: any = JSON.parse(bf);
                  if (res.result) {
                    console.log("Alios Post Upload SCC!");
                    resolve("scc");
                  } else {
                    console.log("Alios Post Upload Err:" + res.status);
                    _this.udc.outputResult(
                      `Alios Post Upload Err:${res.status}`
                    );
                  }
                });
              }
            );
            uploadRequest.on("error", () => {
              _this.udc.outputResult("Network error!");
              resolve("err");
            });
            let blob = fs.readFileSync(
              path.join(this.rootDir.val, projectName, `${role}.zip`)
            );
            fm.append("file", blob, "install.zip");
            fm.pipe(uploadRequest);
          });
        }
      })
      .then((res) => {
        if (res == "scc") {
          console.log("start downloading");
          return new Promise((resolve) => {
            let downloadRequest = http.request(
              {
                //下载
                method: "POST",
                hostname: ALIOS_IP,
                port: ALIOS_PORT,
                path: "/download",
                headers: {
                  "Content-Type": "application/json",
                },
              },
              async (mesg) => {
                if (mesg == undefined) {
                  _this.udc.outputResult("Network error!");
                  Logger.info("error happened while downloading");
                  resolve("err");
                  return;
                }
                let bufferStore = "";
                if (
                  mesg.headers["content-type"] == "application/octet-stream"
                ) {
                  let ws = fs.createWriteStream(
                    path.join(
                      this.rootDir.val,
                      projectName,
                      "hexFiles",
                      `${new Buffer(`${role}`).toString("hex")}.hex`
                    ),
                    {
                      encoding: "binary",
                    }
                  );
                  ws.on("close", () => {
                    let tmp: any = {};
                    tmp[role] = new Buffer(`${role}`).toString("hex") + ".hex";
                    _this.fm.setFileNameMapper(pid, tmp);
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
                    _this.udc.outputResult(
                      "compile err:" + JSON.parse(bufferStore).status
                    );
                    resolve("err");
                  });
                }
                mesg.on("error", () => {
                  Logger.info("error happened while download in Alios");
                  _this.udc.outputResult("Network error!");
                  resolve("err");
                });
              }
            );
            downloadRequest.on("error", () => {
              _this.udc.outputResult("Network error!");
              resolve("err");
            });
            downloadRequest.write(
              JSON.stringify({
                filehash: hashVal,
              })
            );
            downloadRequest.end();
          });
        }
      });
    achst.pipe(st);
    achst.finalize();
    return await p;
  }
}
