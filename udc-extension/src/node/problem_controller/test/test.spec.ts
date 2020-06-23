import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindDataCenter } from "../../data_center/bind_data_center";
import { bindServices } from "../../services/bind_service";
import { bindProblemControllers } from "../bind_problem_controller";
describe("xx", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(
      new ContainerModule((bind) => {
        bindDataCenter(bind);
        bindServices(bind);
        bindProblemControllers(bind);
      })
    );
  });
  // it("xx", () => {
  //   testContainer
  //     .get<TinyLinkExperimentController>(TinyLinkExperimentController)

  // });
});
