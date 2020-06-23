import { injectable } from "inversify";
import * as fs from "fs-extra";
import { Call_Log_Path } from "../../../setting/backend-config";
import { UserInfo } from "../../data_center/user_info";
import { inject, interfaces } from "inversify";
import { CallInfoStorerInterface } from "./interfaces/call_storer_interface";
export function bindCallInfoStorer(bind: interfaces.Bind) {
  bind(CallInfoStorer).toSelf().inSingletonScope();;
  bind(CallInfoStorerInterface).to(CallInfoStorer).inSingletonScope();;
}
@injectable()
export class CallInfoStorer {
  constructor(@inject(UserInfo) protected user: UserInfo) {}
  storeCallInfoInstantly(info: string, api: string, severity: number = 0) {
    switch (severity) {
      case 0:
        info = `${new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", " ")} ${this.user.username} ${api} ${info}\n`;
        break;
      case 1:
        info = `${new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", " ")} ${this.user.username} ${api} error(${info})\n`;
        break;
    }
    !fs.existsSync(Call_Log_Path)
      ? fs.writeFileSync(Call_Log_Path, info + "\n")
      : fs.appendFileSync(Call_Log_Path, info + "\n");
  }
  storeCallInfoLatter(
    time: string,
    info: string,
    api: string,
    severity: number = 0
  ) {
    switch (severity) {
      case 0:
        info = `${time} ${this.user} ${api} ${info}\n`;
        break;
      case 1:
        info = `${time} ${this.user} ${api} error(${info})\n`;
        break;
    }
    !fs.existsSync(Call_Log_Path)
      ? fs.writeFileSync(Call_Log_Path, info + "\n")
      : fs.appendFileSync(Call_Log_Path, info + "\n");
  }
}
