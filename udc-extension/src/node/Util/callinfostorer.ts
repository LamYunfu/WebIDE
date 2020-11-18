import { injectable } from "inversify";
import * as fs from "fs-extra";
import { Call_Log_Path } from "../../setting/backend-config";
import * as mt from "moment-timezone"
@injectable()
export class CallInfoStorer {
  user = "null";

  storeCallInfoInstantly(info: string, api: string, severity: number = 0) {
    mt(new Date()).tz("Asia/Shanghai")
    switch (severity) {
      case 0:
        info = `${mt(new Date() ).tz("Asia/Shanghai").toString()
            .replace("T", " ")
            .replace("Z", " ")} ${this.user} ${api} ${info}\n`;
        break;
      case 1:
        info = `${mt(new Date() ).tz("Asia/Shanghai").toString()
          .replace("T", " ")
          .replace("Z", " ")} ${this.user} ${api} error(${info})\n`;
        break;
    }
    !fs.existsSync(Call_Log_Path)
      ? fs.writeFileSync(Call_Log_Path, info + "\n")
      : fs.appendFileSync(Call_Log_Path, info + "\n");
  }
  setUser(user: string) {
    this.user = user;
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
