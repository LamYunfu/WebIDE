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
    // export function generateHTML(url: string="http://linklab.tinylink.cn/java1-1.mp4") {
    export function generateHTML(url: string="http://localhost:3002/static_page/demo.mp4") {
        //         return `
        //         <html>
        //         <iframe id="iframe" src="http://localhost:3002/static_page" frameborder="0" style="display: block; margin: 0px; 
        //         overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;
        //         " sandbox="allow-same-origin allow-scripts allow-forms">
        //         </iframe>
        //              </html>
        // `;

        return `<html>

 <head>
  <link href="http://cdn.staticfile.org/video.js/7.6.0/alt/video-js-cdn.css" rel="stylesheet">

  <!-- If you'd like to support IE8 (for Video.js versions prior to v7) -->
  
</head> 

<body>
  <video id='my-video' class='video-js' controls preload='auto' autoplay="autoplay" style="display: block; margin: 0px;
          overflow: hidden; position: absolute; width: 98%; height: 98%; visibility: visible;
          " 
    data-setup='{"controls": true, "autoplay": true, "preload": "auto"}'>
    <source src="${url}" type="video/mp4">

  </video>
  <script src="http://cdn.staticfile.org/video.js/7.6.0/alt/video.core.js"></script>
  <script src="http://libs.baidu.com/jquery/1.9.0/jquery.js"></script>
  <script type="text/javascript">
    function myDoubleClickHandler(event) {
    // alert("you doublle click")
        $(".vjs-control-bar").toggle()
    };
    videojs(document.querySelector('.video-js'), {
        userActions: {
            doubleClick: myDoubleClickHandler
          },
         playbackRates: [0.5, 1, 1.5, 2],
        // autoplay:'any'
    });
      </script>
</body>

</html>
`


//         return `<html>

//  <head>
//   <link href="http://vjs.zencdn.net/5.0.2/video-js.css" rel="stylesheet">

//   <!-- If you'd like to support IE8 (for Video.js versions prior to v7) -->
  
// </head> 

// <body>
//   <video id='my-video' class='video-js' controls preload='auto' autoplay="autoplay" style="display: block; margin: 0px;
//           overflow: hidden; position: absolute; width: 98%; height: 98%; visibility: visible;
//           " 
//     data-setup='{"controls": true, "autoplay": true, "preload": "auto"}'>
//     <source src="${url}" type="video/mp4">

//   </video>
//   <script src="http://vjs.zencdn.net/5.0.2/video.js"></script>
//   <script src="http://libs.baidu.com/jquery/1.9.0/jquery.js"></script>
//   <script type="text/javascript">
//     function myDoubleClickHandler(event) {
//     // alert("you doublle click")
//         $(".vjs-control-bar").toggle()
//     };
//     videojs(document.querySelector('.video-js'), {
//         userActions: {
//             doubleClick: myDoubleClickHandler
//           },
//          playbackRates: [0.5, 1, 1.5, 2],
//         // autoplay:'any'
//     });
//       </script>
// </body>

// </html>
// `

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
                    "TinyLink",
                    args[1],
                    theia.ViewColumn.Active,
                    {
                        enableScripts: true
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