import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ContainerModule } from "inversify";
import { OSdevBackendServiceSymbol, OSdevBackendService, OSDEV_BACKEND_PATH, BackendClient } from "../common/protocol";
import { OSdevBackendServiceImpl } from "./os-dev-backend-service";

export default new ContainerModule(bind => {
    // node/theia-backend-communication-extension-backend-module.ts
    bind(OSdevBackendServiceSymbol).to(OSdevBackendServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<BackendClient>(OSDEV_BACKEND_PATH, client => {
            const server =  ctx.container.get<OSdevBackendService>(OSdevBackendServiceSymbol);
            server.setClient(client);
            client.onDidCloseConnection(() => server.dispose());
            return server;
        })
    ).inSingletonScope(); 
})


 