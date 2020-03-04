
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
             var btn = document.getElementById("postbtn");
             btn.onclick = function () {
                 messagePost()
             }
             window.addEventListener("message", (ev) => {
                console.log("frame:"+ev.data)
            })
         }
          
          </script>        
        <body>
          <div> script has been loaded</div>
          <button id="postbtn">click to go to abc.c</button>
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
                    if(e.command=="openUri"){
                        theia.commands.executeCommand("OpenCommand",``)
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