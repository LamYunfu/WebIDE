import { ProjectData } from '../../data_center/project_data';
import { EventDefinition } from './../tools/event_definition';
import { Logger } from "../tools/logger";
import * as net from "net";
import { inject } from "inversify";
import { HalfPackProcess } from "./half-pkt-process";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { Packet } from "../../util/packet";
import { CallInfoStorer } from "../log/call_info_storer";
import { CallSymbol } from "../../../setting/callsymbol";
import { EventCenter } from "../tools/event_center";
import { ServerConnectionInterface } from "./interfaces/server_connection_interface";
import { LdcData } from "../../data_center/ldc_data";
import { injectable, interfaces } from "inversify";
import { Skeleton } from "../../data_center/program_data";
export function bindServerConnectionController(bind: interfaces.Bind): void {
  bind(Packet)
    .toSelf()
    .inSingletonScope();
  bind(ServerConnection)
    .toSelf()
    .inSingletonScope();
  bind(ServerConnectionInterface)
    .to(ServerConnection)
    .inSingletonScope();
}
@injectable()
export class ServerConnection implements ServerConnectionInterface {
  udcServerClient: net.Socket | undefined;
  dev_list: { [key: string]: number } | undefined;
  logEnable: boolean = true;
  cmd_excute_return: string = "done";
  cmd_excute_state: string = "";
  constructor(
    @inject(HalfPackProcess) protected hpp: HalfPackProcess,
    @inject(Packet) protected pkt: Packet,
    @inject(CallInfoStorer) protected cis: CallInfoStorer,
    @inject(EventCenter) protected events: EventCenter,
    @inject(LdcData) protected ldd: LdcData,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(EventDefinition) protected eventDefinition: EventDefinition,
    @inject(ProjectData) protected projectData: ProjectData
  ) { }
  isConnected(): boolean {
    return !!this.udcServerClient
  }
  async disconnect(): Promise<boolean> {
    try {
      this.hpp.removeAllListeners("data")
      this.udcServerClient!.removeAllListeners("data")
      this.udcServerClient!.end();
      this.udcServerClient = undefined
      return true;
    } catch (error) {
      return false;
    }
  }
  async connect_to_server(
    server_ip: string,
    server_port: number,
    certificate: string,
    pid: string,
    uuid: string,
    token: string
  ): Promise<boolean> {
    Logger.val("serverPort: " + server_port);
    return new Promise((resolve, reject) => {
      this.udcServerClient = net.connect(server_port, server_ip, async () => {
        this.sendPacket(
          Packet.packet_type.TERMINAL_LOGIN,
          `${uuid},${token},${pid}`
        );
        resolve(true);
      });
      //   this.udcServerClient.setNoDelay(true);
      this.udcServerClient.on("error", () => {
        // this.udcServerClient!.destroy()
        this.udcServerClient = undefined;
        this.dev_list = undefined;
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.hpp.removeAllListeners();
        Logger.info("error happened with the connection to server");
        reject("fail");
      });
      this.udcServerClient.on("close", () => {
        this.udcServerClient = undefined;
        this.dev_list = undefined;
        //关闭连接之后，关闭半包处理，将所有监听数据的函数关掉
        this.hpp.removeAllListeners();
        setTimeout(() => {
          this.events.emit("disconnect");
        }, 1000);
        this.outputResult("The connection to LinkLab is disconnected!");
        Logger.info("Connection to Udc Server Closed!");
      });
      Logger.val("server pid:" + this.ldd.pid);
      this.udcServerClient.on("data", (data: Buffer) => {
        //将数据放到粘包处理器进行接包处理
        this.hpp.putData(data);
      });
      //hpp处理完这个包之后会发送一个data事件
      this.hpp.on("data", (data) => {
        this.onUdcServerData(data);
      });

      this.udcServerClient.setTimeout(3000);
      this.udcServerClient.on("timeout", () => {
        //超时后将导致socket关闭
        this.sendPacket(Packet.HEARTBEAT, "");
      });
    });
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }

  sendPacket(type: string, content: string) {
    if(!!this.udcServerClient)
    this.udcServerClient.write(this.pkt.construct(type, content));
    else{
      throw "Connection to LDC is inactive,please retry"
    }
  }

  //根据返回不同的包的类型进行不同的操作
  onUdcServerData = (data: Buffer) => {
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

      this.dev_list = new_dev_list;
      let tmp = [];
      for (let item of Object.keys(this.dev_list)) {
        let slices = item.split("/");
        let res = slices[slices.length - 1].trim();
        res != "" ? tmp.push(res) : "";
      }
      if (this.events.emit("build")) {
        Logger.info("connection build", "*build*");
      } else {
        Logger.info("emit false", "*emit*");
      }
    } else if (type === Packet.DEVICE_STATUS) {
    } else if (type === Packet.TERMINAL_LOGIN) {
      if (value === "success") {
        Logger.info("server login success");
      } else {
        Logger.info("login failed retrying ...");
        // this.connect(this.login_type, this.model, pid);
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
      this.events.emit(this.eventDefinition.programState, false)
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
      this.ldd.lastCommitDevice = {
        timeMs: new Date().getTime(),
        device: value.split(":").pop(),
      };
      this.outputResult(
        `Burning ${this.ldd.lastCommitDevice.device}...`,
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
        this.events.emit(this.eventDefinition.programState, true)
      } else {
        this.events.emit(this.eventDefinition.programState, false)
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
      if (!this.projectData.subWaitingIds.find((res) => res == logObj["waitingId"])) {
        return
      }
      // console.log(this.ldd.waitingId);
      // if (logObj["waitingId"] != this.ldd.waitingId) return;
      if (this.ldd.waitingIds.indexOf(logObj["waitingId"].trim()) == -1) {
        console.log(JSON.stringify(this.ldd.waitingIds) + ":" + logObj["waitingId"])
        return
      }
      for (let item of logObj["logs"]) {
        item= item.replace(
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ""
        );
        if(item.trim()==""){
          continue;
        }
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
    }
    this.udcServerClient!.write(this.pkt.construct(Packet.HEARTBEAT, ""));
  };
  async program(ske: Skeleton): Promise<boolean> {
    try {
      console.log("烧写的内容是：" + JSON.stringify(ske))
      this.cis.storeCallInfoInstantly("start", CallSymbol.LDDP);
      this.sendPacket(Packet.MULTI_DEVICE_PROGRAM, JSON.stringify(ske));
      return true;
      
    } catch (error) {
      this.outputResult(error,"err")
      return false;
    }
  }
}
// "program":[{"model":"tinylink_platform_1","waitingId":"2243252646464946","address":"0x1000","runtime":42,"filehash":"2bf7be2225f2fcc796177e057db2103c35260f62"}]}

// {"type":"QUEUE","groupId":"9034597441779752","pid":"2352","program":[{"model":"tinylink_platform_1","waitingId":"4182145813183712","address":"0x1000","runtime":42,"filehash":"2bf7be2225f2fcc796177e057db2103c35260f62"}]}
// {"type":"QUEUE","groupId":"7025968715238829","pid":"2182","program":[{"model":"alios_esp32","waitingId":"1885638770633241","address":"0x1000","runtime":46,"filehash":"bfd319bbdd3e2440a754d113394bf9c32c478f38"}]}