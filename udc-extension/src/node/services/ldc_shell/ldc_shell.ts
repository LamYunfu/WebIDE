import * as Color from "colors";
import { UdcClient } from "../../../common/udc-watcher";
import { injectable, interfaces } from "inversify";
import {
  LdcShellInterface,
  DefaultLdcShell,
} from "./interfaces/ldc_shell_interface";
export function bindLdcShell(bind: interfaces.Bind) {
  bind(LdcShell)
    .toSelf()
    .inSingletonScope();
  bind(LdcShellInterface)
    .to(LdcShell)
    .inSingletonScope();
}

@injectable()
export class LdcShell {
  protected _udcClient: UdcClient | undefined;
  constructor(){
    console.log("start ldcshell.....")
  }
  get udcClient(): UdcClient | undefined {
    console.log("get udcclient:" + !!this._udcClient)
    return this._udcClient;
  }
  set udcClient(x: UdcClient | undefined) {
    console.log("set udcclient:" + !!x)
    this._udcClient = x;
  }
  setUdcClient(x: UdcClient) {
    console.log("setudcclient:" + !!x)
    this._udcClient = x
  }
  outputResult(res: string, types: string = "systemInfo") {
    console.log("----- output:" + !!this.udcClient)
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
  executeFrontCmd(cmd: { name: string; passwd: string }) {
    this.udcClient&&this.udcClient.onConfigLog(cmd)
   }
}
