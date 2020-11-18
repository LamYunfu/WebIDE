import { MultiProjectData } from './../../data_center/multi_project_data';
import { CallSymbol } from "../../../setting/callsymbol";
import { CallInfoStorer } from "../log/call_info_storer";
import * as http from "http";
import { injectable, inject, interfaces } from "inversify";
import { TEMPLATE_SERVER } from "../../../setting/backend-config";
import { Logger } from "../tools/logger";
import * as path from "path";
import * as fs from "fs-extra";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { FileTemplateInterface } from "./interfaces/file_template_interface";
export function bindFileTemplate(bind: interfaces.Bind) {
  bind(FileTemplateInterface)
    .to(FileTemplate)
    .inSingletonScope();
  bind(FileTemplate)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class FileTemplate implements FileTemplateInterface {
  constructor(
    @inject(CallInfoStorer) protected cis: CallInfoStorer,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(MultiProjectData) protected mData: MultiProjectData,
  ) { }
  async buildAllProjects() {
    console.log("---build project---")
    for (let key in this.mData.dataMap) {
      let p = path.join(this.mData.rootDir, this.mData.dataMap[key].projectRootDir)
      !fs.existsSync(p) ? fs.mkdirSync(p) : ""
      //创建文件结构
      await this.buildProblemFileStructure(this.mData.dataMap[key].ppid, p)
    }
  }
  async buildProblemFileStructure(
    ppid: string,
    targetPath: string
  ): Promise<boolean> {
    this.cis.storeCallInfoInstantly("start", CallSymbol.GTML);
    //通过ppid向模板服务器发起请求请求实验的模板文件
    return await new Promise<boolean>((resolve) => {
      if (ppid != null) {
        let fileRequest = http.request(
          {
            //
            method: "POST",
            hostname: TEMPLATE_SERVER,
            path: "/problem/template",
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
              Logger.info("error happened while get template");
              return;
            }
            let bf = "";
            mesg.on("data", (b: Buffer) => {
              bf += b.toString("utf8");
            });
            mesg.on("error", () => {
              Logger.info("error happened in initPidQueueInfo");
              this.outputResult(
                "Network error!\nYou can check your network connection and retry.",
                "err"
              );
              resolve(false);
            });
            mesg.on("end", () => {
              let res: any = JSON.parse(bf);
              //console.log("从模板服务器返回的数据是：");
              //console.log(res);
              if (res.result) {
                let cpath = targetPath;
                if (!fs.existsSync(cpath)) fs.mkdirSync(cpath);
                this.createDirStructure(cpath, res.template);
                this.cis.storeCallInfoInstantly("end", CallSymbol.GTML);
                resolve(true);
              } else {
                this.cis.storeCallInfoInstantly(res.mes, CallSymbol.GTML, 1);
                console.log(res.mes);
                resolve(false);
              }
            });
          }
        );
        fileRequest.on("error", () => {
          this.cis.storeCallInfoInstantly("broken network", CallSymbol.GTML, 1);
          this.outputResult(
            "Network error!\nYou can check your network connection and retry.",
            "err"
          );
          resolve(false);
        });
        console.log(
          "ppid::::" +
          JSON.stringify({
            ppid: ppid,
          })
        );
        fileRequest.write(
          JSON.stringify({
            ppid: ppid,
          })
        );
        fileRequest.end();
      } else {
        resolve(false);
      }
    });
  }
  createDirStructure(cpath: string, res: any) {
    for (let item of Object.keys(res)) {
      if (typeof res[item] == "object") {
        //object说明是一个文件夹
        let dirPath = path.join(cpath, item);
        fs.existsSync(dirPath) ? "" : fs.mkdirSync(dirPath);
        this.createDirStructure(dirPath, res[item]);
      } else
      //否则是文件，将文件内容写入文件里面
        fs.existsSync(path.join(cpath, item))
          ? ""
          : fs.writeFileSync(path.join(cpath, item), res[item]);
    }
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
