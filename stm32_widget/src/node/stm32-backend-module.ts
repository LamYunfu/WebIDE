
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ContainerModule } from "inversify";
import { STM32BackendServiceSymbol, STM32BackendService, STM32_BACKEND_PATH, BackendClient } from "../common/protocol";
import { STM32BackendServiceImpl } from "./stm32-backend-service";

export default new ContainerModule(bind => {
    // node/theia-backend-communication-extension-backend-module.ts
    bind(STM32BackendServiceSymbol).to(STM32BackendServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<BackendClient>(STM32_BACKEND_PATH, client => {
            console.log("create stm32 backend service!!!!!!!!!!!");
            const server =  ctx.container.get<STM32BackendService>(STM32BackendServiceSymbol);
            server.setClient(client);
            client.onDidCloseConnection(() => server.dispose());
            return server;
        })
    ).inSingletonScope(); 
})