import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindServices } from "../../services/bind_service";
import { bindDataCenter } from "../../data_center/bind_data_center";
import { bindProblemControllers } from "../bind_problem_controller";
import { NoTinyLinkExperimentController } from "../experiment_controller/experiment_controller";

const testContainer = new Container();
testContainer.load(
  new ContainerModule((bind) => {
    bindDataCenter(bind);
    bindServices(bind);
    bindProblemControllers(bind);
  })
);

// testContainer
//   .get<NoTinyLinkExperimentController>(NoTinyLinkExperimentController)
//   .submit();
// b04f3ee8f5e43fa3b162981b50bb72fe1acabb33
// let p = {
//   type: "QUEUE",
//   pid: "20",
//   groupId: "8173329884532098",
//   program: [
//     {
//       filehash: "3597278029a89e9113fd4d488de0e9cefed6ca17",
//       waitingId: "3762631003213497",
//       model: "alios_esp32",
//       runtime: 30,
//       address: "0x10000",
//     },
//   ],
// };
