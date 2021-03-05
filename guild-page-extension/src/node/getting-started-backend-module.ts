import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ContainerModule } from "inversify";
import { GuildBackendServiceSymbol, GuildBackendService, GUILD_BACKEND_PATH, BackendClient } from "../common/protocol";
import { GuildBackendServiceImpl } from "./Guild-backend-service";

export default new ContainerModule(bind => {
    // node/theia-backend-communication-extension-backend-module.ts
    bind(GuildBackendServiceSymbol).to(GuildBackendServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<BackendClient>(GUILD_BACKEND_PATH, () => {
            console.log("后端1");
            const server =  ctx.container.get<GuildBackendService>(GuildBackendServiceSymbol);
            console.log("后端2");
            return server;
        })
    ).inSingletonScope(); 
})


 