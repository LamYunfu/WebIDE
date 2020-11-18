import { bindServerConnectionController } from "./server_connection";
import { bindControllerConnection } from "./controller_connection";
import { HalfPackProcess } from "./half-pkt-process";
import { Packet } from "./packet";
import { LdcClientController } from "./ldc_client_controller";
import { LdcClientControllerInterface } from "./interfaces/ldc_client_controller_interface";
import { interfaces } from "inversify";

export function bindLdcClientController(bind: interfaces.Bind): void {
  bindServerConnectionController(bind);
  bindControllerConnection(bind);
  bind(HalfPackProcess)
    .toSelf()
    .inSingletonScope();
  bind(Packet)
    .toSelf()
    .inSingletonScope();
  bind(LdcClientController)
    .toSelf()
    .inSingletonScope();
  bind(LdcClientControllerInterface)
    .to(LdcClientController)
    .inSingletonScope();
}
