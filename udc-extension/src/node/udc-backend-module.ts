import { NewContikiCompiler } from "./compilers/contiki-complier";
import { ConfigSetter } from "./util/configsetter";
import { Programer } from "./util/programmer";
import { Extractor } from "./util/extractor";
import { FileMapper } from "./util/filemapper";
import { Logger } from "./util/logger";
import { Controller } from "./util/controller";
import { UdcCompiler } from "./compilers/udc-compiler";
import { AliosCompiler } from "./compilers/alios-compiler";
import { UdcTerminal } from "./util/udc-terminal";
import { Packet } from "./util/packet";
import { udcServicePath } from "./../common/udc-service";
import { ContainerModule } from "inversify";
import { UdcService } from "../common/udc-service";
import { UdcServiceImpl } from "./udc-service-impl";
import {
  ConnectionHandler,
  JsonRpcConnectionHandler,
} from "@theia/core/lib/common";
import { createCommonBindings } from "../common/udc-common-module";
import { UdcClient } from "../common/udc-watcher";
import { Compiler } from "./compilers/compiler";
import { NewAliosCompiler } from "./compilers/new-alios-compiler";
import { LinkEdgeManager } from "./util/linkedgemanger";
import { OnelinkService } from "./util/onelink";
import { RaspeberryGccCompiler } from "./compilers/raspberry-gcc-compiler";
import { RootDirPath } from "../setting/backend-config";
import { DistributedCompiler } from "./compilers/distributedcompiler";
import { CallInfoStorer } from "./util/callinfostorer";
import { BoardAndCompileType } from "./compilers/boardtocompilemethod";
import { bindServices } from "./services/bind_service";
import { bindDataCenter } from "./data_center/bind_data_center";
import { bindProblemControllers } from "./problem_controller/bind_problem_controller";

export default new ContainerModule((bind) => {
  bind(UdcService).to(UdcServiceImpl).inSingletonScope();
  bind(ConnectionHandler)
    .toDynamicValue(
      (ctx) =>
        new JsonRpcConnectionHandler<UdcClient>(udcServicePath, (client) => {
          const udcServer = ctx.container.get<UdcServiceImpl>(UdcService);
          udcServer.setClient(client);
          return udcServer;
        })
    )
    .inSingletonScope();
  createCommonBindings(bind);
  // bind(Packet).toSelf().inSingletonScope();
  bind(UdcTerminal).toSelf().inSingletonScope();
  bind(UdcCompiler).toSelf().inSingletonScope();
  bind(AliosCompiler).toSelf().inSingletonScope();
  bind(NewAliosCompiler).toSelf().inSingletonScope();
  bind(Compiler).toSelf().inSingletonScope();
  bind(Controller).toSelf().inSingletonScope();
  bind(FileMapper).toSelf().inSingletonScope();
  bind(Logger).toSelf().inSingletonScope();
  bind(Extractor).toSelf().inSingletonScope();
  bind(Programer).toSelf().inSingletonScope();
  bind(ConfigSetter).toSelf().inSingletonScope();
  bind(NewContikiCompiler).toSelf().inSingletonScope();
  bind(LinkEdgeManager).toSelf().inSingletonScope();
  bind(OnelinkService).toSelf().inSingletonScope();
  bind(RaspeberryGccCompiler).toSelf().inSingletonScope();
  bind(RootDirPath).toSelf().inSingletonScope();
  bind(DistributedCompiler).toSelf().inSingletonScope()
  // bind(Controller).toSelf().inSingletonScope();
  bind(CallInfoStorer).toSelf().inSingletonScope()
  bind(BoardAndCompileType).toSelf().inSingletonScope()
  bindServices(bind)
  bindDataCenter(bind)
  bindProblemControllers(bind)

});
