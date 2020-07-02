import { ProblemController } from './problem_controller';
import { interfaces } from "inversify";
import { ExperimentController } from "./experiment_controller/experiment_controller";
import { TrainExperimentController } from './train_experiment_controller/train_experiment_controller';
import { bindOneLinkController } from './one_link_controller/one_link_controller';
export function bindProblemControllers(bind: interfaces.Bind) {
  bind(ExperimentController)
    .toSelf()
    .inSingletonScope();
  bind(ProblemController).toSelf().inSingletonScope()
  bind(TrainExperimentController).toSelf().inSingletonScope()
  bindOneLinkController(bind)
}
