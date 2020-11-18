import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindLdcFileServer, LdcFileServer } from "../ldc_file_server";
import { bindCallInfoStorer } from "../../log/call_info_storer";
import { bindDataCenter } from "../../../data_center/bind_data_center";
import { bindLdcShell } from "../../ldc_shell/ldc_shell";

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
      })
    );
  });
  it("xx", () => {
    testContainer.get<LdcFileServer>(LdcFileServer).fileUpload("D://abcd");
  });
});
