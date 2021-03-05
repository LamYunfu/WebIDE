/*
 * Copyright (C) 2018-present Alibaba Group Holding Limited
 */

import { bindViewContribution, FrontendApplicationContribution, WebSocketConnectionProvider, WidgetFactory } from '@theia/core/lib/browser';
import { ContainerModule } from 'inversify';
import { GettingStartedContribution } from './getting-started-contribution';
import { GettingStartedWidget } from './getting-started-widget';

import '../../src/browser/style/index.css';
import { GuildBackendService, GuildBackendServiceSymbol, GUILD_BACKEND_PATH } from '../common/protocol';

export default new ContainerModule(bind => {
  bindViewContribution(bind, GettingStartedContribution);
  bind(FrontendApplicationContribution).toService(GettingStartedContribution);
  bind(GettingStartedWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(context => ({
    createWidget: () => context.container.get<GettingStartedWidget>(GettingStartedWidget),
    id: GettingStartedWidget.ID,
  })).inSingletonScope();
  bind(GuildBackendServiceSymbol).toDynamicValue(ctx => {
    console.log(111111111);
    const connection = ctx.container.get(WebSocketConnectionProvider);
    console.log("hello world!!!!!!!");
    let service = connection.createProxy<GuildBackendService>(GUILD_BACKEND_PATH);
    console.log(222222222);
    return service;
  }).inSingletonScope();
});
