import { HalfPackProcess } from "./half-pkt-process";
import * as path from "path";
import * as http from "http";
import * as FormData from "form-data";
// import { certificate } from './../common/udc-config';
import { UdcClient } from "../../common/udc-watcher";
import { injectable, inject } from "inversify";
// import * as tls from 'tls';
import * as net from "net";
import * as fs from "fs-extra";
import { Packet } from "./packet";
import * as events from "events";
// import { networkInterfaces } from 'os';
import { LOGINTYPE } from "../../common/udc-service";
import { Logger } from "./logger";
import * as Color from "colors";
import * as WebSocket from "ws";
// import { getCompilerType } from '../globalconst';
import * as crypto from "crypto";

import * as ach from "archiver";
import {
  SENCE_SERVER_URL,
  LDC_SERVER_IP,
  LDC_SERVER_PORT,
  PROGRAM_SERVER_IP,
  PROGRAM_SERVER_PORT,
  TEMPLATE_SERVER,
  CONFIGPATH,
  DEPLOY_SERVER_IP,
  RootDirPath,
  RASPBERRY_QUERRY_IP,
  RASPBERRY_QUERRY_PORT,
  TINYLINEDGECOMPILE_IP,
  Call_Log_Path,
} from "../../setting/backend-config";
import { OS } from "@theia/core";
import { CallSymbol } from "../../setting/callsymbol";
import { CallInfoStorer } from "./callinfostorer";
// import { networkInterfaces } from 'os';
@injectable()
/*
存储一些数据，以及ldc相关指令操作
*/
export class UdcTerminal {
  userid: string = "";
  cookie: string = "";
  DEBUG: boolean = false;
  udcserver: any;
  DEFAULT_SERVER: string = "118.31.76.36";
  DEFAULT_PORT: number = 2000;
  udcControlerClient: any = null;
  model: string = "esp8266";
  login_type: LOGINTYPE = LOGINTYPE.ADHOC;
  dev_list?: { [key: string]: number };
  cmd_excute_state = "idle";
  cmd_excute_return: any = "";
  udcServerClient: any;
  udcClient?: UdcClient;
  events = new events.EventEmitter();
  event: any;
  hpp: HalfPackProcess;
  dataStorage: { [key: string]: {} } = {};
  programState: { [key: string]: { [key: string]: string } } = {};
  lastCommitDevice: { timeMs: number; device: string } = {
    timeMs: new Date().getTime(),
    device: "",
  };

  logEnable: boolean = false;
  tinySimRequest: WebSocket | null = null;
  pidQueueInfo: {
    [pid: string]: {
      loginType: string;
      projectName: string | undefined;
      boardType:string;
      compilerType: string | undefined;
      timeout: string;
      model: string;
      waitID: string;
      fns: string;
      dirName: string;
      deviceRole?: string[] | undefined;
      ppid?: string;
      type?: string;
    };
  } = {};
  aiConfig: any = {};
  virtualConfig: any = {};
  currentPid: string = ``;
  currentWaitId: string = "";

  // rootDir: string = `${this.rootDir.val}`;
  tinyLinkInfo: { name: string; passwd: string } = { name: "", passwd: "" };
  initTag: boolean = true;
  freeCodingConfig: any = {};
  LinkEdgeConfig: any = {};
  fileTag: boolean = false;
  user: string = "";
  constructor(
    @inject(Packet) readonly pkt: Packet,
    @inject(RootDirPath) public rootDir: RootDirPath,
    @inject(CallInfoStorer) readonly cis: CallInfoStorer
  ) {
    this.event = new events.EventEmitter();
    this.hpp = new HalfPackProcess();
    Logger.val("current path:" + process.cwd());
  }
  parseFreeConfig(pid: string) {
    let { dirName } = this.getPidInfos(pid);
    let infoRaw: any;
    let info: any;
    try {
      infoRaw = fs.readFileSync(
        path.join(this.rootDir.val, dirName, "config.json")
      );
      info = JSON.parse(infoRaw.toString("utf8"));
      this.freeCodingConfig = info;
    } catch {
      this.freeCodingConfig = undefined;
      this.outputResult("theconfig.json is incorrect!");
      return;
    }
  }
  parseAIConfig(pid: string) {
    let { dirName } = this.getPidInfos(pid);
    let infoRaw: any;
    let info: any;
    try {
      infoRaw = fs.readFileSync(
        path.join(this.rootDir.val, dirName, "config.json")
      );

      info = JSON.parse(infoRaw.toString("utf8")).projects[0];
      console.log(JSON.stringify(info));
      this.aiConfig["projectName"] = info.projectName;
      this.aiConfig["trainServer"] = info.trainServer;
      this.aiConfig["exeServer"] = info.exeServer;
    } catch {
      this.outputResult("theconfig.json is incorrect!");
      return;
    }
  }
  async train(pid: string) {
    this.parseAIConfig(pid);
    console.log("enter training" + pid);
    let _this = this;
    let { dirName } = this.getPidInfos(pid);
    let trainServer = this.aiConfig["trainServer"];
    let st = fs.createWriteStream(
      path.join(this.rootDir.val, dirName, "src.zip")
    ); //打包
    let achst = ach
      .create("zip")
      .directory(path.join(this.rootDir.val, dirName), false);
    let hash = crypto.createHash("sha1");
    let hashVal = "";
    let p = new Promise((resolve) => {
      st.on("close", () => {
        console.log("Packing files successful!");
        resolve("scc");
      });
    });
    achst.pipe(st);
    achst.finalize();
    await p;
    let rb = fs.readFileSync(path.join(this.rootDir.val, dirName, "src.zip"), {
      encoding: "base64",
    }); //base64转码文件
    hashVal = hash.update(rb).digest("hex");
    let data = {
      hash: hashVal,
      data: rb,
    };

    console.log("train server" + trainServer + JSON.stringify(data));
    let ws = new WebSocket(trainServer);
    ws.on("open", () => {
      _this.outputResult("Port of server is open...");
      let content = _this.pkt.construct("file", rb.toString());
      console.log(content);
      ws.send(content, (err) => {
        console.log(err);
      });
    });
    ws.on("error", () => {
      Logger.info("error happened in train function");
      _this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
    });
    ws.on("message", (res) => {
      _this.outputResult(res.toString("utf8"));
    });
  }
  flushLinkEdgeConfig(pid: string) {
    let configStr = JSON.stringify(this.LinkEdgeConfig);
    let { dirName } = this.getPidInfos(pid);
    let p = path.join(CONFIGPATH, dirName, "config.json");
    console.log("flush config:" + configStr);
    fs.writeFileSync(p, configStr);
  }
  getLinkEdgeDevicesInfo(pid: string) {
    this.parseLinkEdgeConfig(pid);
    return this.LinkEdgeConfig["projects"];
  }
  async parseLinkEdgeConfig(pid: string, threeTuple: any = undefined) {
    for (let i = 0; i < 6; i++) {
      if (this.fileTag) {
        await new Promise((res) => {
          setTimeout(() => {
            res();
          }, 1000);
        });
      }
    }

    this.fileTag = true;
    let { dirName } = this.getPidInfos(pid);
    let infoRaw: any;
    try {
      infoRaw = fs.readFileSync(path.join(CONFIGPATH, dirName, "config.json"));
      let tulpeRaw = fs.readFileSync(
        path.join(this.rootDir.val, dirName, "Config", "config.json")
      );
      let tulpe = JSON.parse(tulpeRaw.toString())["Certificate"];
      this.LinkEdgeConfig = JSON.parse(infoRaw);
      this.pidQueueInfo[pid].loginType = "queue";
      this.pidQueueInfo[pid].model = this.LinkEdgeConfig["gatewayType"];
      if (this.pidQueueInfo[pid].model == undefined) throw "err";
      if (threeTuple == undefined) return;
      let startCommand = "";
      if (threeTuple.action == "connect") {
        this.outputResult("connect linkedge gateway......");
        startCommand = this.LinkEdgeConfig["gatewayConnectCommand"]
          .split("$ProductKey")
          .join(tulpe["ProductKey"])
          .split("$DeviceName")
          .join(tulpe["DeviceName"])
          .split("$DeviceSecret")
          .join(tulpe["DeviceSecret"]);
        Logger.info(startCommand, "connect command");
      } else if (threeTuple.action == "stop") {
        this.outputResult("stop linkedge gateway......");
        startCommand = this.LinkEdgeConfig["gatewayStopCommand"];
        Logger.info(startCommand, "stop command");
      } else if (threeTuple.action == "start") {
        this.outputResult("start linkedge gateway......");
        startCommand = this.LinkEdgeConfig["gatewayStartCommand"];
        Logger.info(startCommand, "start command");
      } else if (threeTuple.action == "release") {
        this.outputResult("release linkedge gateway......");
        startCommand = this.LinkEdgeConfig["gatewayStartCommand"];
        Logger.info(startCommand, "start command");
      } else {
        this.outputResult("invalid operation");
        throw "error";
      }
      fs.writeFileSync(
        path.join(CONFIGPATH, dirName, "hexFiles", "command.hex"),
        startCommand
      );
    } catch (e) {
      Logger.info(JSON.stringify(e));
      this.outputResult("theconfig.json is incorrect!");
      throw "error";
    } finally {
      this.fileTag = false;
    }
  }
  delProject(pid: string): Promise<boolean> {
    let { dirName } = this.getPidInfos(pid);
    let projectDir = path.join(this.rootDir.val, dirName);
    fs.existsSync(projectDir) ? fs.removeSync(projectDir) : "";
    return new Promise((res) => {
      res(true);
    });
  }
  parseVirtualConfig(pid: string) {
    let { dirName } = this.getPidInfos(pid);
    let infoRaw: any;
    let info: any;
    try {
      infoRaw = fs.readFileSync(
        path.join(this.rootDir.val, dirName, "config.json")
      );
      info = JSON.parse(infoRaw.toString("utf8")).projects[0];
      console.log(JSON.stringify(info));
      this.virtualConfig["projectName"] = info.projectName;
      this.virtualConfig["simServer"] = info.simServer;
    } catch {
      this.outputResult("theconfig.json is incorrect!");
      return;
    }
  }

  async virtualSubmit(pid: string) {
    this.parseVirtualConfig(pid);
    console.log("virtual submit" + pid);
    let _this = this;
    let { dirName } = this.getPidInfos(pid);
    let simServer = this.virtualConfig["simServer"];
    let st = fs.createWriteStream(
      path.join(this.rootDir.val, dirName, "src.zip")
    ); //打包
    let achst = ach
      .create("zip")
      .directory(path.join(this.rootDir.val, dirName), false);
    let hash = crypto.createHash("sha1");
    let hashVal = "";
    let p = new Promise((resolve) => {
      st.on("close", () => {
        console.log("Packing files successful!");
        resolve("scc");
      });
    });
    achst.pipe(st);
    achst.finalize();
    await p;
    let rb = fs.readFileSync(path.join(this.rootDir.val, dirName, "src.zip"), {
      encoding: "base64",
    }); //base64转码文件
    fs.unlinkSync(path.join(this.rootDir.val, dirName, "src.zip"));
    hashVal = hash.update(rb).digest("hex");
    let data = {
      hash: hashVal,
      data: rb,
    };

    console.log("sim server" + simServer + JSON.stringify(data));
    this.cis.storeCallInfoInstantly("start", CallSymbol.TISM);
    let ws = new WebSocket(simServer);
    ws.on("open", () => {
      this.cis.storeCallInfoInstantly("start", CallSymbol.TISM);
      _this.outputResult("Port of server is open...");
      let content = _this.pkt.construct("file", rb.toString());
      console.log(content);
      ws.send(content, (err) => {
        console.log(err);
      });
    });
    ws.on("error", () => {
      Logger.info("error happened in virtualSubmit");
      _this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
    });
    ws.on("message", (res) => {
      _this.outputResult(res.toString("utf8"));
    });
  }

  async refreshConfiguration(pid: string) {
    let { dirName } = this.getPidInfos(pid);
    let infoRaw = fs.readFileSync(
      path.join(this.rootDir.val, dirName, "config.json")
    );
    let info: any;
    try {
      info = JSON.parse(infoRaw.toString("utf8")).projects;
    } catch {
      this.outputResult("theconfig.json is incorrect!");
      return;
    }
    let preModel = this.pidQueueInfo[pid].model;
    this.pidQueueInfo[pid].loginType = "queue";
    this.pidQueueInfo[pid].model = info[0].burningDataQueue.program.model;
    this.pidQueueInfo[pid].compilerType = info[0].compilationMethod;
    // this.pidQueueInfo[pid].timeout = info[0].timeout
    this.pidQueueInfo[pid].timeout = "30";
    let deviceRole = [];
    for (let item of info) {
      deviceRole.push(item.projectName);
    }
    this.pidQueueInfo[pid].fns = JSON.stringify(deviceRole);
    this.pidQueueInfo[pid].deviceRole = deviceRole;
    if (preModel != this.pidQueueInfo[pid].model) {
      if (this.is_connected) await this.disconnect();
      await this.connect("", "", pid, this.pidQueueInfo[pid].timeout);
    }
    console.log(JSON.stringify(this.pidQueueInfo[pid!]));
  }

  async requestFixedTemplate(pid: string, type: string, rootDir: string) {
    let { dirName } = this.pidQueueInfo[pid];
    let devicePath = path.join(this.rootDir.val, dirName, "device");
    !fs.existsSync(devicePath) ? fs.mkdirSync(devicePath) : "";
    let projectPath = path.join(devicePath, rootDir);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirsSync(projectPath);
      fs.writeFileSync(path.join(projectPath, rootDir + ".cpp"), "");
    }
    if (OS.type() == OS.Type.Linux) {
      this.udcClient &&
        this.udcClient.onConfigLog({
          name: "openSrcFile",
          passwd: path.join(projectPath, rootDir + ".cpp"),
        });
    } else {
      this.udcClient &&
        this.udcClient.onConfigLog({
          name: "openSrcFile",
          passwd: `/` + path.join(projectPath, rootDir + ".cpp"),
        });
    }
    Logger.info(path.join(projectPath, rootDir + ".cpp"));
  }
  createDirStructure(cpath: string, res: any) {
    for (let item of Object.keys(res)) {
      if (typeof res[item] == "object") {
        let dirPath = path.join(cpath, item);
        fs.existsSync(dirPath) ? "" : fs.mkdirSync(dirPath);
        this.createDirStructure(dirPath, res[item]);
      } else
        fs.existsSync(path.join(cpath, item))
          ? ""
          : fs.writeFileSync(path.join(cpath, item), res[item]);
    }
  }

  async initPidQueueInfo(
    infos: string,
    changeRootDir: boolean = false
  ): Promise<string> {
    if (!changeRootDir) {
      this.rootDir.reset();
    }
    console.log("initPid");
    this.freeCodingConfig = "";
    this.initTag = false;
    Logger.info(infos, "info");
    let _this = this;
    this.pidQueueInfo = JSON.parse(infos);
    for (let index in this.pidQueueInfo) {
      let {
        dirName,
        //  fns, model, deviceRole,
        model,
        ppid,
      } = this.pidQueueInfo[index];
      // this.pidQueueInfo[index]
      this.cis.storeCallInfoInstantly("start", CallSymbol.GTML);
      await new Promise((resolve) => {
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
                _this.outputResult(
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
                _this.outputResult(
                  "Network error!\nYou can check your network connection and retry.",
                  "err"
                );
                resolve("err");
              });
              mesg.on("end", () => {
                let res: any = JSON.parse(bf);
                if (res.result) {
                  let cpath = path.join(_this.rootDir.val, dirName);
                  if (!fs.existsSync(cpath)) fs.mkdirSync(cpath);
                  this.createDirStructure(cpath, res.template);
                  this.cis.storeCallInfoInstantly("end", CallSymbol.GTML);
                  resolve("scc");
                } else {
                  this.cis.storeCallInfoInstantly(res.mes, CallSymbol.GTML, 1);
                  console.log(res.mes);
                  resolve("err");
                }
              });
            }
          );
          fileRequest.on("error", () => {
            this.cis.storeCallInfoInstantly(
              "broken network",
              CallSymbol.GTML,
              1
            );
            this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            resolve("err");
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
          resolve("scc");
        }
      });
      this.udcClient!.onConfigLog({ name: "openShell", passwd: "" });
      if (
        this.pidQueueInfo[index]["type"] == "freecoding" ||
        this.pidQueueInfo[index]["type"] == "OneLinkView" ||
        index == "32" ||
        index == "35"
      ) {
        if (OS.type() == OS.Type.Linux)
          this.udcClient!.onConfigLog({
            name: "openWorkspace",
            passwd: path.join(this.rootDir.val, dirName),
          });
        else
          this.udcClient!.onConfigLog({
            name: "openWorkspace",
            passwd: `/` + this.rootDir.val + `/` + dirName,
          });
      } else if (OS.type() == OS.Type.Linux)
        this.udcClient!.onConfigLog({
          name: "openWorkspace",
          passwd: this.rootDir.val,
        });
      else
        this.udcClient!.onConfigLog({
          name: "openWorkspace",
          passwd: `/` + this.rootDir.val,
        });
      // this.udcClient!.onConfigLog({ name: "openWorkspace", passwd: `${path.join(this.rootDir.val) }` })

      // if (fileRequestResult != "scc") {
      //     console.log("create file fail")
      //     return "err"
      // }

      // if (getCompilerType(model) == "alios") {
      //     this.creatSrcFile(fns, dirName, "alios", deviceRole)
      // }
      // else
      //     this.creatSrcFile(fns, dirName)
    }
    this.initTag = true;
    return "scc";
  }
  setPidInfos(
    pid: string,
    content: {
      loginType: string;
      projectName: string | undefined;
      compilerType: string | undefined;
      timeout: string;
      boardType:string
      model: string;
      waitID: string;
      fns: string;
      dirName: string;
      deviceRole?: string[] | undefined;
    }
  ) {
    this.pidQueueInfo[pid] = content;
  }
  getPidInfos(pid: string) {
    return this.pidQueueInfo[pid];
  }

  setClient(client: UdcClient) {
    this.udcClient = client;
  }

  //74dfbfad34520000
  //901DE50A2D2E055C
  //901DE50A2D2E0000
  // get uuid(): string {
  //     let uuid: string = '';
  //     let interfaces = networkInterfaces();
  //     for (let intf in interfaces) {
  //         for (let i in interfaces[intf]) {
  //             if (interfaces[intf][i].family === 'IPv6') { continue; }
  //             if (interfaces[intf][i].address === '127.0.0.1') { break; }
  //             uuid = interfaces[intf][i].mac.replace(/:/g, '') + '0000'
  //             break;
  //         }
  //     }
  //     Logger.info(`uuid:${uuid}`)
  //     return uuid;
  // }
  get uuid(): string {
    if (this.userid == "")
      this.userid = this.cookie.slice(20, 36).toLowerCase();
    Logger.info(`uuid:${this.userid}`);
    return this.userid;
  }

  login_and_get_server(
    login_type: LOGINTYPE,
    model: string
  ): Promise<Array<any>> {
    // let options = {
    //     ca: certificate,
    //     rejectUnauthorized: false,
    //     // requestCert: true,
    // }
    // login_type = LOGINTYPE.QUEUE//temporary
    let uuid = this.uuid;
    let _this = this;
    return new Promise(function(resolve, reject) {
      // let server_ip = "118.31.76.36"
      // let server_port = 2000
      let server_ip = LDC_SERVER_IP;
      let server_port = LDC_SERVER_PORT;
      // let server_ip = "192.168.1.233"
      // let server_port = 2000
      // let ctrFd = tls.connect(server_port, server_ip, options, () => {
      let ctrFd = net.connect(server_port, server_ip, () => {
        Logger.info("connect scc");
      });
      ctrFd.on("error", () => {
        Logger.info("error happened with the connection to controller");
        _this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        reject("error");
      });
      ctrFd.on("close", () => {
        Logger.info("Connection to Controller Closed!");
      });
      ctrFd.on("data", (data: Buffer) => {
        let d = data
          .toString("utf8")
          .substr(1, data.length)
          .split(",");
        let serverData = d.slice(2, d.length);
        Logger.val("d:" + d);
        Logger.val("serverData:" + serverData);
        let info = serverData.join().trim();
        if (serverData.join().trim() == `no available device}`) {
          _this.outputResult(
            "Device allocation error: no free device in LinkLab.\nPlease try again later.",
            "err"
          );
          reject("error");
        } else if (
          serverData.pop()!.trim() == `all this model type are working!}`
        ) {
          _this.outputResult(
            "Device allocation error: no free device in LinkLab.\nPlease try again later.",
            "err"
          );
          reject("error");
        }
        resolve(serverData);
      });
      // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
      // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
      // let cm = '{ALGI,00035,terminal,' + uuid + ',adhoc,any}'
      let cm = "";
      Logger.val(`length is :` + (uuid + `${login_type},${model}}`).length + 9);
      // cm = _this.pkt.construct(Packet.ACCESS_LOGIN, `terminal,${uuid},${login_type},${model}`)
      cm = _this.pkt.construct(
        Packet.ACCESS_LOGIN,
        `terminal,${uuid},${login_type},${model}`
      );
      Logger.val(`login pkt is :` + cm);
      // switch (login_type) {
      //     case LOGINTYPE.GROUP: cm = '{ALGI,00040,terminal,' + uuid + `,${login_type},${model}}`; break
      //     case LOGINTYPE.ADHOC: cm = '{ALGI,00035,terminal,' + uuid + ',adhoc,any}'; break
      //     case LOGINTYPE.FIXED: cm = '{ALGI,00035,terminal,' + uuid + ',fixed,any}'; break

      // }
      ctrFd.write(cm);
      ctrFd.setTimeout(1000);
      Logger.info("Login finish");
    });
  }

  async connect_to_server(
    server_ip: string,
    server_port: number,
    certificate: string,
    pid: string
  ): Promise<string> {
    // let options = {
    //     ca: certificate,
    //     rejectUnauthorized: false,
    //     requestCert: false,
    // }
    Logger.val("serverPort: " + server_port);
    let _this = this;
    return new Promise(function(resolve, reject) {
      // _this.udcServerClient = tls.connect(server_port, server_ip, options, () => {
      _this.udcServerClient = net.connect(server_port, server_ip, () => {
        resolve("success");
      });
      _this.udcServerClient.setNoDelay(true);
      _this.udcServerClient.on("error", () => {
        // _this.udcServerClient!.destroy()
        _this.udcServerClient = null;
        _this.dev_list = undefined;
        _this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        _this.hpp.removeAllListeners();
        Logger.info("error happened with the connection to server");
        reject("fail");
      });
      // _this.udcControlerClient.on("timeout", () => {
      //     _this.outputResult("connection to server timeout")

      // })
      _this.udcServerClient.on("close", () => {
        // _this.outputResult("udc server interrupts this connection,please try to reconnect")
        // _this.udcServerClient!.destroy();
        _this.udcServerClient = null;
        _this.dev_list = undefined;
        _this.hpp.removeAllListeners();
        setTimeout(() => {
          _this.events.emit("disconnect");
        }, 1000);
        _this.outputResult("The connection to LinkLab is disconnected!");
        Logger.info("Connection to Udc Server Closed!");
      });
      Logger.val("server pid:" + pid);
      // _this.udcServerClient.on('data', (data: Buffer) => _this.onUdcServerData(data, pid));
      _this.udcServerClient.on("data", (data: Buffer) => {
        // Logger.info("hpp received <<<<<<<<<<:" + data.toString('utf8'))
        _this.hpp.putData(data);
      });
      _this.hpp.on("data", (data) => {
        // Logger.info("hpp  processed >>>>>>>>>>:" + data.toString('utf8'))
        _this.onUdcServerData(data, pid);
      });

      _this.udcServerClient.setTimeout(3000);
      _this.udcServerClient.on("timeout", () => {
        //超时后将导致socket关闭
        _this.send_packet(Packet.HEARTBEAT, "");
      });
    });
  }

  onUdcServerData = (data: Buffer, pid: string) => {
    // let [type, , value] = this.pkt.parse(data.toString('ascii'));
    let [type, , value] = this.pkt.parse(data.toString("utf8"));
    Logger.info(`Received: type=${type}  value= ${value}`);

    if (type === Packet.ALL_DEV) {
      this.cis.storeCallInfoInstantly("end", CallSymbol.LDDC);
      let new_dev_list: { [key: string]: number } = {};
      let clients = value.split(":");
      for (let c of clients) {
        if (c === "") {
          continue;
        }
        let info = c.split(",");
        let uuid = info[0];
        let devs = info.slice(1);
        for (let d of devs) {
          if (d === "") {
            continue;
          }
          let [dev, using] = d.split("|");
          new_dev_list[uuid + "," + dev] = using;
        }
      }
      let tag = false;
      if (this.dev_list == undefined || this.dev_list == null) {
        tag = true;
      }
      this.dev_list = new_dev_list;
      //allocated devs {"1234567890123456,/dev/tinylink_platform_1-75735303731351C04212":"0"}
      let tmp = [];
      for (let item of Object.keys(this.dev_list)) {
        let slices = item.split("/");
        let res = slices[slices.length - 1].trim();
        res != "" ? tmp.push(res) : "";
      }
      if (tag) {
        // let devTab = "device list:\n"
        // for (let item of tmp) {
        //     devTab += "                   " + item + "\n"
        // }
        // this.outputResult(devTab)
        this.outputResult("LinkLab device ready...");
      }
      this.events.emit("build");
      if (this.udcClient) {
        this.udcClient.onDeviceList(new_dev_list);
      }
    } else if (type === Packet.DEVICE_STATUS) {
    } else if (type === Packet.TERMINAL_LOGIN) {
      if (value === "success") {
        Logger.info("server login success");
      } else {
        Logger.info("login failed retrying ...");
        this.connect(this.login_type, this.model, pid);
      }
    } else if (type === Packet.CMD_DONE || type === Packet.CMD_ERROR) {
      Logger.info(data.toString("utf8"));
      this.cmd_excute_return = value;
      this.cmd_excute_state = type === Packet.CMD_DONE ? "done" : "error";
      this.events.emit("cmd-response");
    } else if (type == Packet.MULTI_DEVICE_PROGRAM) {
      this.outputResult(
        "Burning option is not set correctly!\nPlease check your config.json",
        "err"
      );
    } else if (type == Packet.DEVICE_LOG) {
      let tmp: string = value
        .toString()
        .split(":")
        .slice(2)
        .join(":");
      let afterSplit = tmp.split("0E");
      let tag = afterSplit.slice(0, 1);
      Logger.info(tag[0], "tg_");
      Logger.info(tmp, "tp_");

      if (tmp.startsWith("0E")) {
        return;
      }
      // if (tag[0] == "") return;
      this.logEnable && this.outputResult(tmp, "log");
    } else if (type == Packet.DEVICE_PROGRAM_BEGIN) {
      this.lastCommitDevice = {
        timeMs: new Date().getTime(),
        device: value.split(":").pop(),
      };
      this.outputResult(
        `Burning ${this.lastCommitDevice.device}...`,
        "systemInfo"
      );
    } else if (type == Packet.DEVICE_PROGRAM_QUEUE) {
      let status = value.split(",").pop();
      this.outputResult("Programming " + status, "systemInfo");
      if (status == "success") {
        this.logEnable = true;
        this.cmd_excute_state = "done";
        this.cis.storeCallInfoInstantly("end", CallSymbol.LDDP);
        this.events.emit("cmd-response");
      } else {
        this.cis.storeCallInfoInstantly("unfinish", CallSymbol.LDDP, 1);
        this.cmd_excute_state = "unfinish";
      }
    } else if (type == Packet.DEVICE_WAIT) {
      this.outputResult(
        "program status:" + value.split(":").pop(),
        "systemInfo"
      );
    } else if (type == Packet.QUERY_IDLE_DEVICES) {
      let num = parseInt(value.split(":").pop());
      this.outputResult("Remaining device:" + num, "systemInfo");
      if (num <= 0) {
        this.events.emit("goSim");
      } else {
        this.events.emit("goDevice");
      }

      // this.setTinyLink("executeSelectPanel", "")
    } else if (type == Packet.LOG_JSON) {
      let logObj = JSON.parse(value);
      console.log(this.currentWaitId);
      if (logObj["waitingId"] != this.currentWaitId) return;
      for (let item of logObj["logs"]) {
        if (item.startsWith("0E")) {
          if (
            item
              .split("0010")
              .pop()
              .trim() == ""
          ) {
            this.logEnable && this.outputResult("0E0010", "log");
          } else if (
            item
              .split("0011")
              .pop()
              .trim() == ""
          ) {
            this.logEnable && this.outputResult("0E0011", "log");
          }
          continue;
        }
        this.logEnable && this.outputResult(item, "log");
      }
      // if (logObj["isEnd"] == true) {
      //     this.outputResult('error happened when checking your answer,review your code to see if you code is terminated by a "end" output')
      // }
      // else {
      //     this.outputResult("program finished")
      // }
    }
    this.udcServerClient!.write(this.pkt.construct(Packet.HEARTBEAT, ""));
  };
  //{DPBG,00079,7194559383644183:499c6e072349991a:/dev/tinylink_platform_1-558343238323511002B1}
  // {DPGQ,00024,7194559383644183,success}

  async list_models(): Promise<Array<string>> {
    let default_devices = [
      "aiotkit",
      "developerkit",
      "esp32",
      "esp8266",
      "mk3060",
      "stm32l432kc",
      "tinylink_platform_1",
      "tinylink_lora",
      "tinylink_raspi",
    ];
    return new Promise((resolve, reject) => resolve(default_devices));
  }

  get is_connected(): Boolean {
    // return (this.udcServerClient.destroyed != null);
    return this.udcServerClient != null && !this.udcServerClient.destroyed;
  }
  setQueue() {
    let _this = this;
    if (this.currentPid == "") {
      this.outputResult("please connect dev,there is no pid!");
      return;
    }
    if (this.is_connected) {
      this.disconnect().then(() => {
        _this.connect(
          "queue",
          this.pidQueueInfo[this.currentPid].model,
          this.currentPid,
          this.pidQueueInfo[this.currentPid].timeout
        );
      });
    } else
      this.connect(
        "queue",
        this.pidQueueInfo[this.currentPid].model,
        this.currentPid,
        this.pidQueueInfo[this.currentPid].timeout
      );
  }
  storeState(data: string) {
    Logger.info(`data:${data}`);
    let tmp = JSON.parse(data);
    for (let index in tmp) this.dataStorage[index] = tmp[index];
  }
  // 39d16c10bbef0000
  getState(type: string): Promise<string> {
    Logger.info(`type info :${type}`, "type");
    let tmp: { [key: string]: {} } = {};
    tmp[type] = this.dataStorage[type];
    return new Promise((res) => res(JSON.stringify(tmp)));
  }
  async awaitConnnect(): Promise<boolean> {
    return await new Promise((res) => {
      let p = setTimeout(() => {
        res(false);
        this.events.removeListener("build", () => {
          clearTimeout(p);
          res(true);
        });
      }, 5000);
      this.events.once("build", () => {
        clearTimeout(p);
        res(true);
      });
    });
  }
  async connect(
    loginTypeNotUse: string,
    modelNotUse: string,
    pid: string,
    timeout: string = `20`
  ): Promise<boolean> {
    // loginType = LOGINTYPE.QUEUE
    // model = `alios-esp32`
    Logger.info("start connecting backend" + pid + `:${timeout}`);
    let { loginType, model } = this.pidQueueInfo[pid];
    if (loginType == undefined || loginType == "") {
      Logger.info("the backend doesn't config now!");
      this.refreshConfiguration(pid);
      loginType = this.pidQueueInfo[pid].loginType;
      model = this.pidQueueInfo[pid].model;
      if (loginType == undefined || loginType == "") {
        return false;
      }
    }
    Logger.val(`timeout: ${timeout}`);
    this.pidQueueInfo[pid] = {
      ...this.pidQueueInfo[pid],
      // fns: JSON.stringify(["helloworld", "helloworld", 'README.md', 'ucube.py']),
      // dirName: "helloworld",
      // loginType: loginType,
      // loginType: loginType,
      // model: model,
      waitID: (
        Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
        Math.pow(10, 15)
      ).toString(),
    };
    if (this.currentPid == pid && (await this.is_connected)) {
      this.outputResult(
        "Duplicated connection to server. No need for further operation."
      );
      return true;
    }
    this.currentPid = pid;
    let login_type = LOGINTYPE.QUEUE;
    // model = `tinylink_lora`

    switch (loginType) {
      case "fixed":
        login_type = LOGINTYPE.FIXED;
        break;
      // case "adhoc": login_type = LOGINTYPE.ADHOC; break
      case "adhoc":
        login_type = LOGINTYPE.QUEUE;
        break;
      case "group":
        login_type = LOGINTYPE.GROUP;
        break;
      case "queue":
        login_type = LOGINTYPE.QUEUE;
        break;

      default:
        Logger.err(`Error loginType:${loginType}`);
    }
    this.login_type = login_type;
    Logger.val(`>>>>>>>>>login type :${login_type} model :${model}`);
    Logger.val(">>>>>>>>>pid" + pid);
    this.cis.storeCallInfoInstantly("start", CallSymbol.LDDC);
    let rets = await this.login_and_get_server(login_type, model);
    if (rets === []) {
      return false;
    }
    let [re, server_ip, server_port, token, certificate] = rets;
    if (re != "success") {
      return false;
    }
    this.outputResult("Connected to device controller!");
    let result = await this.connect_to_server(
      server_ip,
      server_port,
      certificate,
      pid
    );
    Logger.val("result-----------------------------" + result);
    if (result !== "success") return false;
    this.outputResult("Connected to server!");
    await this.send_packet(
      Packet.packet_type.TERMINAL_LOGIN,
      `${this.uuid},${token},${pid}`
    ); //modifiy,timeout/
    // await this.AC.postNameAndType("helloworld", "esp32devkitc")

    return this.awaitConnnect();
  }
  async waitDisconnect(): Promise<Boolean> {
    return new Promise((res) => {
      let x = setTimeout(() => {
        res(false);
        this.events.removeListener("disconnect", () => {
          res(true);
        });
      }, 10000);

      this.events.once("disconnect", () => {
        clearTimeout(x);
        setTimeout(() => {
          res(true);
        }, 1000);
      });
    });
  }

  async disconnect(): Promise<Boolean> {
    if (this.udcServerClient === null) {
      return true;
    }
    try {
      !this.tinySimRequest ? "" : this.tinySimRequest.close();
    } catch (error) {
      this.tinySimRequest = null;
      Logger.info(error);
    }

    this.hpp.removeAllListeners("data");
    // await this.udcServerClient.destroy();
    // this.udcServerClient = null;
    // this.dev_list = undefined
    (await this.udcServerClient) == undefined ? "" : this.udcServerClient.end();

    return await this.waitDisconnect();
  }

  async erase_device(dev_str: string) {
    this.send_packet(Packet.DEVICE_ERASE, dev_str);
    await this.wait_cmd_excute_done(120000);
    return this.cmd_excute_state === "done" ? true : false;
  }
  continueExe() {
    Logger.info("fw c");
    this.events.emit("dev_fw");
  }
  terminateExe() {
    Logger.info("term", "term");
    this.events.emit("sim_rt");
  }

  async wait_response(waitID: string, timeout: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.events.removeAllListeners("enterQueue");
        Logger.info("wait for queue system timeOut");
        this.programState[waitID] = {};
        this.programState[waitID]["programable"] = "false";
        resolve();
      }, timeout);
      this.events.once("enterQueue", () => {
        this.programState[waitID]["waitState"] = "true";
        this.programState[waitID]["programable"] = "true";
        this.events.removeAllListeners("enterQueue");
        resolve();
      });
    });
  }
  // async program_device_queue(filepath: string, address: string, devstr: string, model: string = "tinylink_platform_1", waitID: string = "1234567890123456", timeout: string = "20"): Promise<Boolean> {
  async program_device_queue(
    filepath: string,
    address: string,
    devstr: string,
    pid: string
  ): Promise<Boolean> {
    let model = this.pidQueueInfo[pid].model;
    let waitID = this.pidQueueInfo[pid].waitID;
    let timeout = this.pidQueueInfo[pid].timeout;
    this.send_packet(Packet.DEVICE_WAIT, `${model}:${waitID}:${timeout}`);
    await this.wait_response(waitID, 20000);
    if (this.programState[waitID]["programable"] == "true") {
      Logger.info("enter in queue scc", " ^.^> ");
      let result = await this.send_file_to_client(
        filepath,
        `${this.programState[waitID].clientID},${this.programState[waitID].devicePort}`
      );
      if (result == false) {
        Logger.err("send file err");
        this.outputResult("send hex file to LDC err");
        return false;
      }
      this.outputResult("send hex file to LDC success");
      let content = `${this.programState[waitID].clientID},${
        this.programState[waitID].devicePort
      },0x10000,${await this.pkt.hash_of_file(filepath)},${waitID},${pid}`;
      Logger.info(content, "content:");
      // this.outputResult('Burning ${this.lastCommitDevice.device}...')
      this.send_packet(Packet.DEVICE_PROGRAM_QUEUE, content);
      await this.wait_cmd_excute_done(270000);
      if (this.cmd_excute_state === "done") {
        this.outputResult("burn success ^.^");
      } else {
        this.outputResult("burn err ^.^");
      }
    } else {
      Logger.info("enter in queue failed", " T.T ");
      return false;
    }
    return true;
  }
  async program_device(pid: string, setJson: string): Promise<Boolean> {
    let _this = this;
    // let content = `${model}:${waitID}:${timeout}:${address}:${await this.pkt.hash_of_file(filepath)}:${pid}`
    // _this.outputResult(`Burning ${this.lastCommitDevice.device}...`);
    let js = JSON.parse(setJson);
    this.currentWaitId = js["program"][0]["waitingId"];
    this.cis.storeCallInfoInstantly("start", CallSymbol.LDDP);
    this.send_packet(Packet.MULTI_DEVICE_PROGRAM, setJson);

    await this.wait_cmd_excute_done(27000);
    return this.cmd_excute_state === "done" ? true : false;
  }
  async program_device_scene(
    filepath: string,
    address: string,
    devstr: string,
    pid: string
  ): Promise<Boolean> {
    let _this = this;
    let { timeout, model, waitID } = this.pidQueueInfo[pid];
    let content = `${model}:${waitID}:${timeout}:${address}:${await this.pkt.hash_of_file(
      filepath
    )}:${pid}`;
    _this.outputResult(`Burning ${this.lastCommitDevice.device}...`);
    this.send_packet(Packet.DEVICE_WAIT, content);
    await this.wait_cmd_excute_done(27000);
    return this.cmd_excute_state === "done" ? true : false;
  }

  async program_device_group(
    filepath: string,
    address: string,
    devstr: string,
    pid: string
  ): Promise<Boolean> {
    let _this = this;
    let uploadResult = "scc";
    let configResult = await new Promise((resolve) => {
      Logger.info("configuring burning program");
      let hash = crypto.createHash("sha1");
      let buff = fs.readFileSync(filepath);
      // let hashVal = hash.update(buff).digest("hex")
      let hashVal = hash.update(buff).digest("hex");
      Logger.info("hex hashval:" + hashVal);
      let configRequest = http.request(
        {
          //
          method: "POST",
          hostname: PROGRAM_SERVER_IP,
          port: PROGRAM_SERVER_PORT,
          path: "/config",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (mesg) => {
          let bf = "";
          if (mesg == undefined) {
            _this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            Logger.info("error happened while config");
            return;
          }
          mesg.on("data", (b: Buffer) => {
            bf += b.toString("utf8");
          });
          mesg.on("error", () => {
            Logger.info("error happened while config");
            _this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            resolve("err");
          });
          mesg.on("end", () => {
            Logger.info("bf:" + bf);
            let res: any = JSON.parse(bf);
            if (!res.result) {
              Logger.info("Initializing burning tools successful!");
              _this.outputResult("Initializing burning tools successful!");
              Logger.info(res.status);
              resolve("scc");
            } else {
              Logger.info(res.status); //已经存在
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
        resolve("err");
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
      uploadResult = await new Promise(async (resolve) => {
        let uploadRequest = http.request(
          {
            //传zip
            method: "POST",
            hostname: PROGRAM_SERVER_IP,
            port: PROGRAM_SERVER_PORT,
            path: "/upload",
            // headers: {
            //     "Accept": "application/json",
            //     "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
            // },
            headers: fm.getHeaders(),
          },
          (mesg) => {
            if (mesg == undefined) {
              _this.outputResult(
                "Network error!\nYou can check your network connection and retry.",
                "err"
              );
              Logger.info("error happened while upload");
              resolve("err");
              return;
            }
            let bf = "";
            Logger.info("upload statuscode:" + mesg.statusCode);
            mesg.on("data", (b: Buffer) => {
              Logger.info("data comming");
              bf += b.toString("utf8");
            });
            mesg.on("error", () => {
              Logger.info("error happened while upload");
              _this.outputResult(
                "Network error!\nYou can check your network connection and retry.",
                "err"
              );
              resolve("err");
            });
            mesg.on("end", () => {
              Logger.info("bf:" + bf);
              let res: any = JSON.parse(bf);
              if (res.result) {
                resolve("scc");
              } else {
                _this.outputResult(res.msg);
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
          resolve("err");
        });
        // let blob = fs.readFileSync(filepath)
        let st = fs.createReadStream(filepath);
        Logger.info("append file");
        // fm.append("file", blob, filepath.split("/").pop())
        fm.append("file", st, filepath.split("/").pop());
        fm.pipe(uploadRequest);
        Logger.info("file append ok");
      });
    } else {
      // _this.outputResult("file exist ")
    }

    if (uploadResult != "scc") {
      Logger.info("uploading zip file err");
      _this.outputResult("hexfile upload error");
      return false;
    } else {
      Logger.info("uploading zip file scc");
      _this.outputResult("hexfile upload success");
    }
    let content = `${devstr},${address},${await this.pkt.hash_of_file(
      filepath
    )},${pid}`;
    this.outputResult(`Burning ${this.lastCommitDevice.device}...`);
    // this.outputResult('program content:' + content)
    this.send_packet(Packet.DEVICE_PROGRAM, content);
    await this.wait_cmd_excute_done(270000);
    if (this.cmd_excute_state === "done") {
      this.outputResult("burn success ^.^");
      return true;
    } else {
      this.outputResult("burn error T.T");
      return false;
    }
  }

  async run_command(devstr: string, args: string) {
    let content = `${devstr}:${args.replace(" ", "|")}`;
    this.send_packet(Packet.DEVICE_CMD, content);
    await this.wait_cmd_excute_done(1500);
    return this.cmd_excute_state === "done" ? true : false;
  }

  async control_device(devstr: string, operation: string): Promise<Boolean> {
    let operations: { [key: string]: string } = {
      start: Packet.DEVICE_START,
      stop: Packet.DEVICE_STOP,
      reset: Packet.DEVICE_RESET,
    };
    if (operations.hasOwnProperty(operation) === false) {
      return false;
    }
    this.send_packet(operations[operation], devstr);
    await this.wait_cmd_excute_done(10000);
    return this.cmd_excute_state === "done" ? true : false;
  }

  async getIdleDeviceCount(pid: string) {
    this.outputResult("Received number of idle device");
    let { model } = this.getPidInfos(pid);
    let content = model;
    this.send_packet(Packet.QUERY_IDLE_DEVICES, content);
    await this.wait_cmd_excute_done(2000);
    return this.cmd_excute_state === "done" ? true : false;
  }
  async send_file_to_client(
    filepath: string,
    devstr: string
  ): Promise<Boolean> {
    let filehash = await this.pkt.hash_of_file(filepath);
    let fullpath = filepath.split("/");
    let filename = fullpath[fullpath.length - 1];
    let content = devstr + ":" + filehash + ":" + filename;
    // this.outputResult("filehash:" + filehash)
    let retry = 4;

    while (retry > 0) {
      Logger.info(`Packet.FILE_BEGIN:${Packet.FILE_BEGIN},content:${content}`);
      this.send_packet(Packet.FILE_BEGIN, content);
      await this.wait_cmd_excute_done(2000);
      if (this.cmd_excute_state === "timeout") {
        Logger.err("file send timeout");
        retry--;
        continue;
      }
      if (this.cmd_excute_return === "busy") {
        Logger.err("file send busy");
        await new Promise((res) => setTimeout(res, 5000));
        continue;
      }
      if (
        this.cmd_excute_return === "ok" ||
        this.cmd_excute_return === "exist"
      ) {
        break;
      }
    }
    if (retry === 0) {
      return false;
    }
    if (this.cmd_excute_return === "exist") {
      return true;
    }
    let fileBuffer = await fs.readFileSync(filepath);
    // Logger.info(fileBuffer.slice(0, 8).toString("hex"), "file buff:")
    // return false
    let seq = 0;
    while (seq * 8192 < fileBuffer.length) {
      let header = `${devstr}:${filehash}:${seq}:`;
      let end = (seq + 1) * 8192;
      if (end > fileBuffer.length) {
        end = fileBuffer.length;
      }
      retry = 4;
      while (retry > 0) {
        Logger.info("sending data");
        this.send_packet(
          Packet.FILE_DATA,
          header + fileBuffer.slice(seq * 8192, end).toString("hex")
        );
        await this.wait_cmd_excute_done(2000);
        if (this.cmd_excute_return === null) {
          Logger.info("cmd retuen null");

          retry--;
          continue;
        } else if (this.cmd_excute_return != "ok") {
          Logger.info("cmd not ok");
          return false;
        }
        break;
      }
      if (retry === 0) {
        return false;
      }
      seq++;
    }
    content = `${devstr}:${filehash}:${filename}`;
    retry = 4;
    while (retry > 0) {
      this.send_packet(Packet.FILE_END, content);
      await this.wait_cmd_excute_done(2000);
      if (this.cmd_excute_return === null) {
        retry--;
        Logger.err("command return null");
        continue;
      } else if (this.cmd_excute_return != "ok") {
        Logger.err("not ok <<<<<<<<<<<<<<<<<,");
        return false;
      }
      break;
    }
    if (retry === 0) {
      return false;
    }
    return true;
  }

  send_packet(type: string, content: string) {
    // this.udcServerClient.write(this.pkt.construct(Packet.HEARTBEAT, ""));

    // if (type == Packet.TERMINAL_LOGIN)
    //     Logger.log(this.udcServerClient)
    // Logger.log("---------------------type right: "+type+content)
    this.udcServerClient!.write(
      this.pkt.construct(type, content),
      (err: any) => {}
    );
  }

  async wait_cmd_excute_done(timeout: number) {
    this.cmd_excute_state = "wait_response";
    this.cmd_excute_return = null;
    return new Promise((resolve, reject) => {
      let cmd_timeout = setTimeout(() => {
        this.cmd_excute_state = "timeout";
        this.events.removeAllListeners("cmd-response");
        resolve();
      }, timeout);
      this.events.once("cmd-response", () => {
        clearTimeout(cmd_timeout);
        this.events.removeAllListeners("cmd-response");
        resolve();
      });
    });
  }

  get_devlist() {
    return this.dev_list;
  }

  setCookie(cookie: string): boolean {
    if (cookie != null && cookie != undefined && cookie != "") {
      this.cookie = cookie;
      Logger.val("cookie is :" + this.cookie);
      return false;
    }
    Logger.info(" null cookie");
    return true;
  }
  outputResult(res: string, types: string = "systemInfo") {
    res = res.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );
    let d = new Date().toLocaleTimeString();
    Color.enable();
    switch (types) {
      case undefined:
      default:
      case "systemInfo": {
        this.udcClient &&
          this.udcClient.OnDeviceLog(
            "::" + `[INFO][${d}][WebIDE] ${res}`.green
          );
        break;
      }
      case "log": {
        this.udcClient &&
          this.udcClient.OnDeviceLog(
            "::" + `[LOG][${d}][WebIDE] ${res.gray}`.white
          );
        break;
      }
      case "err": {
        this.udcClient &&
          this.udcClient.OnDeviceLog("::" + `[ERROR][${d}][WebIDE] ${res}`.red);
        break;
      }
    }
  }
  config() {
    this.udcClient && this.udcClient.onConfigLog(this.tinyLinkInfo);
  }
  setTinyLink(name: string, passwd: string, uid: string): void {
    this.user = uid;
    this.tinyLinkInfo.name = name;
    this.tinyLinkInfo.passwd = passwd;
    console.log("userName&passwd:" + JSON.stringify(this.tinyLinkInfo));
  }
  openFile(pid: string, filename: string) {
    this.parseVirtualConfig(pid);
    let { dirName } = this.pidQueueInfo[pid];
    let url = path.join(
      this.rootDir.val,
      dirName,
      this.virtualConfig["projectName"],
      filename + ".cpp"
    );
    Logger.info(url);
    if (fs.existsSync(url)) {
      if (OS.type() == OS.Type.Linux)
        this.udcClient &&
          this.udcClient.onConfigLog({ name: "openSrcFile", passwd: url });
      else
        this.udcClient &&
          this.udcClient.onConfigLog({
            name: "openSrcFile",
            passwd: `/` + url,
          });
    } else {
      this.outputResult(
        "no this source file,please check you file structure and config"
      );
    }
  }
  async openPidFile(pid: string) {
    console.log("openFile");
    let i = 0;
    for (i = 0; i < 5; i++) {
      if (this.initTag == false) {
        // this.outputResult("wait for config file templates");
        await new Promise((res) => {
          setTimeout(() => {
            res();
          }, 3000);
        });
      } else {
        break;
      }
    }
    if (i == 5) {
      this.outputResult(
        "Retriving file template failed!\nPlease try again later.",
        "err"
      );
      return;
    }
    let { dirName } = this.pidQueueInfo[pid];
    if (
      this.pidQueueInfo[pid].type == "freecoding" ||
      this.pidQueueInfo[pid].type == "ai" ||
      this.pidQueueInfo[pid].type == "displayboard"
    ) {
      let configRaw: any;
      configRaw = fs.readFileSync(
        path.join(this.rootDir.val, dirName, "config.json")
      );
      try {
        let config = JSON.parse(configRaw);
        for (let item of config["projects"]) {
          let srcDir = item["projectName"];
          let fileArr = fs.readdirSync(
            path.join(this.rootDir.val, dirName, srcDir)
          );
          for (let file of fileArr) {
            if (OS.type() == OS.Type.Linux)
              this.udcClient &&
                this.udcClient.onConfigLog({
                  name: "openSrcFile",
                  passwd: path.join(this.rootDir.val, dirName, srcDir, file),
                });
            else {
              this.udcClient &&
                this.udcClient.onConfigLog({
                  name: "openSrcFile",
                  passwd:
                    `/` + path.join(this.rootDir.val, dirName, srcDir, file),
                });
            }
          }
        }
      } catch (e) {
        this.outputResult(
          "config.json is incorrect!\nPlease check it or restore it to default!",
          "err"
        );
        return;
      }
    } else {
      let fileArr = fs.readdirSync(path.join(this.rootDir.val, dirName));
      fileArr.forEach((val) => {
        if (
          fs.statSync(path.join(this.rootDir.val, dirName, val)).isDirectory()
        ) {
          let chidFileArr = fs.readdirSync(
            path.join(this.rootDir.val, dirName, val)
          );
          chidFileArr.forEach((file) => {
            console.log(file);
            if (
              fs
                .statSync(path.join(this.rootDir.val, dirName, val, file))
                .isFile() &&
              (file.split(".").pop() == "c" ||
                file.split(".").pop() == "cpp") &&
              file.split(".")[0] != "app_entry"
            ) {
              console.log(
                "openfile:" + path.join(this.rootDir.val, dirName, val, file)
              );
              if (OS.type() == OS.Type.Linux)
                this.udcClient &&
                  this.udcClient.onConfigLog({
                    name: "openSrcFile",
                    passwd: path.join(this.rootDir.val, dirName, val, file),
                  });
              else
                this.udcClient &&
                  this.udcClient.onConfigLog({
                    name: "openSrcFile",
                    passwd:
                      `/` + path.join(this.rootDir.val, dirName, val, file),
                  });
            }
          });
        }
      });
    }
    this.udcClient &&
      this.udcClient.onConfigLog({ name: "openShell", passwd: "" });
  }
  async postSimFile(pid: string) {
    let _this = this;
    let tmpPath = "";
    let { dirName, deviceRole } = this.pidQueueInfo[pid];
    if (deviceRole == undefined) {
      console.log("null device role ");
      return;
    }
    let fileDir = path.join(this.rootDir.val, dirName, deviceRole[0]);
    let fn = fs.readdirSync(fileDir)[0].split(".")[0];
    tmpPath = path.join(fileDir, fn + ".cpp");
    Logger.val(`tmpPath:${tmpPath}`);
    let b = fs.readFileSync(tmpPath);
    _this.outputResult("Connecting to device simulator...");
    _this.cis.storeCallInfoInstantly("start", CallSymbol.TISM);
    this.tinySimRequest = new WebSocket(SENCE_SERVER_URL, {
      // "ws://localhost:8765/", {
    });
    await new Promise((res) => {
      if (!this.tinySimRequest) {
        res();
        return;
      }
      this.tinySimRequest.on("message", (data: string) => {
        let tmp = new Buffer(data).toString("utf8");
        console.log(tmp.toString());
        _this.outputResult(tmp.toString(), "log");
      });
      this.tinySimRequest.on("close", () => {
        this.tinySimRequest = null;
        _this.cis.storeCallInfoInstantly("end", CallSymbol.TISM);
        res();
      });
      this.tinySimRequest.on("open", async () => {
        _this.outputResult("Sending data to device simulator...");
        this.tinySimRequest!.send(b, () => {
          _this.outputResult("Sending data to device simulator successful!");
          this.tinySimRequest!.send(new Buffer(`pid:${pid}:quit`), () => {
            _this.outputResult("quit");
          });
        });
      });
      this.tinySimRequest.on("error", () => {
        this.tinySimRequest = null;
        _this.cis.storeCallInfoInstantly("broken network", CallSymbol.TISM, 1);
        _this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
      });
      this.tinySimRequest.on("close", () => {
        this.udcClient!.onConfigLog({ name: "submitEnable", passwd: "" });
      });
    });
  }
  literalAnalysis(pid: string) {
    let { dirName } = this.pidQueueInfo[pid];
    let src: string = "";
    let _this = this;
    try {
      src = fs
        .readFileSync(
          path.join(this.rootDir.val, dirName, "device", "device.cpp")
        )
        .toString("utf8");
    } catch {
      this.outputResult("Reading file error, check your file structure please");
    }
    let dataStr = "";
    let fileRequest = http.request(
      {
        //
        method: "POST",
        hostname: "judge.tinylink.cn",
        path: "/problem/literal/judge",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (mesg) => {
        if (mesg == undefined) {
          _this.outputResult(
            "Network error!\nYou can check your network connection and retry.",
            "err"
          );
          Logger.info("error happened while judge");
          return;
        }
        mesg.on("data", (b: Buffer) => {
          dataStr += b.toString("utf8");
        });
        mesg.on("end", () => {
          let res: any;
          try {
            res = JSON.parse(dataStr);
          } catch {
            Logger.info("err json structure");
            return;
          }
          this.outputResult(res.msg);
        });
      }
    );
    fileRequest.on("error", () => {
      this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
    });
    fileRequest.write(
      JSON.stringify({
        pid: pid,
        src: src,
      })
    );
    fileRequest.end();
  }
  getSSHCMD() {
    let dataStr = "";
    this.cis.storeCallInfoInstantly("start", CallSymbol.GESI);
    let urlRequest = http.request(
      {
        //
        method: "GET",
        port: "12320",
        hostname: DEPLOY_SERVER_IP,
        path: "/get_by_devport?devport=" + this.lastCommitDevice.device,
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
          Logger.info("error happened while get web server");
          return;
        }
        mesg.on("data", (b: Buffer) => {
          dataStr += b.toString("utf8");
        });
        mesg.on("end", () => {
          let res: any;
          try {
            res = JSON.parse(dataStr);
            if (res["code"] != 0) {
              let log =
                "Get ssh_cmd failed:" +
                res["msg"] +
                `\n deviceName:${this.lastCommitDevice.device}\nPlease try again later.`;
              this.outputResult(log, "err");
              this.cis.storeCallInfoInstantly(log, CallSymbol.GESI, 1);
              return;
            } else {
              let str = "";
              for (let item of res["data"]) {
                str += `Recieved Raspberry Pi login command!------ssh_cmd:${item["sshcmd"]}  passwd:${item["port"]}\n`;
              }
              this.cis.storeCallInfoInstantly("end", CallSymbol.GESI);
              this.outputResult(`:\n${str}`);
            }
          } catch {
            Logger.info("err json structure");
            this.cis.storeCallInfoInstantly(
              "error back value",
              CallSymbol.GESI,
              1
            );
            return;
          }
        });
      }
    );
    urlRequest.on("error", () => {
      this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
      this.cis.storeCallInfoInstantly("broken network", CallSymbol.GESI, 1);
    });
    urlRequest.write("");
    urlRequest.end();
  }
  getLastWebUrl() {
    let dataStr = "";
    this.cis.storeCallInfoInstantly("start", CallSymbol.GTSD);
    let urlRequest = http.request(
      {
        //
        method: "GET",
        port: RASPBERRY_QUERRY_PORT,
        hostname: RASPBERRY_QUERRY_IP,
        path: "/get_by_devport?devport=" + this.lastCommitDevice.device,
        headers: {
          "Content-Type": "application/json",
        },
      },
      (mesg) => {
        if (mesg == undefined) {
          this.outputResult("error back value");
          Logger.info("error happened while get web server");
          this.cis.storeCallInfoInstantly(
            "error back value",
            CallSymbol.GTSD,
            1
          );
          return;
        }
        mesg.on("data", (b: Buffer) => {
          dataStr += b.toString("utf8");
        });
        mesg.on("end", () => {
          let res: any;
          try {
            res = JSON.parse(dataStr);
            if (res["code"] != 0) {
              this.outputResult(
                "Get deployed server url failed:" +
                  res["msg"] +
                  `\n deviceName:${this.lastCommitDevice.device}\nPlease try again later.`,
                "err"
              );
              this.cis.storeCallInfoInstantly(
                "error back value",
                CallSymbol.GTSD,
                1
              );
              return;
            } else {
              let str = "";
              for (let item of res["data"]) {
                str += `------${item["ipaddress"]}:${item["port"]}\n`;
              }
              let log = `host:\n${str}------was deployed ${(new Date().getTime() -
                this.lastCommitDevice.timeMs) /
                1000} seconds before`;
              this.outputResult(log);
              this.cis.storeCallInfoInstantly(log, CallSymbol.GTSD);
            }
          } catch {
            Logger.info("err json structure");
            this.cis.storeCallInfoInstantly(
              "error back value",
              CallSymbol.GTSD,
              1
            );
            return;
          }
        });
      }
    );
    urlRequest.on("error", () => {
      this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
    });
    urlRequest.write("");
    urlRequest.end();
  }

  getSocket() {
    let dataStr = "";
    this.cis.storeCallInfoInstantly("start", CallSymbol.GTSD);
    let urlRequest = http.request(
      {
        //
        method: "GET",
        port: RASPBERRY_QUERRY_PORT,
        hostname: RASPBERRY_QUERRY_IP,
        path: "/get_by_devport?devport=" + this.lastCommitDevice.device,
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
          Logger.info("error happened while get web server");
          return;
        }
        mesg.on("data", (b: Buffer) => {
          dataStr += b.toString("utf8");
        });
        mesg.on("end", () => {
          let res: any;
          try {
            res = JSON.parse(dataStr);
            if (res["code"] != 0) {
              let log =
                "get deployed server failed:" +
                res["msg"] +
                `\n deviceName:${this.lastCommitDevice.device}:`;
              this.outputResult(log);

              this.cis.storeCallInfoInstantly(log, CallSymbol.GTSD, 1);
              return;
            } else {
              let str = "";
              for (let item of res["data"]) {
                str += `------ip:${item["ipaddress"]} port:${item["port"]}\n`;
              }
              this.outputResult(
                `${str}------was deployed ${(new Date().getTime() -
                  this.lastCommitDevice.timeMs) /
                  1000} seconds before`
              );

              this.cis.storeCallInfoInstantly("start", CallSymbol.GTSD);
            }
          } catch {
            Logger.info("err json structure");
            this.cis.storeCallInfoInstantly(
              "error back value",
              CallSymbol.GTSD,
              1
            );
            return;
          }
        });
      }
    );
    urlRequest.on("error", () => {
      this.cis.storeCallInfoInstantly("broken network", CallSymbol.GTSD, 1);
      this.outputResult(
        "Network error!\nYou can check your network connection and retry.",
        "err"
      );
    });
    urlRequest.write("");
    urlRequest.end();
  }
  async tinyEdgeUpload(pid: string): Promise<string> {
    let _this = this;
    console.log("tinyEdgePid:" + pid);
    let { dirName } = this.pidQueueInfo[pid];
    let projectDir = path.join(this.rootDir.val, dirName);
    let zipPath = path.join(this.rootDir.val, dirName, "src.zip");
    let installPath = path.join(
      this.rootDir.val,
      dirName,
      "Deploy",
      "install.sh"
    );
    let st = fs.createWriteStream(zipPath); //打包
    let achst = ach
      .create("zip")
      .directory(path.join(projectDir, "Custom"), "TinyEdge/Custom")
      .directory(path.join(projectDir, "Development"), "TinyEdge/Development");
    let p = new Promise((resolve) => {
      st.on("close", () => {
        _this.outputResult("Packing files successful!");
        resolve("scc");
      });
    });
    achst.pipe(st);
    achst.finalize();
    await p;
    let fm = new FormData();
    Logger.info("uploading hex file");
    this.cis.storeCallInfoInstantly("start", CallSymbol.TECC);
    return await new Promise(async (resolve) => {
      let uploadRequest = http.request(
        {
          //传zip
          method: "POST",

          hostname: TINYLINEDGECOMPILE_IP,
          port: 12381,
          path: "/api/system/linklab/compile",
          headers: fm.getHeaders(),
        },
        (mesg) => {
          if (mesg == undefined) {
            _this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            Logger.info("error happened while upload");
            resolve("err");
            this.cis.storeCallInfoInstantly(
              "error back value",
              CallSymbol.TECC,
              1
            );
            return;
          }
          let bf = "";
          Logger.info("upload statuscode:" + mesg.statusCode);
          mesg.on("data", (b: Buffer) => {
            Logger.info("data comming");
            bf += b.toString("utf8");
          });
          mesg.on("error", () => {
            Logger.info("error happened while upload");
            _this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            resolve("err");
          });
          mesg.on("end", () => {
            Logger.info("bf:" + bf);
            try {
              let res: any = JSON.parse(bf);
              if (res["code"] == "200") {
                fs.writeFileSync(installPath, res["data"]);
                fs.unlinkSync(zipPath);
                this.outputResult("TinyEdge compiling successful!");
                this.cis.storeCallInfoInstantly("end", CallSymbol.TECC);
                resolve("scc");
              } else if (res["code"]) {
                _this.outputResult(
                  "TinyEdge compiling failed!:" +
                    res.message +
                    "\nPlease check your code",
                  "err"
                );
                this.cis.storeCallInfoInstantly(
                  res.message,
                  CallSymbol.TECC,
                  1
                );
                resolve(res.message);
              } else {
                throw "error";
              }
            } catch {
              this.cis.storeCallInfoInstantly(
                "compile edge error",
                CallSymbol.TECC,
                1
              );
              _this.outputResult("compile edge error");
            }
          });
        }
      );
      uploadRequest.on("error", () => {
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.TECC, 1);
        _this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        resolve("err");
      });
      // let blob = fs.readFileSync(filepath)
      let filepath = zipPath;
      let st = fs.createReadStream(filepath);
      Logger.info("append file");
      fm.append("file", st, filepath.split("/").pop());
      fm.append("userName", this.tinyLinkInfo.name);
      fm.pipe(uploadRequest);
      Logger.info("file append ok");
    });
  }
  async initDisplayBoard(infoRaw: string) {
    this.rootDir.reset();
    try {
      let info = JSON.parse(infoRaw);
      let project = info.project;
      info = info.info;
      let x: { [key: string]: any } = {};
      x[info.pid] = {
        dirName: info.title,
        ppid: info.pid,
        loginType: "queue",
        model: "#####",
        type: "displayboard",
      };
      Logger.info("init Display");
      this.rootDir.val = project;
      !fs.existsSync(this.rootDir.val) ? fs.mkdirSync(this.rootDir.val) : "";
      await this.initPidQueueInfo(JSON.stringify(x), true);
      this.openPidFile(info.pid);
      // await this.requestFixedTemplate(info.pid, "freecoding", this.rootDir.val);
      this.refreshConfiguration(info.pid);
      this.parseFreeConfig(info.pid);
    } catch (e) {
      console.log(e);
      this.rootDir.reset();
      this.outputResult(
        "Initializing example failed!\nPlease check your code template",
        "err"
      );
    }
  }
}
