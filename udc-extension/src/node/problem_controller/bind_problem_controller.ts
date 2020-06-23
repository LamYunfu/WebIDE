import { ProblemController } from './problem_controller';
import { interfaces } from "inversify";
import { ExperimentController } from "./experiment_controller/experiment_controller";
export function bindProblemControllers(bind: interfaces.Bind) {
  bind(ExperimentController)
    .toSelf()
    .inSingletonScope();
  bind(ProblemController).toSelf().inSingletonScope()
}
