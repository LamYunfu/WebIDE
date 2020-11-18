import * as http from "http";
import { injectable, inject } from "inversify";
import * as fs from "fs-extra";

import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { Logger } from "../tools/logger";
@injectable()
export class LiteralAnalysis {
  constructor(
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
  ) {}
  literalAnalysis(pid: string, path: string) {
    let src: string;
    try {
      src = fs.readFileSync(path).toString("utf8");
    } catch {
      this.outputResult("Reading file error, check your file structure please");
      return;
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
          this.outputResult(
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
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
