import{injectable,inject} from 'inversify'
import { AbstractViewContribution, FrontendApplication} from "@theia/core/lib/browser";
import { DemoWidget } from './demo-widget';
import { DemoService } from '../common/demo-service';
import { DemoViewService } from './demo-widget-sservice';
import { ClientObject } from '../common/test';
@injectable()
export class DemoContribution extends AbstractViewContribution <DemoWidget>{
    constructor(
        @inject(DemoService) protected readonly ds:DemoService,
        @inject(DemoViewService)  protected readonly dvs:DemoViewService,
        @inject(ClientObject)  protected readonly co: ClientObject
    ){
        super({
            widgetId: "demo-view",
            widgetName: 'De2mo-view',
            defaultWidgetOptions: {
                area: 'left',
                rank: 574
                // rank: 1380
            },
            toggleCommandId: 'something'
        })
      this.co.register((somthing )=>{
          console.log("get")
         this.dvs.say(somthing)
      })
    }
    onStart?(app: FrontendApplication){
        
    }
   
}