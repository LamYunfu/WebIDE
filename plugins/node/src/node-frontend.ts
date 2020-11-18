/**
 * Generated using theia-plugin-generator
 */

import * as theia from "@theia/plugin";

namespace IoTCommands {
    const IOT_CATEGORY = "IoT Plugin";
    export const TINYLINK_CONFIG = {
        id: "iot.plugin.tinylink.scence.node",
        category: IOT_CATEGORY,
        label: "TinyLink Config"
    };

}

//先登录tinylink，后登录api.tinylink.cn
namespace IoTWebview {
    export function generateHTML(username: string, passwd: string) {
        return `
             <iframe id="iframe" src="http://120.26.201.44:12352/tinylink_test/view/test_login.php?type=login&username=${username}&pass=${passwd}" frameborder="0" style="display: block; margin: 0px; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
                        `;
    }

}

export function start(context: theia.PluginContext) {
    context.subscriptions.push(
        theia.commands.registerCommand(
            IoTCommands.TINYLINK_CONFIG,
            async (...args: any[]) => {
                const panel = theia.window.createWebviewPanel(
                    "TinyLink",
                    "TinyLink_Node",
                    theia.ViewColumn.Active
                );
                panel.webview.html = IoTWebview.generateHTML(
                    args[0],
                    args[1],
                );
            }
        )
    );
}

export function stop() { }