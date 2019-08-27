import { ConfigSetter } from './util/configsetter';
import { Programer } from './util/programmer';
import { Extractor } from './util/extractor';
import { FileMapper } from './util/filemapper';
import { Logger } from './util/logger';
import { Controller } from './util/controller';
import { UdcCompiler } from './compilers/udc-compiler';
import { AliosCompiler } from './compilers/alios-compiler';
import { UdcTerminal } from './util/udc-terminal';
import { Packet } from './util/packet';
import { udcServicePath } from './../common/udc-service';
import { ContainerModule } from "inversify";
import { UdcService } from "../common/udc-service";
import { UdcServiceImpl } from "./udc-service-impl";
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core/lib/common";
import { createCommonBindings } from '../common/udc-common-module';
import { UdcClient } from '../common/udc-watcher';
import { Compiler } from "./compilers/compiler"


export default new ContainerModule(bind => {

    bind(UdcService).to(UdcServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<UdcClient>(udcServicePath, client => {
            const udcServer = ctx.container.get<UdcServiceImpl>(UdcService);
            udcServer.setClient(client);
            return udcServer;
        })
    ).inSingletonScope();
    createCommonBindings(bind);
    bind(Packet).toSelf().inSingletonScope();
    bind(UdcTerminal).toSelf().inSingletonScope();
    bind(UdcCompiler).toSelf().inSingletonScope();
    bind(AliosCompiler).toSelf().inSingletonScope();
    bind(Compiler).toSelf().inSingletonScope();
    bind(Controller).toSelf().inSingletonScope();
    bind(FileMapper).toSelf().inSingletonScope();
    bind(Logger).toSelf().inSingletonScope();
    bind(Extractor).toSelf().inSingletonScope();
    bind(Programer).toSelf().inSingletonScope();
    bind(ConfigSetter).toSelf().inSingletonScope();
    // bind(Controller).toSelf().inSingletonScope();
});
