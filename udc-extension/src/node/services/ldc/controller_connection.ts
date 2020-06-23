import { inject } from "inversify";
import {
  LDC_SERVER_IP,
  LDC_SERVER_PORT,
} from "../../../setting/backend-config";
import * as net from "net";
import { Logger } from "../tools/logger";
import { Packet } from "./packet";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { ControllerConnectionInterface } from "./interfaces/controller_connection_interface";
import { CallInfoStorerInterface } from "../log/interfaces/call_storer_interface";
import { injectable, interfaces } from "inversify";
export function bindControllerConnection(bind: interfaces.Bind): void {
  bind(LdcControllerConnection).toSelf().inSingletonScope();;
  bind(ControllerConnectionInterface).to(LdcControllerConnection).inSingletonScope();;
}
@injectable()
export class LdcControllerConnection implements ControllerConnectionInterface {
  constructor(
    @inject(Packet) protected pkt: Packet,
    @inject(CallInfoStorerInterface) protected cis: CallInfoStorerInterface,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
  ) {}
  async login_and_get_server(
    uuid: string,
    login_type: string,
    model: string
  ): Promise<Array<any>> {
    return await new Promise((resolve, reject) => {
      let server_ip = LDC_SERVER_IP;
      let server_port = LDC_SERVER_PORT;
      let ctrFd = net.connect(server_port, server_ip, () => {
        Logger.info("connect scc");
      });
      ctrFd.on("error", () => {
        Logger.info("error happened with the connection to controller");
        this.outputResult(
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
        if (serverData.join().trim() == `no available device}`) {
          this.outputResult(
            "Device allocation error: no free device in LinkLab.\nPlease try again later.",
            "err"
          );
          reject("error");
        } else if (
          serverData.pop()!.trim() == `all this model type are working!}`
        ) {
          this.outputResult(
            "Device allocation error: no free device in LinkLab.\nPlease try again later.",
            "err"
          );
          reject("error");
        }
        resolve(serverData);
      });
      let cm = "";
      Logger.val(`length is :` + (uuid + `${login_type},${model}}`).length + 9);
      // cm = this.pkt.construct(Packet.ACCESS_LOGIN, `terminal,${uuid},${login_type},${model}`)
      cm = this.pkt.construct(
        Packet.ACCESS_LOGIN,
        `terminal,${uuid},${login_type},${model}`
      );
      Logger.val(`login pkt is :` + cm);
      ctrFd.write(cm);
      ctrFd.setTimeout(1000);
      Logger.info("Login finish");
    });
  }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
