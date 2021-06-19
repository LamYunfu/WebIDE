import { bindTinyLinkCompiler } from "./tiny_link_compiler";
import { bindDistributedCompiler } from "./ds_compiler";
import { interfaces } from "inversify";
import { bindResearchNotifier } from "./research_notifier";
export function bindCompilers(bind: interfaces.Bind) {
  bindTinyLinkCompiler(bind);
  bindDistributedCompiler(bind);
  bindResearchNotifier(bind);
}
