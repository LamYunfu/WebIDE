import { ContainerModule} from 'inversify';
import { BackendClientImpl, WizardExtensionWidget } from './wizard-extension-widget';
import { WizardExtensionContribution } from './wizard-extension-contribution';
import { bindViewContribution, FrontendApplicationContribution, WebSocketConnectionProvider, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';
import { WizardBackendServiceSymbol,WizardBackendService, WIZARD_BACKEND_PATH, BackendClient } from '../common/protocol';

export default new ContainerModule(bind => {
    bindViewContribution(bind, WizardExtensionContribution);
    bind(FrontendApplicationContribution).toService(WizardExtensionContribution);
    bind(WizardExtensionWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: WizardExtensionWidget.ID,
        createWidget: () => ctx.container.get<WizardExtensionWidget>(WizardExtensionWidget)
    })).inSingletonScope();
    bind(WizardBackendServiceSymbol).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        const backendClient: BackendClient = ctx.container.get(BackendClient);
        return connection.createProxy<WizardBackendService>(WIZARD_BACKEND_PATH, backendClient);
    }).inSingletonScope();
    bind(BackendClient).to(BackendClientImpl).inSingletonScope();
});

