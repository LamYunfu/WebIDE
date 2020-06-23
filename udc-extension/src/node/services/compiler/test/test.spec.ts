import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { DistributedCompiler } from "../ds_compiler";
import { bindDataCenter } from "../../../data_center/bind_data_center";
import { bindServices } from "../../bind_service";

describe("xx", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(
      new ContainerModule((bind) => {
        bindDataCenter(bind);
        bindServices(bind);
      })
    );
  });
  it("xx", () => {
    testContainer
      .get<DistributedCompiler>(DistributedCompiler)
      .compile("d://abcd", "hexFiles", "abc", "abc");
  });
});
