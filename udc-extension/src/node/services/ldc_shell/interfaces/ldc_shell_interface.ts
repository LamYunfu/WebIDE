import { UdcClient } from './../../../../common/udc-watcher';
import { injectable } from "inversify";
import { Logger } from "../../tools/logger";

export const LdcShellInterface = Symbol("LdcShellInterface");
export interface LdcShellInterface {
  outputResult: (res: string, types: string) => void;
  executeFrontCmd: (cmd: { name: string; passwd: string }) => void;
  setUdcClient: (x: UdcClient) => void
}
@injectable()
export class DefaultLdcShell implements LdcShellInterface {
  setUdcClient(x: UdcClient) {

  }
  outputResult(res: string, types: string) {
    Logger.info("shell:" + res);
  }

  executeFrontCmd(cmd: { name: string; passwd: string }) { }
}
