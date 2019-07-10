/**
 * Generated using theia-plugin-generator
 */
import * as theia from "@theia/plugin";

namespace IoTCommands {
    const IOT_CATEGORY = "IoT Plugin";

    export const TINYLINK_COMPILE = {
        id: "iot.plugin.tinylink.compile",
        category: IOT_CATEGORY,
        label: "TinyLink Compile"
    };
}
namespace IoTWebview {
    export function generateHTML(url: string="http://linklab.tinylink.cn/java1-1.mp4") {
        return `
        <html>
        <iframe id="iframe" src="${url}" frameborder="0" style="display: block; margin: 0px; 
        overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;
        " sandbox="allow-same-origin allow-scripts allow-forms">
        </iframe>
             </html>
`;
    }

}
export function start(context: theia.PluginContext) {
    context.subscriptions.push(
        theia.commands.registerCommand(
            IoTCommands.TINYLINK_COMPILE,
            async (...args: any[]) => {
                const panel = theia.window.createWebviewPanel(
                    "TinyLink",
                    "宣讲视屏",
                    theia.ViewColumn.Active,
                    {
                        enableScripts:true
                    }
                );
                panel.webview.html = IoTWebview.generateHTML(
                    args[0]
                );
            }
        )
    );
}

export function stop() { }