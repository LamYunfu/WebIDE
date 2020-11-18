import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable } from "inversify";
import { CallInfoStorerInterface } from "../log/interfaces/call_storer_interface";
@injectable()
export class Demo {
  constructor(
    @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
    @inject(CallInfoStorerInterface) readonly cis: CallInfoStorerInterface
  ) {}
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
