import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { DrawboardViewWidget } from './drawboard-view-widget';
import { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser/frontend-application';

export const OUTLINE_WIDGET_FACTORY_ID = 'drawboard-view';

@injectable()
export class DrawboardViewContribution extends AbstractViewContribution<DrawboardViewWidget> implements FrontendApplicationContribution {

    constructor() {
        super({
            widgetId: OUTLINE_WIDGET_FACTORY_ID,
            widgetName: 'Drawboard',
            defaultWidgetOptions: {
                area: 'right',

                rank: 500
            },
            toggleCommandId: 'drawboardView:toggle',
            toggleKeybinding: 'ctrlcmd+b'
        });
    }

    async initializeLayout(app: FrontendApplication): Promise<void> {
        await this.openView();

    }
}
