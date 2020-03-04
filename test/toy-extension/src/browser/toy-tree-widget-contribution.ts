import { injectable } from "inversify";
import { AbstractViewContribution, FrontendApplicationContribution, FrontendApplication } from "@theia/core/lib/browser";
import { ToyViewWidget } from "./toy-tree-widget";


export const Toy_WIDGET_FACTORY_ID = 'Toy-view'

@injectable()
export class ToyViewContribution extends AbstractViewContribution<ToyViewWidget> implements FrontendApplicationContribution{
    constructor(){
        super({
            widgetId: Toy_WIDGET_FACTORY_ID,
            widgetName: 'Toys',
            defaultWidgetOptions:{
                area:'left',
                rank:500
            },
            toggleCommandId:'UDC Toys'
        })
    }

    async initializeLayout(app: FrontendApplication):Promise<void>{
        await this.openView();
    }
}
