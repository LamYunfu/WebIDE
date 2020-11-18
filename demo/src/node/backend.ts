
import { ContainerModule } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import {Client, ClientObject} from "../common/test"
import { DemoService } from '../common/demo-service';
import { ServiceImpl } from './demo-service-impl';

export default new ContainerModule(bind => {
    bind(DemoService).to(ServiceImpl).inSingletonScope()
    bind(ServiceImpl).toSelf().inSingletonScope()
    bind(ClientObject).toSelf().inSingletonScope()
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<Client>("/services/somthing", client => {
            const loggerServer = ctx.container.get<DemoService>(DemoService);
            loggerServer.setClient(client)
            return loggerServer;
        })
    ).inSingletonScope()
});