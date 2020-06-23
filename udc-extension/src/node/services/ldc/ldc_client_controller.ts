import { LdcClientControllerInterface } from "./interfaces/ldc_client_controller_interface";
import { inject } from "inversify";
import { ControllerConnectionInterface } from "./interfaces/controller_connection_interface";
import { ServerConnectionInterface } from "./interfaces/server_connection_interface";
import { LdcData } from "../../data_center/ldc_data";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { Logger } from "../tools/logger";
import { injectable } from "inversify";
import { EventCenter } from "../tools/event_center";
import { Skeleton } from "../../data_center/program_data";
@injectable()
export class LdcClientController implements LdcClientControllerInterface {
  constructor(
    @inject(LdcData) protected ldd: LdcData,
    @inject(ControllerConnectionInterface)
    protected cc: ControllerConnectionInterface,
    @inject(ServerConnectionInterface) protected sc: ServerConnectionInterface,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(EventCenter) protected ec: EventCenter
  ) { }
  isConnected() {
    return this.sc.isConnected()
  }
  async disconnect(): Promise<boolean> {
    return await this.sc.disconnect()

  }
  async connect(): Promise<boolean> {
    this.outputResult("Connecting to ldc...")
    if (this.ldd.ldcState == "i" || this.ldd.ldcState == "c") {
      return false;
    }
    let rets: any;
    // if (!this.ldd.isValid()) {
    //   return false;
    // }
    try {
      rets = await this.cc.login_and_get_server(
        this.ldd.uuid,
        this.ldd.loginType,
        this.ldd.serverType,
      );
      if (rets === []) {
        return false;
      }
      let [re, server_ip, server_port, token, certificate] = rets;

      if (re != "success") {
        return false;
      }
      // this.outputResult("Connected to device controller!");
      let sb = new Promise<boolean>((res) => {
        // let p: any;
        // let to = setTimeout(() => {
        //   this.ec.off("build", p);
        //   res(false);
        // }, 120000);

        this.ec.once("build", () => {
          Logger.info("server ok ", "*serverok*");
          // clearTimeout(to);
          res(true);
        });
      });
      this.sc.connect_to_server(
        server_ip,
        server_port,
        certificate,
        this.ldd.pid,
        this.ldd.uuid,
        token
      );
      let r = await sb;
      // let r = true;
      Logger.info("connected to server " + r, "*hello*");
      return r;
    } catch (err) {
      Logger.info(err);
      this.outputResult("connection failed");
      return false;
    }
  }

  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }

  async burn(ske: Skeleton): Promise<boolean> {

    return await this.sc.program(ske);
  }
}
