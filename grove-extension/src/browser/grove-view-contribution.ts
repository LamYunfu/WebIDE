import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { GroveViewWidget } from './grove-view-widget';
import { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser/frontend-application';

export const OUTLINE_WIDGET_FACTORY_ID = 'grove-view';

@injectable()
export class GroveViewContribution extends AbstractViewContribution<GroveViewWidget> implements FrontendApplicationContribution {

    constructor() {
        super({
            widgetId: OUTLINE_WIDGET_FACTORY_ID,
            widgetName: 'Grove View',
            defaultWidgetOptions: {
                area: 'left',
                rank: 300
            },
            toggleCommandId: 'groveView:toggle',
            toggleKeybinding: 'ctrlcmd+b'
        });
    }

    async initializeLayout(app: FrontendApplication): Promise<void> {
        await this.openView();

    }
}
