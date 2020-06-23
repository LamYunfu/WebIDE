import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable } from "inversify";
import { OS } from "@theia/core";
@injectable()
export class FileOpener {
  constructor(
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
  ) { }
  openFile(path: string) {
    console.log("open file from backend:" + path)
    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: path,
      });
    else {
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: `/` + path,
      });
    }
  }
  openWorkspace(path: string) {
    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openWorkspace",
        passwd: path,
      });
    else
      this.ldcShell.executeFrontCmd({
        name: "openWorkspace",
        passwd: `/` + path,
      });
  }
}
