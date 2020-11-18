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

    export const TINYSIM_COMPILE = {
        id: "iot.plugin.tinysim.compile",
        category: IOT_CATEGORY,
        label: "TinySim Compile"
    };

    export const ONELINK_COMPILE = {
        id: "iot.plugin.onelink.compile",
        category: IOT_CATEGORY,
        label: "OneLink Compile"
    };
}

namespace IoTURL {
    export const TINYLINK_LOCAL =
        "https://v.qq.com/";
    export const TINYSIM =
        "http://wx.qq.com/"
    export const ONELINK = 
        "http://linklab.tinylink.cn/webview/onelink"

    export function getQueryParameterString() {
        const parameters = theia.env.getQueryParameters() || {};
        const parametersList = [];
        for (let key in parameters) {
            parametersList.push(`${key}=${parameters[key]}`);
        }
        return parametersList.join("&");
    }
}

namespace IoTWebview {
    export function generateHTML(url: string) {
        return `
                        <script>
                            window.addEventListener("message",function(e){
                                var data = e.data.data
                                var from = e.data.from
                                switch(from){
                                    case 'webide':
                                        document.getElementById('iframe').contentWindow.postMessage({
                                            from: 'webview',
                                            data: data
                                        },'*')
                                        break
                                    case 'iframe':
                                        window.postMessageExt(data)
                                        break
                                }
                            },false)
                        </script>
                        <iframe id="iframe" src="${url}" frameborder="0" style="display: block; margin: 0px; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
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
                    "TinyLink",
                    theia.ViewColumn.Active
                );
                panel.webview.html = IoTWebview.generateHTML(
                    IoTURL.TINYLINK_LOCAL + "?" + IoTURL.getQueryParameterString()
                );
            }
        )
    );

    context.subscriptions.push(
        theia.commands.registerCommand(
            IoTCommands.TINYSIM_COMPILE,
            async (...args: any[]) => {
                const panel = theia.window.createWebviewPanel(
                    "TinySim",
                    "TinySim",
                    theia.ViewColumn.Active,
                    {
                         enableScripts:true,
                    }
                );
                panel.webview.html = IoTWebview.generateHTML(
                    IoTURL.TINYSIM + "?" + IoTURL.getQueryParameterString()
                );
            }
        )
    );

    context.subscriptions.push(
        theia.commands.registerCommand(
            IoTCommands.ONELINK_COMPILE,
            async (...args: any[]) => {
                const panel = theia.window.createWebviewPanel(
                    "OneLink",
                    "OneLink",
                    theia.ViewColumn.Active
                );
                panel.webview.html = IoTWebview.generateHTML(
                    IoTURL.ONELINK + "?" + IoTURL.getQueryParameterString()
                );
            }
        )
    );
}

export function stop() { }