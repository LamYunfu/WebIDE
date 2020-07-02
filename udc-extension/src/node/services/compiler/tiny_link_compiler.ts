import { LdcFileServer } from './../ldc_file_server/ldc_file_server';
import { DataService } from './../data_service/data_service';
import * as FormData from "form-data";
import * as fs from "fs-extra";
import { injectable, inject, interfaces } from "inversify";
import { CallInfoStorer } from "../log/call_info_storer";
import {
  DISTRIBUTEDCOMPILER_IP,
} from "../../../setting/backend-config";
import { UserInfo } from "../../data_center/user_info";
import { CallSymbol } from "../../../setting/callsymbol";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { FileCompressor } from "../tools/file_compressor";
import * as path from "path"
export function bindTinyLinkCompiler(bind: interfaces.Bind) {
  bind(TinyLinkCompiler)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class TinyLinkCompiler {
  constructor(
    @inject(CallInfoStorer) readonly cis: CallInfoStorer,
    @inject(UserInfo) protected uif: UserInfo,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(FileCompressor) protected fileCompressor: FileCompressor,
    @inject(DataService) protected dService: DataService,
    @inject(LdcFileServer) protected ldcFileServer: LdcFileServer
  ) { }
  DEBUG: boolean = false;
  tinyLinkAPIs: {
    hostname: string;
    port: string;
    srcPostPath: string;
  } = {
      hostname: DISTRIBUTEDCOMPILER_IP,
      port: "80",
      srcPostPath: "/tinylink/tinylink_module/onelink_call.php", //post file data return download uri
    };
  get cookie() {
    return this.uif.cookie;
  }
  outputResult(mes: string, type: string = "sys") {
    this.ldcShell.outputResult(mes, type);
  }
  async processZipFile(zipPath: string, inst: string, tinyapp: string, index: string): Promise<boolean> {
    try {
      let uPath = this.fileCompressor.generateTempFilePath()
      await this.fileCompressor.unfoldAll(zipPath, uPath)
      let hexFilePath = path.join(uPath, "dev_bin", inst, "sketch.ino.hex")
      let info = fs.readFileSync(path.join(uPath, "dev_info", inst, "info.txt")).toString()
      console.log("info:" + info)
      console.log("info split:" + info.split("\n")[0].trim())
      if (info.split("\n")[0].trim() == "1") {
        return await this.ldcFileServer.fileUpload(hexFilePath, index)
      }
      else {
        let verbose = path.join(uPath, "dev_log", tinyapp, "verbose.txt")
        this.outputResult(`Compilation failed:${fs.readFileSync(verbose).toString()}`, "err")
        return false
      }
    } catch (error) {
      this.outputResult(`Compilation failed:${error}`, "err")
      return false;
    }
  }
  async compile(srcPath: string, index: string): Promise<boolean> {
    let zip = this.fileCompressor.generateTempFilePath();
    let b = fs.readFileSync(srcPath);
    let fm = new FormData();
    let app = this.dService.generateWaitingID();
    let inst = this.dService.generateWaitingID();
    fm.append("upload", b, "src.cpp");
    fm.append("type", "onelink_execute");
    fm.append("tinyapp", app);
    fm.append("instance", inst);
    let rc = await new Promise<boolean>((resolve) => {
      this.cis.storeCallInfoInstantly("start", CallSymbol.CDAT);
      let p = fm.submit(
        {
          method: "POST",
          hostname: this.tinyLinkAPIs.hostname,
          port: this.tinyLinkAPIs.port,
          path: this.tinyLinkAPIs.srcPostPath,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
            Cookie: this.cookie,
          },
        },
        (err, res) => {
          let content: Buffer | undefined;
          res.on("data", (b: Buffer) => {
            if (!content) {
              content = b;
            } else {
              content = Buffer.concat([content, b]);
              fs.writeFileSync(zip, content);
            }
          });
          res.on("end", () => {
            fs.writeFileSync(zip, content);
            resolve(true);
          });
          res.on("error", (err) => {
            this.cis.storeCallInfoInstantly(err.message, CallSymbol.CDAT, 1);
            resolve(false);
          });
        }
      );
      p.on("error", (err) => {
        this.cis.storeCallInfoInstantly(err.message, CallSymbol.CDAT, 1);
      });
    });
    if (!rc) {
      return false
    }
    else {
      return await this.processZipFile(zip, inst, app, index)
    }
  }

}
