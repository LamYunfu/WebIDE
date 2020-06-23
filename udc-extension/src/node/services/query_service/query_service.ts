import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable } from "inversify";
import { Packet } from "../ldc/packet";
import { ServerConnectionInterface } from "../ldc/interfaces/server_connection_interface";
import { EventCenter } from "../tools/event_center";
import { Logger } from "../tools/logger";
import { CallInfoStorerInterface } from "../log/interfaces/call_storer_interface";
import {
  DEPLOY_SERVER_IP,
  RASPBERRY_QUERRY_PORT,
  RASPBERRY_QUERRY_IP,
} from "../../../setting/backend-config";
import * as http from "http";
import { CallSymbol } from "../../../setting/callsymbol";
@injectable()
export class QueryService {
  constructor(
    @inject(LdcShellInterface) protected readonly ldcShell: LdcShellInterface,
    @inject(ServerConnectionInterface)
    protected readonly sc: ServerConnectionInterface,
    @inject(EventCenter) protected cevents: EventCenter,
    @inject(CallInfoStorerInterface) protected cis: CallInfoStorerInterface
  ) {}

  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
  async getIdleDeviceCount(model: string) {
    this.outputResult("Received number of idle device");
    let content = model;
    this.sc.sendPacket(Packet.QUERY_IDLE_DEVICES, content);
  }
  getSSHCMD(device: string) {
    let dataStr = "";
    this.cis.storeCallInfoInstantly("start", CallSymbol.GESI);
    let urlRequest = http.request(
      {
        //
        method: "GET",
        port: "12320",
        hostname: DEPLOY_SERVER_IP,
        path: "/get_by_devport?devport=" + device,
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
                `\n deviceName:${device}\nPlease try again later.`;
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
  getLastWebUrl(lastCommitDevice: { device: string; timeMs: number }) {
    let dataStr = "";
    this.cis.storeCallInfoInstantly("start", CallSymbol.GTSD);
    let urlRequest = http.request(
      {
        //
        method: "GET",
        port: RASPBERRY_QUERRY_PORT,
        hostname: RASPBERRY_QUERRY_IP,
        path: "/get_by_devport?devport=" + lastCommitDevice.device,
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
                  `\n deviceName:${lastCommitDevice.device}\nPlease try again later.`,
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
                lastCommitDevice.timeMs) /
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
  getSocket(lastCommitDevice: { device: string; timeMs: number }) {
    let dataStr = "";
    this.cis.storeCallInfoInstantly("start", CallSymbol.GTSD);
    let urlRequest = http.request(
      {
        //
        method: "GET",
        port: RASPBERRY_QUERRY_PORT,
        hostname: RASPBERRY_QUERRY_IP,
        path: "/get_by_devport?devport=" + lastCommitDevice.device,
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
                `\n deviceName:${lastCommitDevice.device}:`;
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
                  lastCommitDevice.timeMs) /
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
}
