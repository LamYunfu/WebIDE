import { LdcInterface } from "../../Service_Interfaces/ldc_interface";
import { LdcData } from "../../Data_Center/ldc_data";
import { inject } from "inversify";
import { LDC_SERVER_IP, LDC_SERVER_PORT } from "../../../setting/backend-config";
import * as net from "net";

export class LdcService implements LdcInterface {
  constructor(@inject(LdcData) protected LdcData: LdcData) {  
  }
  protected login_and_get_server(
    login_type: string,
    model: string
  ): Promise<Array<any>> {
    let uuid = this.LdcData.uuid;
    let _this = this;
    return new Promise((resolve, reject)=>{
      let server_ip = LDC_SERVER_IP;
      let server_port = LDC_SERVER_PORT;
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
  connect(
    deviceType: string,
    userID: string,
    loginType: string,
    pid: string,
    timeout: string
  ): Promise<boolean> {}
  disconnect(): Promise<boolean> {}
}
