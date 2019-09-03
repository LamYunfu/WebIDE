import { EditorManager } from '@theia/editor/lib/browser';
import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry } from "@theia/core/lib/common";
import {
    QuickOpenService
} from "@theia/core/lib/browser";
import { FileDialogService } from "@theia/filesystem/lib/browser"
import { FileSystem } from "@theia/filesystem/lib/common";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { Command } from "@theia/core"
export namespace UdcCommands {
    export const OpenCommand: Command = {
        id: "OpenCommand",
        label: "no label"
    };
    export const openViewPanel: Command = {
        id: "openViewPanel",
        label: "no label"
    };

}
@injectable()

export class HelloWorldExtensionCommandContribution implements CommandContribution {
    constructor(
        @inject(FileDialogService) protected readonly fileDialogService: FileDialogService,
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        // @inject(DefaultOpenerService) protected dos:DefaultOpenerService
        @inject(EditorManager) protected em: EditorManager
    ) { }
    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(UdcCommands.OpenCommand, {
            execute: async (uri: URI) => {
                this.em.open(uri).then(res =>
                    console.log("openscc"), err => console.log(err)
                )
            }
        }
        )
        registry.registerCommand(UdcCommands.openViewPanel, {
            execute: async () => {
                registry.executeCommand("iot.plugin.tinylink.compile")
            }
        }


        )

    }

}