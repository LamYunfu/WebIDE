var theia_tinylink=function(e){var n={};function t(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,t),i.l=!0,i.exports}return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var i in e)t.d(r,i,function(n){return e[n]}.bind(null,i));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n,t){"use strict";var r=this&&this.__awaiter||function(e,n,t,r){return new(t||(t=Promise))(function(i,o){function l(e){try{a(r.next(e))}catch(e){o(e)}}function u(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){e.done?i(e.value):new t(function(n){n(e.value)}).then(l,u)}a((r=r.apply(e,n||[])).next())})},i=this&&this.__generator||function(e,n){var t,r,i,o,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(o){return function(u){return function(o){if(t)throw new TypeError("Generator is already executing.");for(;l;)try{if(t=1,r&&(i=2&o[0]?r.return:o[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,o[1])).done)return i;switch(r=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return l.label++,{value:o[1],done:!1};case 5:l.label++,r=o[1],o=[0];continue;case 7:o=l.ops.pop(),l.trys.pop();continue;default:if(!(i=(i=l.trys).length>0&&i[i.length-1])&&(6===o[0]||2===o[0])){l=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){l.label=o[1];break}if(6===o[0]&&l.label<i[1]){l.label=i[1],i=o;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(o);break}i[2]&&l.ops.pop(),l.trys.pop();continue}o=n.call(e,l)}catch(e){o=[6,e],r=0}finally{t=i=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,u])}}};Object.defineProperty(n,"__esModule",{value:!0});var o,l,u=t(1);!function(e){e.TINYLINK_COMPILE={id:"iot.plugin.tinylink.compile",category:"IoT Plugin",label:"TinyLink Compile"}}(o||(o={})),function(e){e.generateHTML=function(e){return void 0===e&&(e="http://linklab.tinylink.cn/java1-1.mp4"),'\n        <html>\n        <iframe id="iframe" src="'+e+'" frameborder="0" style="display: block; margin: 0px; \n        overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;\n        " sandbox="allow-same-origin allow-scripts allow-forms">\n        </iframe>\n             </html>\n'}}(l||(l={})),n.start=function(e){var n=this;e.subscriptions.push(u.commands.registerCommand(o.TINYLINK_COMPILE,function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return r(n,void 0,void 0,function(){return i(this,function(n){return console.log("arg-----------------------"+e[0]),u.window.createWebviewPanel("TinyLink","宣讲视屏",u.ViewColumn.Active,{enableScripts:!0}).webview.html=l.generateHTML(e[0]),[2]})})}))},n.stop=function(){}},function(e,n){e.exports=theia.theia_tinylink}]);
//# sourceMappingURL=tinylink-frontend.js.map