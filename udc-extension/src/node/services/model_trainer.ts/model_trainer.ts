import * as fs from "fs-extra";
import * as WebSocket from "ws";
import { inject, injectable } from "inversify";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { Logger } from "../tools/logger";
import { FileCompressor } from "../tools/file_compressor";
import { Packet } from "../ldc/packet";
@injectable()
export class ModelTrainer {
  ws: WebSocket | undefined;
  constructor(
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(FileCompressor) protected fileCompressor: FileCompressor,
    @inject(Packet) protected pkt: Packet
  ) {}
  async connect(trainServer: string) {
    if (!this.ws) return;
    this.ws = new WebSocket(trainServer);
    this.ws.on("message", (res) => {
      this.outputResult(res.toString("utf8"));
    });
    this.ws.on("close", () => {
      this.ws = undefined;
    });
    return new Promise<boolean>((res, rej) => {
      this.ws!.on("open", () => {
        res(true);
      });
      this.ws!.on("error", () => {
        rej(false);
        Logger.info("error happened in train function");
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
      });
    });
  }
  async train(srcPath: string, trainServer: string) {
    try {
      let fn = this.fileCompressor.generateTempFilePath();
      this.fileCompressor.compress(srcPath, fn);
      let rb = fs.readFileSync(fn, {
        encoding: "base64",
      }); //base64转码文件
      let hashVal = this.fileCompressor.getHash(fn, "base64");
      let data = {
        hash: hashVal,
        data: rb,
      };
      console.log("train server" + trainServer + JSON.stringify(data));
      if (!this.ws) {
        let p = await this.connect(trainServer);
        if (!p) {
          this.ws = undefined;
          return false;
        }
      }
      this.ws!.send(rb);
      return true;
    } catch (error) {
      Logger.info(error);
      return false;
    }
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
