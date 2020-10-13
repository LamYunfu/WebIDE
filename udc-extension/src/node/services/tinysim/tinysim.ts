import * as fs from "fs-extra";
import * as WebSocket from "ws";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable, interfaces } from "inversify";
import { CallInfoStorerInterface } from "../log/interfaces/call_storer_interface";
import { CallSymbol } from "../../../setting/callsymbol";
import { SENCE_SERVER_URL } from "../../../setting/backend-config";
import { EventCenter } from "../tools/event_center";
import { FileCompressor } from "../tools/file_compressor";
import { Packet } from "../ldc/packet";
export function bindTinySim(bind: interfaces.Bind) {
  bind(TinySim).toSelf().inSingletonScope()
}
@injectable()
export class TinySim {
  constructor(
    @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
    @inject(CallInfoStorerInterface) readonly cis: CallInfoStorerInterface,
    @inject(EventCenter) protected events: EventCenter,
    @inject(FileCompressor) protected fileCompressor: FileCompressor,
    @inject(Packet) protected pkt: Packet
  ) { }
  tinySimClient: WebSocket | undefined;
  disconnect() {
    if (!!this.tinySimClient) {
      this.tinySimClient!.close()
    }
  }
  async postSimFile(pid: string, simFilePath: string) {
    let b = fs.readFileSync(simFilePath);
    this.outputResult("Connecting to device simulator...");
    this.cis.storeCallInfoInstantly("start", CallSymbol.TISM);
    if (!this.tinySimClient) {
      await this.connectSimServer(SENCE_SERVER_URL);
    }
    this.tinySimClient!.send(b, () => {
      this.outputResult("Sending data to device simulator successful!");
      this.tinySimClient!.send(new Buffer(`pid:${pid}:quit`), () => {
        this.outputResult("quit");
      });
    });
  }
  async connectSimServer(server: string): Promise<boolean> {
    try {
      this.tinySimClient = new WebSocket(server);
    } catch (error) {
      this.outputResult("Tinysim Network Error","err")
    }
  
    if (!this.tinySimClient) {
      return false;
    }
    this.tinySimClient.on("message", (data: string) => {
      let tmp = new Buffer(data).toString("utf8");
      console.log(tmp.toString());
      this.outputResult(tmp.toString(), "log");
    });
    this.tinySimClient.on("close", () => {
      this.tinySimClient = undefined;
      this.cis.storeCallInfoInstantly("end", CallSymbol.TISM);
    });
    this.tinySimClient.on("open", async () => {
      this.events.emit("simServerOk");
      this.outputResult("Sending data to device simulator...");
    });
    this.tinySimClient.on("error", () => {
      this.tinySimClient = undefined;
      this.cis.storeCallInfoInstantly("broken network", CallSymbol.TISM, 1);
      this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
    });
    this.tinySimClient.on("close", () => {
      this.ldcShell.executeFrontCmd({ name: "submitEnable", passwd: "" });
    });
    return await this.events.waitEventNms("simServerOk", 5000);
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }

  async virtualSubmit(serverPath: string, srcDir: string): Promise<boolean> {
    let zip = this.fileCompressor.generateTempFilePath();
    await this.fileCompressor.compress(srcDir, zip);
    let rb = fs.readFileSync(zip, {
      encoding: "base64",
    }); //base64转码文件
    fs.unlinkSync(zip);
    let hashVal = await this.fileCompressor.getHash(rb);
    let data = {
      hash: hashVal,
      data: rb,
    };
    // console.log("sim server" + serverPath + JSON.stringify(data));
    this.cis.storeCallInfoInstantly("start", CallSymbol.TISM);
    if (!this.tinySimClient) await this.connectSimServer(serverPath);
    let content = this.pkt.construct("file", rb.toString());
    if (!this.tinySimClient) {
      return false;
    }
    console.log(content);
    this.tinySimClient.send(content);
    this.cis.storeCallInfoInstantly("end", CallSymbol.TISM);
    return true;
  }

  async virtualSubmitTao(serverPath: string, srcDir: string, algorithmID:string){
 
    let zip = this.fileCompressor.generateTempFilePath();
    await this.fileCompressor.compress(srcDir, zip);
    let rb = fs.readFileSync(zip, {
      encoding: "base64",
    }); //base64转码文件
    // fs.unlinkSync(zip);
    let hashVal = await this.fileCompressor.getHash(rb);
    let data = {
      hash: hashVal,
      data: rb,
    };
    // console.log("sim server" + serverPath + JSON.stringify(data));
    this.cis.storeCallInfoInstantly("start", CallSymbol.TISM);
    if (!this.tinySimClient) await this.connectSimServer(serverPath);
    let JSONData = {
      type: "file",
      id: algorithmID,
      data: rb.toString()
    }
    // console.log("压缩包路径是：" + zip);
    // console.log("数据是：" + rb);
    // console.log(JSON.stringify(JSONData));
    //console.log("报告首长，已经进入到调试页面，等待上级指示。");
    let content = this.pkt.construct("file", JSON.stringify(JSONData));
    if (!this.tinySimClient) {
      return false;
    }
    this.tinySimClient.send(content);
    this.cis.storeCallInfoInstantly("end", CallSymbol.TISM);
    return true;
  }
}
