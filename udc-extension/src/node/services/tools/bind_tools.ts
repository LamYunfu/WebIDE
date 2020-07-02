import { EventDefinition } from './event_definition';
import { interfaces } from "inversify";
import { EventCenter } from "./event_center";
import { FileCompressor } from "./file_compressor";
export function bindTools(bind: interfaces.Bind) {
  bind(EventCenter)
    .toSelf()
    .inSingletonScope();
  bind(FileCompressor)
    .toSelf()
    .inSingletonScope();
  bind(EventDefinition).toSelf().inSingletonScope()
}
