/*
 * Copyright (C) 2018-present Alibaba Group Holding Limited
 */
import { ContainerModule } from 'inversify';
import { GettingStartedContribution } from './getting-started-contribution';
import { BackendClientImpl,GettingStartedWidget } from './getting-started-widget';
import { bindViewContribution, FrontendApplicationContribution, WebSocketConnectionProvider, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';
//import { GuildBackendService, GuildBackendServiceSymbol, GUILD_BACKEND_PATH } from '../common/protocol';
import { WizardBackendServiceSymbol,WizardBackendService, WIZARD_BACKEND_PATH, BackendClient } from '../common/protocol';


export default new ContainerModule(bind => {
    bindViewContribution(bind, GettingStartedContribution);
    bind(FrontendApplicationContribution).toService(GettingStartedContribution);
    bind(GettingStartedWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: GettingStartedWidget.ID,
        createWidget: () => ctx.container.get<GettingStartedWidget>(GettingStartedWidget)
    })).inSingletonScope();
    bind(WizardBackendServiceSymbol).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        const backendClient: BackendClient = ctx.container.get(BackendClient);
        return connection.createProxy<WizardBackendService>(WIZARD_BACKEND_PATH, backendClient);
    }).inSingletonScope();
    bind(BackendClient).to(BackendClientImpl).inSingletonScope();
});