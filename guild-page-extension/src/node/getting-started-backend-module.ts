
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ContainerModule } from "inversify";
import { WizardBackendServiceSymbol, WizardBackendService, WIZARD_BACKEND_PATH, BackendClient } from "../common/protocol";
import { WizardBackendServiceImpl } from "./guild-backend-service";

export default new ContainerModule(bind => {
    // node/theia-backend-communication-extension-backend-module.ts
    bind(WizardBackendServiceSymbol).to(WizardBackendServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<BackendClient>(WIZARD_BACKEND_PATH, client => {
            console.log("create guild backend service!!!!!!!!!!!");
            const server =  ctx.container.get<WizardBackendService>(WizardBackendServiceSymbol);
            server.setClient(client);
            client.onDidCloseConnection(() => server.dispose());
            return server;
        })
    ).inSingletonScope(); 
})