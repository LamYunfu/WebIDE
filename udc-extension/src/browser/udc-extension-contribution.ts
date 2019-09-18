import { CommandRegistry, InMemoryResources } from '@theia/core';
import { UdcWatcher } from './../common/udc-watcher';
import { AboutDialog } from './about-dailog';
import { UdcService } from '../common/udc-service';
import { injectable, inject } from "inversify";
import { CommandContribution, MenuContribution, MenuModelRegistry, MessageService, MAIN_MENU_BAR, Command } from "@theia/core/lib/common";
import { LanguageGrammarDefinitionContribution, TextmateRegistry } from '@theia/monaco/lib/browser/textmate';
import { WorkspaceService } from "@theia/workspace/lib/browser/"
import { FileDialogService } from "@theia/filesystem/lib/browser"
import { FileSystem } from '@theia/filesystem/lib/common';
import { QuickOpenService, QuickOpenModel, QuickOpenItem, QuickOpenItemOptions, ApplicationShell } from '@theia/core/lib/browser';
import { UdcConsoleSession } from './udc-console-session';
import { DeviceViewService } from './device-view-service';
import URI from "@theia/core/lib/common/uri";
import { EditorManager } from '@theia/editor/lib/browser';

export const UdcExtensionCommand = {
    id: 'UdcExtension.command',
    label: "test node server"
};

export namespace UdcMenus {
    export const UDC = [...MAIN_MENU_BAR, "1_udc"];
    export const UDC_FUNCTION = [...UDC, "2_function"];
    export const UDC_ABOUT = [...UDC, "3_about"];
}

export namespace UdcCommands {
    const UDC_MENU_CATEGORY = "Udc Menu";
    export const OpenCommand: Command = {
        id: "OpenCommand",
        category: UDC_MENU_CATEGORY,
        label: "no label"
    };
    export const Connect: Command = {
        id: "udc.menu.connect",
        category: UDC_MENU_CATEGORY,
        label: "connect"
    }

    export const DisConnect: Command = {
        id: "udc.menu.disconnect",
        category: UDC_MENU_CATEGORY,
        label: "disconnect"
    }

    export const GetDevList: Command = {
        id: "udc.menu.get_devlist",
        category: UDC_MENU_CATEGORY,
        label: "devlist"
    }

    export const Program: Command = {
        id: "udc.menu.program",
        category: UDC_MENU_CATEGORY,
        label: "program"
    }

    export const Reset: Command = {
        id: "udc.menu.reset",
        category: UDC_MENU_CATEGORY,
        label: "reset"
    }
    export const Judge: Command = {
        id: "udc.menu.judge",
        category: UDC_MENU_CATEGORY,
        label: "judge"
    }

    export const ABOUT: Command = {
        id: "udc.menu.about",
        category: UDC_MENU_CATEGORY,
        label: "About"
    }
    export const JudgeButton: Command = {
        id: "udc.menu.judgebutton",
        category: UDC_MENU_CATEGORY,
        label: "judgebutton"
    }
    export const PostSrcFile: Command = {
        id: "udc.menu.postsrcfile",
        category: UDC_MENU_CATEGORY,
        label: "postsrcfile"
    }
    export const QueryStatus: Command = {
        id: "udc.menu.querystatus",
        category: UDC_MENU_CATEGORY,
        label: "querystatus"
    }
    export const SetJudgeHostandPort: Command = {
        id: "udc.menu.setjudgehostandport",
        category: UDC_MENU_CATEGORY,
        label: "setjudgehostandport"
    }
    export const openViewPanel: Command = {
        id: "openViewPanel",
        label: "no label"
    };
}

@injectable()
export class UdcExtensionCommandContribution implements CommandContribution, QuickOpenModel {

    selectDeviceModel = "";

    async onType(lookFor: string, acceptor: (items: QuickOpenItem<QuickOpenItemOptions>[]) => void): Promise<void> {
        let items = await this.udcService.list_models()
        if (!(items.includes(lookFor)) && lookFor != '') {
            items.push(lookFor);
        }
        let opts = items.map(t =>
            new QuickOpenItem({
                label: t,
                description: t,
                run: (mode: any) => {
                    this.selectDeviceModel = t;
                    return true;
                }
            }))
        acceptor(opts);
    }

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
        @inject(UdcService) protected readonly udcService: UdcService,
        @inject(AboutDialog) private readonly aboutDialog: AboutDialog,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(FileDialogService) protected readonly fileDialogService: FileDialogService,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(UdcWatcher) protected readonly udcWatcher: UdcWatcher,
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService,
        @inject(UdcConsoleSession) protected readonly udcConsoleSession: UdcConsoleSession,
        @inject(DeviceViewService) protected readonly deviceViewService: DeviceViewService,
        @inject(EditorManager) protected em: EditorManager,
        @inject(InMemoryResources) protected imr: InMemoryResources,
        @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry,
        @inject(ApplicationShell) protected applicationShell: ApplicationShell,


    ) {
        this.udcWatcher.onConfigLog((data: { name: string, passwd: string }) => {
            let tmp = data
            applicationShell.closeTabs("bottom")
            // applicationShell.closeTabs("left")
            console.log(JSON.stringify(data) + "::::::front ")
            this.commandRegistry.executeCommand("iot.plugin.tinylink.scence.config", "http://tinylink.cn:12352/tinylink/tinylinkApp/login.php", tmp.name, tmp.passwd)
            this.commandRegistry.executeCommand("iot.plugin.tinylink.scence.node", tmp.name, tmp.passwd)
        })
        this.udcWatcher.onDeviceLog((data: string) => {
            // console.log("data is :" + data + "............................")
            let array = data.split(":");
            let log = array.slice(2).join(':').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // console.log(log);
            this.udcConsoleSession.appendLine(log);
        })

        this.udcWatcher.onDeviceList(data => {
            this.deviceViewService.push(data)
        })
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(UdcCommands.ABOUT, {
            execute: () => {
                this.aboutDialog.open();
            }
        })
        registry.registerCommand(UdcCommands.OpenCommand, {
            execute: async (uri: URI) => {
                // this.imr.add(uri,"")
                this.em.open(uri).then(res =>
                    console.log("openscc"), err => console.log(err)
                )
            }
        }
        )

        registry.registerCommand(UdcCommands.Connect, {
            execute: async (loginType: string, model: string, pid: string, timeout: string) => {
                console.log("pid in front end :" + pid)
                let connected = await this.udcService.is_connected();
                if (connected === true) {
                    this.messageService.info('Already Connected');
                } else {
                    this.udcService.connect(loginType, model, pid, timeout).then(async re => {
                        // this.messageService.info(re)
                    }).catch(err => {
                        this.messageService.error(err)
                    })
                }
            }
        })

        registry.registerCommand(UdcCommands.DisConnect, {
            execute: () => {
                this.udcService.disconnect().then(re => {
                    // this.messageService.info(re)
                }).catch(err => {
                    this.messageService.error(err)
                })
            }
        })
        registry.registerCommand(UdcCommands.openViewPanel, {
            execute: async (uri: string, videoName: string) => {
                console.log("<<<<<<<<<<<<<<<<<<<<=video name" + videoName)
                registry.executeCommand("iot.plugin.tinylink.compile", uri, videoName)
            }
        })
        registry.registerCommand(UdcCommands.JudgeButton, {
            execute: () => {
                this.udcService.disconnect().then(re => {
                    this.messageService.info(re)
                }).catch(err => {
                    this.messageService.error(err)
                })
            }
        })
        // registry.registerCommand(UdcCommands.QueryStatus, {
        //     execute: (x: string) => {
        //         this.udcService.queryStatus(x).then((out) => console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" + out))
        //         .catch(err => {
        //             this.messageService.error(err)
        //         })
        //     }
        // })

        registry.registerCommand(UdcCommands.GetDevList, {
            execute: () => {
                this.udcService.get_devices().then(re => {
                    for (let k in re) {
                        this.messageService.info(k + " use=" + re[k]);
                    }
                })
            }
        })
        registry.registerCommand(UdcCommands.Reset, {
            execute: async () => {
                let dev_list = await this.udcService.get_devices();
                let devstr = "";
                for (let k in dev_list) {
                    devstr = k;
                    break;
                }
                this.udcService.control(devstr, 'reset').then(re => {
                    let result = (re === true ? 'reset succeed' : 'reset failed')
                    this.messageService.info(result)
                }).catch(err => {
                    this.messageService.error(err)
                })
            }
        })
    }
}



@injectable()
export class UdcExtensionMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
    }
}



@injectable()
export class UdcExtensionHighlightContribution implements LanguageGrammarDefinitionContribution {
    readonly id = 'cpp';
    readonly scopeName = 'source.cpp';
    readonly config: monaco.languages.LanguageConfiguration = {
        comments: {
            lineComment: '//',
            blockComment: ['/*', '*/'],
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '[', close: ']' },
            { open: '{', close: '}' },
            { open: '(', close: ')' },
            { open: '\'', close: '\'', notIn: ['string', 'comment'] },
            { open: '"', close: '"', notIn: ['string'] },
            { open: '/*', close: ' */', notIn: ['string'] }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' },
        ],
        folding: {
            markers: {
                start: new RegExp('^\\s*#pragma\\s+region\\b'),
                end: new RegExp('^\\s*#pragma\\s+endregion\\b')
            }
        }
    };



    registerTextmateLanguage(registry: TextmateRegistry) {
        monaco.languages.register({
            id: this.id,
            extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx', '.h', '.ino', '.inl', '.ipp', 'cl', '.c'],
            aliases: ['C++', 'Cpp', 'cpp', 'c'],
        });
        monaco.languages.setLanguageConfiguration(this.id, this.config);
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: require('../../data/cpp.tmLanguage.json'),
                }
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}
