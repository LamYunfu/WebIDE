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
import { bindOpener } from "./opener/bind_opener";
import { bindModelTrainer } from "./model_trainer.ts/bind_moder_trainer_service";
import { bindOneLinkService } from "./one_link_service/onelink";
import { bindTinySim } from "./tinysim/tinysim";
import { bindQueryService } from "./query_service/query_service";
import { bindIndicator } from "./indicator/indicator";
import { bindLocalBurn } from "./local_burner_notifier/local_burner_notifier";
import { bindDisplayBoardBackEnd } from "./displayboard/displayboard";
import { bindLocalBurnService } from "./local_burner_notifier/local_burn_service";
import { bindDiffer } from "./diff/diff";
import { bindBehaviorRecorder } from "./behavior_recorder/behavior_recorder";

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
  bindModelTrainer(bind)
  bindOneLinkService(bind)
  bindTinySim(bind)
  bindQueryService(bind)
  bindIndicator(bind)
  bindLocalBurn(bind)
  bindDisplayBoardBackEnd(bind)
  bindLocalBurnService(bind)
  bindDiffer(bind)
  bindBehaviorRecorder(bind)
}
