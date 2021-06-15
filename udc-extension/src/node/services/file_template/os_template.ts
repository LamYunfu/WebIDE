import { MultiProjectData } from '../../data_center/multi_project_data';
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
// export function binFileTemplate(bind: interfaces.Bind) {
//   bind(OSTemplate)
//     .to(OSTemplate)
//     .inSingletonScope();
//   bind(OSTemplate)
//     .toSelf()
//     .inSingletonScope();
// }
/**
 * 操作系统库文件加载
 */
@injectable()
export class OSTemplate {
  protected os_name:string = "";
  protected os_version:string = "";
  protected rootDir:string = "";

  constructor(
    @inject(CallInfoStorer) protected cis: CallInfoStorer,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(MultiProjectData) protected mData: MultiProjectData,
  ) { }
  
  setParam(os_name:string, os_version:string, rootDir:string){
    this.os_name = os_name;
    this.os_version = os_version;
    this.rootDir = rootDir;
  }

  async downLoadSingleFile(file_path:string){
    let param_post = {"name":"stm32_gcc", "version":"stm32-std", "file":"test.c"};
    param_post["name"] = this.os_name;
    param_post["version"] = this.os_version;
    param_post["file"] = file_path;

    return await new Promise<boolean>((resolve) => {
        let fileRequest = http.request(
          {
            method: "POST",
            hostname: "judge.test.tinylink.cn",
            ///
            path: "/library/searchfile",
            headers: {
              "Content-Type": "application/json",
            },
          },
          (mesg) => {
            if (mesg == undefined) {
              return;
            }
            let bf = "";
            mesg.on("data", (b: Buffer) => {
              bf += b.toString("utf8");
            });
            mesg.on("error", () => {
              console.log("向服务器请求错误");
              resolve(false);
            });
            mesg.on("end", async () => {
              let res: any = JSON.parse(bf);
              console.log("从搜索文件服务器返回的数据是：");
              console.log(res);
              if (res.result == 'true') {
                  //console.log("获取的数据是：" + JSON.stringify(res.template));
                  resolve(true);
              } else {
                console.log(res.mes);
                resolve(false);
              }
            });
          }
        );
        fileRequest.on("error", () => {
          resolve(false);
        });
        fileRequest.write(
          JSON.stringify(param_post)
        );
        fileRequest.end();
      } 
  );
}
}
