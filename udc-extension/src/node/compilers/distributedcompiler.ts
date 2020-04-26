import * as Hs from "https";
import { DISTRIBUTEDCOMPILER_IP } from "../../setting/backend-config";
import * as FormData from "form-data";
import * as Arc from "archiver";
import * as Fs from "fs-extra";
import * as Path from "path";
import * as Ha from "crypto";
import { inject, injectable } from "inversify";
import { UdcTerminal } from "../util/udc-terminal";
// @injectable()
// export class terminal {
//   outputResult(str: string) {
//     console.log(str);
//   }
// }
@injectable()
export class DistributedCompiler {
  //   constructor(@inject(UdcTerminal) readonly udc: UdcTerminal) {}
  constructor(@inject(UdcTerminal) readonly udc: UdcTerminal) {}
  outputResult(mes: string) {
    this.udc.outputResult(mes);
  }
  async upload(
    path: string,
    boardType: string,
    compileType: string
  ): Promise<string> {
    // path = Path.join(__dirname, "alios");
    let ha = Ha.createHash("sha1");
    let tp = Path.join(__dirname, "src.zip");
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
      let uf = Hs.request(
        {
          protocol: "https:",
          method: "POST",
          host: DISTRIBUTEDCOMPILER_IP,
          path: "/api/compile",
          headers: fm.getHeaders(),
          auth: "api_gateway:api_gateway",
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
              resolve("error");
            }
            if (ob["msg"] == "error") {
              this.outputResult(ob["data"]["message"]);
              resolve("error");
            }
            let p;
            resolve(
              (p = `/api/compile/block?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
            );
            console.log(p);
          });
        }
      );
      uf.on("error", () => {
        this.outputResult("network error");
        resolve("error");
      });
      fm.pipe(uf);
    });
    return await p;
  }
  async getHexFile(path: string, output: string) {
    let p = new Promise<string>((resolve) => {
      console.log;
      let gf = Hs.request(
        {
          protocol: "https:",
          method: "GET",
          host: DISTRIBUTEDCOMPILER_IP,
          path: path,
          auth: "api_gateway:api_gateway",
        },
        (response) => {
          let x: Buffer[] = [];
          response.on("data", (buffer: Buffer) => {
            x.push(buffer);
          });
          response.on("close", () => {
            let bf = Buffer.concat(x);
            // console.log(bf.toString());
            if (
              response.headers["content-type"] == "application/octet-stream"
            ) {
              Fs.writeFileSync(output, bf);
              resolve("scc");
            } else {
              console.log(JSON.stringify(response.headers));
              let ob = JSON.parse(bf.toString());
              if (ob["msg"] == "error")
                this.outputResult(ob["data"]["message"]);
              resolve("error");
            }
          });
        }
      );
      gf.on("error", () => {
        this.outputResult("network error");
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
    compileType: string
  ) {
    let x = await this.upload(path, boardType, compileType);
    if (x == "error") {
      return x;
    }
    return await this.getHexFile(x, hexPath);
  }
}
