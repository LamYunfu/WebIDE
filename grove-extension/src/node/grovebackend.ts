import{ ContainerModule} from "inversify"
import { GroveService } from "../common/groveservice"
import {GroveServiceImpl } from "./groveserviceimpl"
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core"
import { createCommonBind ,Client, GroveProxyObject, SERVICE_PATH} from "../common/groveproxy"
export default new ContainerModule(bind=>{
    bind(GroveService).toService(GroveServiceImpl)
    bind(Client).toDynamicValue((ctx)=>{
        ctx.container.get<GroveProxyObject>(GroveProxyObject).getClient()        
    })
    bind(GroveServiceImpl).toSelf().inSingletonScope()
    createCommonBind(bind)
    bind(ConnectionHandler).toDynamicValue(ctx=>{
       const handler=new JsonRpcConnectionHandler<Client>(SERVICE_PATH,client=>{
           const service =ctx.container.get<GroveService>(GroveService)
           service.setClient(client)
           return service
       })    
         return handler
    })
})