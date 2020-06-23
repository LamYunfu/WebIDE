import { MultiProjectData } from './multi_project_data';
import { interfaces } from "inversify";
import { LdcData } from "./ldc_data";
import { UserInfo } from "./user_info";
import { ProgramBurnDataFactory } from "./program_data";
import { ProjectData } from "./project_data";
export function bindDataCenter(bind: interfaces.Bind) {
  bind(LdcData)
    .toSelf()
    .inSingletonScope();
  bind(UserInfo)
    .toSelf()
    .inSingletonScope();
  bind(ProgramBurnDataFactory)
    .toSelf()
    .inSingletonScope();
  bind(ProjectData)
    .toSelf()
    .inSingletonScope();
  bind(MultiProjectData).toSelf().inSingletonScope()
}
