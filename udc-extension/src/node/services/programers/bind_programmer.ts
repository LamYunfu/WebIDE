import { interfaces } from "inversify";
import { QueueProgramer } from "./queue_programer";
import { AdhocProgramer } from "./adhoc_progamer";
import { ProgramerInterface } from "./interfaces/programer_interface";
export function bindProgramers(bind: interfaces.Bind) {
  bind(QueueProgramer)
    .toSelf()
    .inSingletonScope();
  bind(AdhocProgramer)
    .toSelf()
    .inSingletonScope();
  bind(ProgramerInterface)
    .to(QueueProgramer)
    .whenTargetNamed("queue");
  bind(ProgramerInterface)
    .to(QueueProgramer)
    .whenTargetNamed("adhoc");
}
