import * as Hs from "http";

import * as FormData from "form-data";
import * as Arc from "archiver";
import * as Fs from "fs-extra";
import * as Path from "path";
import * as Ha from "crypto";
import { inject, injectable, interfaces } from "inversify";
import { CallInfoStorer } from "../log/call_info_storer";
import { CallSymbol } from "../../../setting/callsymbol";
import { DISTRIBUTEDCOMPILER_IP } from "../../../setting/backend-config";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { ProjectData } from "../../data_center/project_data";
export function bindDistributedCompiler(bind: interfaces.Bind) {
  bind(DistributedCompiler)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class DistributedCompiler {
  //   constructor(@inject(UdcTerminal) readonly udc: UdcTerminal) {}
  constructor(
    @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
    @inject(CallInfoStorer) readonly cis: CallInfoStorer,
    @inject(ProjectData) readonly projectData: ProjectData
  ) { }
  outputResult(mes: string, type: string = "sys") {
    this.ldcShell.outputResult(mes, type);
  }
  async upload(
    path: string,
    boardType: string,
    compileType: string,
    projectIndex: string
  ): Promise<string> {
    console.log("---compile:" + path)
    let ha = Ha.createHash("sha1");
    let tp = Path.join(__dirname, "src.zip");
    console.log("------tp:" + tp)
    console.log("arcfile:" + tp);
    let ws = Fs.createWriteStream(tp, { encoding: "binary" });
    let ps = new Promise((res) => {
      ws.on("close", () => {
        res();
      });
    });
    let arc = Arc.create("zip");
    arc.directory(path, "/");
    arc.pipe(ws);
    await arc.finalize();
    await ps;
    let fileData = Fs.readFileSync(tp);
    ha.update(fileData);
    let fha = ha.digest("hex");
    let fhas = this.projectData.fileHash;
    fhas[parseInt(projectIndex)] = fha;
    this.projectData.fileHash = fhas;
    let fm = new FormData();
    let parameters = {
      filehash: fha,
      boardType: boardType,
      compileType: compileType,
    };
    console.log(JSON.stringify(parameters));
    fm.append("parameters", JSON.stringify(parameters));
    fm.append("file", fileData, "file.zip");

    let p = new Promise<string>((resolve) => {
      this.cis.storeCallInfoInstantly("start", CallSymbol.CCCE);
      let uf = Hs.request(
        {
          // protocol: "https:",
          method: "POST",
          host: DISTRIBUTEDCOMPILER_IP,
          path: "/linklab/compilev2/api/compile",
          headers: fm.getHeaders(),
          // auth: "api_gateway:api_gateway",
        },
        (res) => {
          let x: Buffer[] = [];
          res.on("data", (buffer: Buffer) => {
            x.push(buffer);
          });
          res.on("close", () => {
            let data = x;
            let ob = JSON.parse(data.toString());
            console.log(data.toString());
            if (ob["code"] == "-1") {
              this.outputResult(ob["msg"]);
              this.cis.storeCallInfoInstantly(ob["msg"], CallSymbol.CCCE, 1);
              resolve("error");
            }
            if (ob["msg"] == "error") {
              this.outputResult(ob["data"]["message"]);
              this.cis.storeCallInfoInstantly(
                ob["data"]["message"],
                CallSymbol.CCCE,
                1
              );
              resolve("error");
            }
            else if (ob["msg"] == "completed") {
              this.cis.storeCallInfoInstantly("end", CallSymbol.CCCE);
              resolve("not_query")
              return
            }
            let p;
            this.cis.storeCallInfoInstantly("end", CallSymbol.CCCE);
            resolve(
              (p = `/linklab/compilev2/api/compile/block/status?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
              // b04f3ee8f5e43fa3b162981b50bb72fe1acabb33&boardtype=esp32devkitc&compiletype=alios
            );
            console.log(p);
          });
        }
      );
      uf.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.CCCE, 1);
        resolve("error");
      });
      fm.pipe(uf);
    });
    return await p;
  }
  async waitCompileFinish(path: string, output: string) {
    let p = new Promise<string>((resolve) => {
      console.log(p);
      this.cis.storeCallInfoInstantly("start", CallSymbol.WTCP);
      let gf = Hs.request(
        {
          // protocol: "https:",
          method: "GET",
          host: DISTRIBUTEDCOMPILER_IP,
          path: path,
          // auth: "api_gateway:api_gateway",
        },
        (response) => {
          let x: Buffer[] = [];
          response.on("data", (buffer: Buffer) => {
            if (x.length % 10000) console.log("downloading");
            x.push(buffer);
            // 1fcdcf2d5e70667153909264038ccf19461e553d
          });
          response.on("close", () => {
            let bf = Buffer.concat(x);
            let ob = JSON.parse(bf.toString());
            if (ob["msg"] == "completed") {
              this.cis.storeCallInfoInstantly("end", CallSymbol.WTCP);
              resolve("scc");
            } else {
              this.outputResult(ob["data"]["message"]);
              this.cis.storeCallInfoInstantly(
                "compiler error",
                CallSymbol.WTCP,
                1
              );
              resolve("error");
            }
          });
        }
      );
      gf.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.WTCP, 1);
        resolve("error");
      });
      gf.end();
    });
    return await p;
  }
  async queryCompileStatus(path: string, output: string) {
    console.log("query compile status!")
    let p = new Promise<string>((resolve) => {
      console.log(p);
      this.cis.storeCallInfoInstantly("start", CallSymbol.DNHX);
      let gf = Hs.request(
        {
          // protocol: "https:",
          method: "GET",
          host: DISTRIBUTEDCOMPILER_IP,
          path: path,
          // auth: "api_gateway:api_gateway",
        },
        (response) => {
          let x: Buffer[] = [];

          response.on("data", (buffer: Buffer) => {
            if (x.length % 10000) console.log("downloading");
            x.push(buffer);
          });
          response.on("close", () => {
            let bf = Buffer.concat(x);
            console.log(bf.toString());
            let ob = JSON.parse(bf.toString());
            if (ob["msg"] == "completed") {
              this.cis.storeCallInfoInstantly("end", CallSymbol.DNHX);
              resolve("scc");
            } else {
              this.outputResult(ob["data"]["message"]);
              this.cis.storeCallInfoInstantly(ob["msg"], CallSymbol.DNHX, 1);
              resolve("error");
            }
          });
        }
      );
      gf.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.DNHX, 1);
        resolve("error");
      });
      gf.end();
    });
    return await p;
  }
  async compile(
    path: string,
    hexPath: string,
    boardType: string,
    compileType: string,
    projectIndex: string
  ): Promise<boolean> {
    let x = await this.upload(path, boardType, compileType, projectIndex);
    if (x == "error") {
      return false;
    }
    else if (x == "not_query") {
      return true
    }
    let qr = await this.queryCompileStatus(x, hexPath);
    if (qr == "scc") return true;
    else return false;
  }
}
