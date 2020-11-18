
/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';

namespace IoTCommands {
    const IOT_CATEGORY = "IoT Plugin";

    export const TINYLINK_COMPILE_TAO = {
        id: "iot.plugin.tinylink.taoFactory",
        category: IOT_CATEGORY,
        label: "TinyLink taoFactory"
    };
}

namespace IoTWebviewTao {
    //用于界面按钮和Theia通信
    export function generateHTML(url: string = "") {
        //p相当于window
        //postMessage函数
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
                console.log("frame:"+JSON.stringify(ev.data))
                vscode.postMessage(ev.data)
                unityInstance.Quit(function() {
                    console.log("done!");
                });
                unityInstance = null;
            })
         }
          
         function changeFrameHeight(){
             var ifm = document.getElementById("iframe");
             ifm.height = document.documentElement.clientHeight;
         }

         window.onresize = function(){
             changeFrameHeight();
         }
          </script>        
        <body style="margin:0;padding:0;">
          <iframe id="iframe"
           src="http://120.55.102.225:12359/scene/clickjumptao/index.html"        
            frameborder="0" 
            scrolling="no"
            style="display: block;
             margin: 0px; overflow: hidden; position: absolute; width: 100%; height: 80%; visibility: visible;"
              sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
        </body>
        </html>
                           `;
    }

}

export function start(context: theia.PluginContext) {

    // src="http://47.97.253.23:12359/publish/index.html"
    context.subscriptions.push(
        theia.commands.registerCommand(
            IoTCommands.TINYLINK_COMPILE_TAO,
            async (...args: any[]) => {
                console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!args is :`)
                console.log(...args)
                //
                const panel = theia.window.createWebviewPanel(
                    "div",
                    "taoFactory",
                    theia.ViewColumn.Active,
                    {
                        enableFindWidget: true,
                        retainContextWhenHidden: true,
                        enableScripts: true,
                        enableCommandUris: true
                    }
                );
                //theia收到前端的message去执行gotoCode，打开文件,请求的文件信息都在e里面，打开文件以后theia会自动把文件渲染到页面中
                panel.webview.onDidReceiveMessage((e) => {
                    console.log(JSON.stringify(e))
                    console.log("mesg:" + e.command)
                    if (e.command == "openUri") {
                        //e.text是需要打开的文件名
                        console.log(e.text);
                        theia.commands.executeCommand("gotoCode", e.text)
                    }
                })
                //返回字符串，把仿真页面嵌入到webView里面
                panel.webview.html = IoTWebviewTao.generateHTML(
                args[0]
                );
                panel.webview.postMessage("ok u right")

            }
        )
    );

}

export function stop() {

}
