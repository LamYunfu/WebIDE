import { FILE_SERVER_HOST } from './../../../setting/backend-config';
import { ProjectData } from './../../data_center/project_data';
import { Logger } from "../tools/logger";
import * as http from "http";
import * as fs from "fs-extra";
import * as crypto from "crypto";
import * as FormData from "form-data";
import { inject, injectable, interfaces } from "inversify";
import { CallInfoStorer } from "../log/call_info_storer";
import { CallSymbol } from "../../../setting/callsymbol";
import {
  PROGRAM_SERVER_IP,
  PROGRAM_SERVER_PORT,
} from "../../../setting/backend-config";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
export function bindLdcFileServer(bind: interfaces.Bind) {
  bind(LdcFileServer)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class LdcFileServer {
  constructor(
    @inject(CallInfoStorer) protected cis: CallInfoStorer,
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
  ) { }
  async fileUpload(filepath: string, index: string): Promise<boolean> {
    let uploadResult = "scc";
    let configResult = await new Promise((resolve) => {
      Logger.info("configuring burning program");
      let hash = crypto.createHash("sha1");
      let buff = fs.readFileSync(filepath);
      // let hashVal = hash.update(buff).digest("hex")
      let hashVal = hash.update(buff).digest("hex");
      console.log(JSON.stringify(this.projectData))
      this.projectData.fileHash[parseInt(index)] = hashVal
      console.log(JSON.stringify(this.projectData))
      Logger.info("hex hashval:" + hashVal);
      this.cis.storeCallInfoInstantly("start", CallSymbol.IPCF);
      let configRequest = http.request(
        {
          //
          method: "POST",
          hostname: FILE_SERVER_HOST,
          path: "/config",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (mesg) => {
          if (mesg == undefined) {
            this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            Logger.info("error happened while config");
            resolve("err");
            this.cis.storeCallInfoInstantly(
              "error back value",
              CallSymbol.IPCF,
              1
            );
            return;
          }
          let bf = "";
          mesg.on("error", (err) => {
            this.outputResult(
              `Configuring burning failed${err}`
              , "error");

            resolve("err");
          });
          mesg.on("data", (b: Buffer) => {
            bf += b.toString("utf8");
          });
          mesg.on("end", () => {
            Logger.info("config bf:" + bf.toString());
            let res: any = JSON.parse(bf);
            if (!res.result) {
              Logger.info("Initializing burning tools successful!");
              this.outputResult("Initializing burning tools successful!");
              Logger.info(res.status);
              this.cis.storeCallInfoInstantly("end", CallSymbol.IPCF);
              resolve("scc");
            } else {
              Logger.info(res.status); //已经存在
              this.cis.storeCallInfoInstantly("end", CallSymbol.IPCF);
              resolve("exist");
            }
          });
        }
      );
      configRequest.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        Logger.info("error happened while config");
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.IPCF, 1);
        resolve("err");
        return;
      });
      configRequest.write(
        JSON.stringify({
          filehash: hashVal,
        })
      );
      configRequest.end();
    });

    if (configResult == "scc") {
      let fm = new FormData();
      Logger.info("uploading hex file");
      this.cis.storeCallInfoInstantly("start", CallSymbol.FLUP);
      uploadResult = await new Promise(async (resolve) => {
        let uploadRequest = http.request(
          {
            //传zip
            method: "POST",
            hostname: FILE_SERVER_HOST,
            path: "/upload",
            headers: fm.getHeaders(),
          },
          (mesg) => {
            let bf = "";
            Logger.info("upload statuscode:" + mesg.statusCode);
            mesg.on("data", (b: Buffer) => {
              bf += b.toString("utf8");
            });
            mesg.on("error", (err) => {
              this.outputResult(
                `Upload failed:${err}`, "error"
              );

              Logger.info(err, "upload");
              resolve("err");
            });
            mesg.on("end", () => {
              Logger.info("upload bf:" + bf);
              let res: any = JSON.parse(bf);
              if (res.result) {
                this.cis.storeCallInfoInstantly("end", CallSymbol.FLUP);
                this.outputResult(
                  "Uploading source file to compiler successful!"
                );
                resolve("scc");
              } else {
                this.outputResult(`Upload failed:${res.msg}`, "error");
                this.cis.storeCallInfoInstantly(res.msg, CallSymbol.FLUP, 1);
                resolve(res.msg);
              }
            });
          }
        );
        uploadRequest.on("error", () => {
          this.outputResult(
            "Network error!\nYou can check your network connection and retry.",
            "err"
          );
          this.cis.storeCallInfoInstantly("broken network", CallSymbol.FLUP, 1);
          Logger.info("error happened while upload");
          resolve("err");
          return;
        });
        let st = fs.createReadStream(filepath);
        Logger.info("append file");
        // fm.append("file", blob, filepath.split("/").pop())
        fm.append("file", st, filepath.split("/").pop() + ".hex");
        fm.pipe(uploadRequest);
        Logger.info("file append ok");
      });
    } else {
    }

    if (uploadResult != "scc") {
      Logger.info("uploading binary file error");
      this.outputResult("Uploading source file to compiler failed!", "err");
      return false;
    } else {
      return true;
    }
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
