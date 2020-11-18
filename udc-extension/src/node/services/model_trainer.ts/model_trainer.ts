import { TrainDataService } from './../data_service/train_data_service';
import * as fs from "fs-extra";
import * as WebSocket from "ws";
import { inject, injectable } from "inversify";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { Logger } from "../tools/logger";
import { FileCompressor } from "../tools/file_compressor";
import { Packet } from "../ldc/packet";
@injectable()
export class ModelTrainer {
  ws: WebSocket | null = null;
  constructor(
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(FileCompressor) protected fileCompressor: FileCompressor,
    @inject(Packet) protected pkt: Packet,
    @inject(TrainDataService) protected trainDataService: TrainDataService,
  ) { }
  parseAIConfig() {
    return this.trainDataService.parseTrainData()
  }
  disconnect() {
    if (!!this.ws) {
      this.ws.close()
    }
  }
  async connect(trainServer: string): Promise<boolean> {
    this.outputResult("Connect to train server" + trainServer)
    if (!!this.ws) return true;
    this.ws = new WebSocket(trainServer);
    this.ws.on("message", (res) => {
      this.outputResult(res.toString("utf8"));
    });
    this.ws.on("close", () => {
      this.ws = null;
    });
    return new Promise<boolean>((res, rej) => {
      this.ws!.on("open", () => {
        this.outputResult("Connect to train server successfully")
        res(true);
      });
      this.ws!.on("error", () => {

        Logger.info("error happened in train function");
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        res(false);
      });
    });
  }
  async train(srcPath: string, trainServer: string): Promise<boolean> {
    try {
      let fn = this.fileCompressor.generateTempFilePath();
      await this.fileCompressor.compress(srcPath, fn);
      let rb = fs.readFileSync(fn, {
        encoding: "base64",
      }); //base64转码文件
      let hashVal = await this.fileCompressor.getHash(fn);
      let data = {
        hash: hashVal,
        data: rb,
      };
      // console.log("train server" + trainServer + JSON.stringify(data));
      if (!this.ws) {
        let p = await this.connect(trainServer);
        if (!p) {
          this.ws = null;
          return false;
        }
      }
      this.ws!.send(this.pkt.construct("file", rb.toString()));
      this.outputResult("Send source file scc")
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
