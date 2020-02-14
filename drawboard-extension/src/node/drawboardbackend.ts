import{ ContainerModule} from "inversify"
import { DrawboardService } from "../common/drawboardservice"
import { DrawboardServiceImpl } from "./drawboardserviceimpl"
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core"
import { createCommonBind ,Client, ProxyObject, SERVICE_PATH} from "../common/drawboardproxy"
export default new ContainerModule(bind=>{
    bind(DrawboardService).toService(DrawboardServiceImpl)
    bind(Client).toDynamicValue((ctx)=>{
        ctx.container.get<ProxyObject>(ProxyObject).getClient()        
    })
    bind(DrawboardServiceImpl).toSelf().inSingletonScope()
    createCommonBind(bind)
    bind(ConnectionHandler).toDynamicValue(ctx=>{
       const handler=new JsonRpcConnectionHandler<Client>(SERVICE_PATH,client=>{
           const service =ctx.container.get<DrawboardService>(DrawboardService)
           service.setClient(client)
           return service
       })    
         return handler
    })
})