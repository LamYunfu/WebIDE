import { ContainerModule} from 'inversify';
import { BackendClientImpl, OSdevExtensionWidget } from './os-dev-extension-widget';
import { OSdevExtensionContribution } from './os-dev-extension-contribution';
import { bindViewContribution, FrontendApplicationContribution, OpenHandler, WebSocketConnectionProvider, WidgetFactory } from '@theia/core/lib/browser';
import { CustomEditorManager } from './new-editor-manager';
import { EditorManager} from '@theia/editor/lib/browser/editor-manager';
import '../../src/browser/style/index.css';
import { OSdevBackendServiceSymbol,OSdevBackendService, OSDEV_BACKEND_PATH, BackendClient } from '../common/protocol';

export default new ContainerModule((bind, _unbind, _isBound, rebind) => {
    bindViewContribution(bind, OSdevExtensionContribution);
    bind(FrontendApplicationContribution).toService(OSdevExtensionContribution);
    bind(OSdevExtensionWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: OSdevExtensionWidget.ID,
        createWidget: () => ctx.container.get<OSdevExtensionWidget>(OSdevExtensionWidget)
    })).inSingletonScope();
    bind(OSdevBackendServiceSymbol).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        const backendClient: BackendClient = ctx.container.get(BackendClient);
        return connection.createProxy<OSdevBackendService>(OSDEV_BACKEND_PATH, backendClient);
    }).inSingletonScope();
    bind(BackendClient).to(BackendClientImpl).inSingletonScope();
     // Bind CustomEditorManager.
     bind(CustomEditorManager).toSelf().inSingletonScope();
     bind(OpenHandler).toService(CustomEditorManager);
 
     // Rebind existing EditorManager to CustomEditorManager.
     rebind(EditorManager).to(CustomEditorManager).inSingletonScope();
});

