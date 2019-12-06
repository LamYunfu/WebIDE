
/**
 * Generated using theia-plugin-generator
 */
import * as theia from "@theia/plugin";

namespace IoTCommands {
    const IOT_CATEGORY = "IoT Plugin";

    export const TINYLINK_COMPILE = {
        id: "iot.plugin.tinylink.unity",
        category: IOT_CATEGORY,
        label: "TinyLink unity"
    };
}
namespace IoTWebview {
    export function generateHTML(url: string = "") {
        return `
        <html>
          <script type="text/javascript">
          const vscode = acquireVsCodeApi();
          async  function messagePost() {
            p=vscode
            if(p==undefined)
            console.log("p is undefined")
            else
            p.postMessage({
                command: 'openUri',
                text: '🐛  on line ' 
            })
            
         }
         
         window.onload = function () {
             var fr=document.querySelector("iframe")
             fr.addEventListener("message", (ev) => {
                console.log("frame:"+ev.data)
            })
             window.addEventListener("message", (ev) => {
                console.log("frame:"+ev.data)
                vscode.postMessage(ev.data)
            })
         }
          
          </script>        
        <body>
          <iframe id="iframe"
           src="http://47.97.253.23:12359/publish/index.html"
            frameborder="0" 
            style="display: block;
             margin: 0px; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;"
              sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
        </body>
        </html>
                           `;
    }

}
export function start(context: theia.PluginContext) {
    context.subscriptions.push(
        theia.commands.registerCommand(
            IoTCommands.TINYLINK_COMPILE,
            async (...args: any[]) => {
                console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!args is :`)
                console.log(...args)
                const panel = theia.window.createWebviewPanel(
                    "div",
                    "unity",
                    theia.ViewColumn.Active,
                    {
                        enableFindWidget: true,
                        retainContextWhenHidden: true,
                        enableScripts: true
                    }
                );
                panel.webview.onDidReceiveMessage((e) => {
                    console.log("mesg:" + e.command)
                    if (e.command == "openUri") {
                        theia.commands.executeCommand("gotoCode", e.text)
                    }
                })
                panel.webview.html = IoTWebview.generateHTML(
                    args[0]
                );
                panel.webview.postMessage("ok u right")

            }
        )
    );
}

export function stop() { }