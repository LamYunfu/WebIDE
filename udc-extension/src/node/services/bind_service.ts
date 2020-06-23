import { interfaces } from "inversify";
import { bindLdcShell } from "./ldc_shell/ldc_shell";
import { bindCallInfoStorer } from "./log/call_info_storer";
import { bindLdcClientController } from "./ldc/bind_ldc";
import { bindCompilers } from "./compiler/bind_compiler";
import { bindFileTemplate } from "./file_template/file_template";
import { bindLdcFileServer } from "./ldc_file_server/ldc_file_server";
import { bindProgramers } from "./programers/bind_programmer";
import { bindTools } from "./tools/bind_tools";
import { bindDataService } from "./data_service/bind_data_service";
import { bindProblemControllers } from "../problem_controller/bind_problem_controller";
import { bindOpener } from "./opener/bind_opener";

export function bindServices(bind: interfaces.Bind) {
  bindLdcShell(bind);
  bindCompilers(bind);
  bindTools(bind);
  bindFileTemplate(bind);
  bindCallInfoStorer(bind);
  bindLdcFileServer(bind);
  bindProgramers(bind);
  bindLdcClientController(bind);
  bindDataService(bind)
  bindOpener(bind)
}
