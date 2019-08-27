import { injectable, inject } from "inversify";
import { AbstractViewContribution, FrontendApplicationContribution, FrontendApplication, ApplicationShell } from "@theia/core/lib/browser";
import { DeviceViewWidget } from "./device-view-widget";
import { FrontendApplicationStateService } from "@theia/core/lib/browser/frontend-application-state";
import { CommandRegistry } from "@theia/core";
// import { UdcConsoleContribution } from "./udc-console-contribution";
// import { MaybePromise } from "@theia/core";
export const DEVICE_WIDGET_FACTORY_ID = 'device-view'


@injectable()
export class DeviceViewContribution extends AbstractViewContribution<DeviceViewWidget> implements FrontendApplicationContribution {
    constructor(@inject(ApplicationShell) protected applicationShell: ApplicationShell,
        @inject(FrontendApplicationStateService) protected applicationState: FrontendApplicationStateService,
        @inject(CommandRegistry)  protected registry: CommandRegistry



    ) {
        super({
            widgetId: DEVICE_WIDGET_FACTORY_ID,
            widgetName: 'Online IOT Study System',
            defaultWidgetOptions: {
                area: 'left',
                rank: 574
            },
            toggleCommandId: 'UDC devices'
        })
    }
    async onStart(app: FrontendApplication) {
        this.applicationState.onStateChanged(async (e) => {
            if (e == 'initialized_layout') {
                console.log(" close tabs")
                await this.applicationShell.closeTabs("main")
                await this.applicationShell.closeTabs("bottom")
                await this.applicationShell.closeTabs("right")
                this.registry.executeCommand("udc:shell:toggle")
            }
            // if (e == 'ready') {
            //     await this.applicationShell.revealWidget(DEVICE_WIDGET_FACTORY_ID)
            //     await this.applicationShell.revealWidget("udc-shell")
             
            // }
            // if (e == 'closing_window') {
            //     console.log("save")
            //     await this.applicationShell.saveAll()
            // }

        })

        // await this.shell.collapsePanel("main")
    }

    async initializeLayout(app: FrontendApplication): Promise<void> {
        await this.openView();
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx close tabs")
        await this.applicationShell.collapsePanel("bottom")
        await this.applicationShell.collapsePanel("right")
        await this.applicationShell.save()
        // await this.shell.collapsePanel("main")

    }
}
