/*
 * Copyright (C) 2018-present Alibaba Group Holding Limited
 */

import {
  AbstractViewContribution,
  CommonMenus,
  FrontendApplication,
  FrontendApplicationContribution } from '@theia/core/lib/browser';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable } from 'inversify';
import { GettingStartedWidget } from './getting-started-widget';

export const GettingStartedCommand = {
  id: GettingStartedWidget.ID,
  label: GettingStartedWidget.LABEL,
  category: 'View'
};

@injectable()
export class GettingStartedContribution extends AbstractViewContribution<GettingStartedWidget>
  implements FrontendApplicationContribution {

  @inject(FrontendApplicationStateService)
  protected readonly stateService: FrontendApplicationStateService;

  @inject(WorkspaceService)
  protected readonly workspaceService: WorkspaceService;

  constructor() {
    super({
      defaultWidgetOptions: {
        area: 'main',
      },
      widgetId: GettingStartedWidget.ID,
      widgetName: GettingStartedWidget.LABEL,
      toggleCommandId: 'GettingStartPage'
    });
  }

  public async onStart(app: FrontendApplication): Promise<void> {
    if (!this.workspaceService.opened) {
      this.stateService.reachedState('ready').then(
        a => this.openView({ reveal: true })
      );
    }
  }

  public registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(GettingStartedCommand, {
      execute: () => this.openView({ reveal: true }),
    });
  }

  public registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(CommonMenus.VIEW, {
      commandId: GettingStartedCommand.id,
      label: GettingStartedCommand.label,
      order: 'a0'
    });
  }
}
