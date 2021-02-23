/*
 * Copyright (C) 2018-present Alibaba Group Holding Limited
 */

import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { ContainerModule } from 'inversify';
import { GettingStartedContribution } from './getting-started-contribution';
import { GettingStartedWidget } from './getting-started-widget';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
  bindViewContribution(bind, GettingStartedContribution);
  bind(FrontendApplicationContribution).toService(GettingStartedContribution);
  bind(GettingStartedWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(context => ({
    createWidget: () => context.container.get<GettingStartedWidget>(GettingStartedWidget),
    id: GettingStartedWidget.ID,
  })).inSingletonScope();
});
