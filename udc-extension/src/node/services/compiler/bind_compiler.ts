import { bindTinyLinkCompiler } from "./tiny_link_compiler";
import { bindDistributedCompiler } from "./ds_compiler";
import { interfaces } from "inversify";
export function bindCompilers(bind: interfaces.Bind) {
  bindTinyLinkCompiler(bind);
  bindDistributedCompiler(bind);
}
