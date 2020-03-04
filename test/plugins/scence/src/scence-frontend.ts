/**
 * Generated using theia-plugin-generator
 */

import * as theia from "@theia/plugin";

namespace IoTCommands {
    const IOT_CATEGORY = "IoT Plugin";

    export const TINYLINK_CONFIG = {
        id: "iot.plugin.tinylink.scence.config",
        category: IOT_CATEGORY,
        label: "TinyLink Config"
    };

}

//先登录tinylink，后登录api.tinylink.cn
//name passwd 反了
namespace IoTWebview {
    export function generateHTML(url: string, username: string, passwd: string) {
        return `
        <script src="http://libs.baidu.com/jquery/1.9.0/jquery.js"></script>
        <script>
        window.onload = function () {
            document.getElementById('iframe')
            .contentWindow.postMessage(JSON.stringify({
                name:"${passwd}",
                passwd:"${username}"
       }),"http://tinylink.cn:12352/tinylink/tinylinkApp/login.php")
       }
    </script>
                        <iframe id="iframe" src="http://tinylink.cn:12352/tinylink/tinylinkApp/login.php" frameborder="0" style="display: block; margin: 0px; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
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
                    "TinyLink_Config",
                    theia.ViewColumn.Active
                );
                panel.webview.html = IoTWebview.generateHTML(
                    args[0],
                    args[1],
                    args[2]
                );
            }
        )
    );
}

export function stop() { }