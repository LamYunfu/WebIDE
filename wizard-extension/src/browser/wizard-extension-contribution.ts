import {  injectable } from 'inversify';
import { MenuModelRegistry } from '@theia/core';
import { WizardExtensionWidget } from './wizard-extension-widget';
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { Command, CommandRegistry } from '@theia/core/lib/common/command';
//import {UdcMenus} from '../../../udc-extension/lib/browser/udc-extension-contribution';
export const WizardExtensionCommand: Command = { 
    id: 'wizard-extension:command',
    label: "New Project"
};

@injectable()
export class WizardExtensionContribution extends AbstractViewContribution<WizardExtensionWidget> {

    /**
     * `AbstractViewContribution` handles the creation and registering
     *  of the widget including commands, menus, and keybindings.
     * 
     * We can pass `defaultWidgetOptions` which define widget properties such as 
     * its location `area` (`main`, `left`, `right`, `bottom`), `mode`, and `ref`.
     * 
     */
    constructor() {
        super({
            widgetId: WizardExtensionWidget.ID,
            widgetName: WizardExtensionWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: WizardExtensionCommand.id
        });
    }

    /**
     * Example command registration to open the widget from the menu, and quick-open.
     * For a simpler use case, it is possible to simply call:
     ```ts
        super.registerCommands(commands)
     ```
     *
     * For more flexibility, we can pass `OpenViewArguments` which define 
     * options on how to handle opening the widget:
     * 
     ```ts
        toggle?: boolean
        activate?: boolean;
        reveal?: boolean;
     ```
     *
     * @param commands
     */
    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(WizardExtensionCommand, {
            execute: () => super.openView({ activate: false, reveal: true })
        });
    }

    /**
     * Example menu registration to contribute a menu item used to open the widget.
     * Default location when extending the `AbstractViewContribution` is the `View` main-menu item.
     * 
     * We can however define new menu path locations in the following way:
     ```ts
        menus.registerMenuAction(CommonMenus.HELP, {
            commandId: 'id',
            label: 'label'
        });
     ```
     * 
     * @param menus
     */
    registerMenus(menus: MenuModelRegistry): void {
        // menus.registerMenuAction(CommonMenus.FILE_NEW, {
        //     commandId: WizardExtensionCommand.id,
        //     label: WizardExtensionCommand.label
        // });
    }
}