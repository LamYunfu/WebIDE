import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindLdcShell } from "../ldc_shell";
import { LdcShellInterface } from "../interfaces/ldc_shell_interface";

describe("xx", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(
      new ContainerModule((bind) => {
        bindLdcShell(bind);
      })
    );
  });
  it("xx", () => {
    let x=testContainer.get<LdcShellInterface>(LdcShellInterface)
    x.outputResult("helloworld","")
  });
});
