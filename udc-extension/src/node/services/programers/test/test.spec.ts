import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindDataCenter } from "../../../data_center/bind_data_center";
import { bindLdcShell } from "../../ldc_shell/ldc_shell";
import { bindCallInfoStorer } from "../../log/call_info_storer";
import { bindLdcFileServer } from "../../ldc_file_server/ldc_file_server";
import { bindProgramers } from "../bind_programmer";

describe("xx", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(
      new ContainerModule((bind) => {
        bindLdcShell(bind);
        bindDataCenter(bind);
        bindCallInfoStorer(bind);
        bindLdcFileServer(bind);
        bindProgramers(bind);
      })
    );
  });
  it("xx", () => {
    // testContainer.get<ProgramerInterface>(QueueProgramer).burn();
  });
});
