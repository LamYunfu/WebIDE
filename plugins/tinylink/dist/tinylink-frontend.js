var theia_tinylink=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))(function(o,i){function l(e){try{a(r.next(e))}catch(e){i(e)}}function u(e){try{a(r.throw(e))}catch(e){i(e)}}function a(e){e.done?o(e.value):new n(function(t){t(e.value)}).then(l,u)}a((r=r.apply(e,t||[])).next())})},o=this&&this.__generator||function(e,t){var n,r,o,i,l={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;l;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return l.label++,{value:i[1],done:!1};case 5:l.label++,r=i[1],i=[0];continue;case 7:i=l.ops.pop(),l.trys.pop();continue;default:if(!(o=(o=l.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){l=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){l.label=i[1];break}if(6===i[0]&&l.label<o[1]){l.label=o[1],o=i;break}if(o&&l.label<o[2]){l.label=o[2],l.ops.push(i);break}o[2]&&l.ops.pop(),l.trys.pop();continue}i=t.call(e,l)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}},i=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),l=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)l.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return l},l=this&&this.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(i(arguments[t]));return e};Object.defineProperty(t,"__esModule",{value:!0});var u,a,c=n(1);!function(e){e.TINYLINK_COMPILE={id:"iot.plugin.tinylink.compile",category:"IoT Plugin",label:"TinyLink Compile"}}(u||(u={})),function(e){e.generateHTML=function(e){return void 0===e&&(e="http://localhost:3002/static_page/demo.mp4"),'<html>\n\n <head>\n  <link href="http://vjs.zencdn.net/5.0.2/video-js.css" rel="stylesheet">\n\n  \x3c!-- If you\'d like to support IE8 (for Video.js versions prior to v7) --\x3e\n  \n</head> \n\n<body>\n  <video id=\'my-video\' class=\'video-js\' controls preload=\'auto\' autoplay="autoplay" style="display: block; margin: 0px;\n          overflow: hidden; position: absolute; width: 98%; height: 98%; visibility: visible;\n          " \n    data-setup=\'{"controls": true, "autoplay": true, "preload": "auto"}\'>\n    <source src="'+e+'" type="video/mp4">\n\n  </video>\n  <script src="http://vjs.zencdn.net/5.0.2/video.js"><\/script>\n  <script src="http://libs.baidu.com/jquery/1.9.0/jquery.js"><\/script>\n  <script type="text/javascript">\n    function myDoubleClickHandler(event) {\n    // alert("you doublle click")\n        $(".vjs-control-bar").toggle()\n    };\n    videojs(document.querySelector(\'.video-js\'), {\n        userActions: {\n            doubleClick: myDoubleClickHandler\n          },\n         playbackRates: [0.5, 1, 1.5, 2],\n        // autoplay:\'any\'\n    });\n      <\/script>\n</body>\n\n</html>\n'}}(a||(a={})),t.start=function(e){var t=this;e.subscriptions.push(c.commands.registerCommand(u.TINYLINK_COMPILE,function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];return r(t,void 0,void 0,function(){return o(this,function(t){return console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!args is :"),console.log.apply(console,l(e)),c.window.createWebviewPanel("TinyLink",e[1],c.ViewColumn.Active,{enableScripts:!0}).webview.html=a.generateHTML(e[0]),[2]})})}))},t.stop=function(){}},function(e,t){e.exports=theia.theia_tinylink}]);
//# sourceMappingURL=tinylink-frontend.js.map