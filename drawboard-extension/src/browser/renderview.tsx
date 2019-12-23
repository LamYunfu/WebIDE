import React = require("react");
import { MyContext } from "./context";
import * as $ from "jquery"
import { ModelTestAddress } from "../settings/aiconfig";
export namespace View {
    export interface Props {

    }
}
export class View extends React.Component<View.Props>{
    boardType: string | undefined
    title: string | undefined
    componentWillMount() {
        this.title = $("#coding_title").text().trim()
        if (this.title == "画板数字识别")
            this.boardType = "digit"
        else if (this.title == "图像人脸识别")
            this.boardType = "practice"
        else if (this.title == "实时拍照人脸识别应用")
            this.boardType = "application"
    }
    componentDidMount() {

        const script = document.createElement("script", {

        });
        script.async = true;
        script.innerHTML = this.boardType == "digit" ?
            `
        // Variables for referencing the canvas and 2dcanvas context
        var canvas, ctx,canvashide, ctxhide;

        // Variables to keep track of the mouse position and left-button status 
        var mouseX, mouseY, mouseDown = 0;

        // Variables to keep track of the touch position
        var touchX, touchY;

        // Keep track of the old/last position when drawing a line
        // We set it to -1 at the start to indicate that we don't have a good value for it yet
        var lastX, lastY = -1;
        console.log("script is running")
        pb = document.getElementById("predictbutton")
        cb = document.getElementById("clearbutton")        
        pb.addEventListener("click", predict)
        cb.addEventListener("click", wrap = function () {
            document.getElementsByClassName("res")[0].innerHTML = ""
            document.getElementById("submitIndicator").style.display="none"
            clearCanvas(canvas, ctx)
        })
        init()

        // Draws a line between the specified position on the supplied canvas name
        // Parameters are: A canvas context, the x position, the y position, the size of the dot
        function drawLine(ctx, x, y, size) {

            // If lastX is not set, set lastX and lastY to the current position 
            if (lastX == -1) {
                lastX = x;
                lastY = y;
            }

            // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
            r = 255; g = 255; b = 255; a = 255;

            // Select a fill style
            ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";

            // Set the line "cap" style to round, so lines at different angles can join into each other
            ctx.lineCap = "round";
            //ctx.lineJoin = "round";


            // Draw a filled line
            ctx.beginPath();

            // First, move to the old (previous) position
            ctx.moveTo(lastX, lastY);

            // Now draw a line to the current touch/pointer position
            ctx.lineTo(x, y);

            // Set the line thickness and draw the line
            ctx.lineWidth = size;
            ctx.stroke();

            ctx.closePath();

            // Update the last position to reference the current position
            lastX = x;
            lastY = y;
        }

        // Clear the canvas context using the canvas width and height
        function clearCanvas(canvas, ctx) {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        function predict() {
            document.getElementById("predictbutton").disabled=true
            document.getElementById("submitIndicator").style.display="flex"
            document.getElementsByClassName("res")[0].innerHTML = ""
            webSocket = new WebSocket("${ModelTestAddress}")
            webSocket.onopen = () => {
                img = document.getElementById("imgtag")
                img.width = 28
                img.height = 28
                img.src = canvas.toDataURL()
                // img.src = "http://localhost:8089/abc.jpeg"
                img.onload = function (){
                    ctxhide.drawImage(img, 0, 0, 28, 28);
                    str = canvashide.toDataURL().split(",").pop()
                    len = str.length.toString()
                    content = '{' + "digits" + "," + len.padStart(5, '0') + "," + str + "}"
                    webSocket.send(content)
                }
            }
            webSocket.onmessage = (mesg) => {
                document.getElementsByClassName("res")[0].innerHTML = mesg.data;
                document.getElementById("predictbutton").disabled=false
                document.getElementById("submitIndicator").style.display="none"
            }
            // document.body.append(cd);
        
        }
        // Keep track of the mouse button being pressed and draw a dot at current location
        function sketchpad_mouseDown() {
            mouseDown = 1;
            drawLine(ctx, mouseX, mouseY, 46);
        }

        // Keep track of the mouse button being released
        function sketchpad_mouseUp() {
            mouseDown = 0;

            // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
            lastX = -1;
            lastY = -1;
        }

        // Keep track of the mouse position and draw a dot if mouse button is currently pressed
        function sketchpad_mouseMove(e) {
            // Update the mouse co-ordinates when moved
            getMousePos(e);

            // Draw a dot if the mouse button is currently being pressed
            if (mouseDown == 1) {
                drawLine(ctx, mouseX, mouseY, 46);
            }
        }

        // Get the current mouse position relative to the top-left of the canvas
        function getMousePos(e) {
            if (!e)
                var e = event;

            if (e.offsetX) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
                // console.log(mouseX)
            }
            else if (e.layerX) {
                mouseX = e.layerX;
                mouseY = e.layerY;
            }
        }

        // Draw something when a touch start is detected
        function sketchpad_touchStart() {
            // Update the touch co-ordinates
            getTouchPos();

            drawLine(ctx, touchX, touchY, 46);

            // Prevents an additional mousedown event being triggered
            event.preventDefault();
        }

        function sketchpad_touchEnd() {
            // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
            lastX = -1;
            lastY = -1;
        }

        // Draw something and prevent the default scrolling when touch movement is detected
        function sketchpad_touchMove(e) {
            // Update the touch co-ordinates
            getTouchPos(e);

            // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
            drawLine(ctx, touchX, touchY, 46);

            // Prevent a scrolling action as a result of this touchmove triggering.
            event.preventDefault();
        }

        // Get the touch position relative to the top-left of the canvas
        // When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
        // but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
        // "target.offsetTop" to get the correct values in relation to the top left of the canvas.
        function getTouchPos(e) {
            if (!e)
                var e = event;

            if (e.touches) {
                if (e.touches.length == 1) { // Only deal with one finger
                    var touch = e.touches[0]; // Get the information for finger #1
                    touchX = touch.pageX - touch.target.offsetLeft;
                    touchY = touch.pageY - touch.target.offsetTop;
                }
            }
        }


        // Set-up the canvas and add our event handlers after the page has loaded
        async function init() {
            // Get the specific canvas element from the HTML document
            canvas = document.getElementById('sketchpad');
            canvashide = document.getElementById('sketchpadhide');
            ctxhide = canvashide.getContext('2d');
            // If the browser supports the canvas tag, get the 2d drawing context for this canvas
            if (canvas.getContext)
                ctx = canvas.getContext('2d');
            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            // Check that we have a valid context to draw on/with before adding event handlers
            if (ctx) {
                // React to mouse events on the canvas, and mouseup on the entire document
                canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
                canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
                window.addEventListener('mouseup', sketchpad_mouseUp, false);

                // React to touch events on the canvas
                canvas.addEventListener('touchstart', sketchpad_touchStart, false);
                canvas.addEventListener('touchend', sketchpad_touchEnd, false);
                canvas.addEventListener('touchmove', sketchpad_touchMove, false);
            }
        }
        `
            :
            this.boardType == "practice" ?



                `/* eslint-disable no-undef */
          /* eslint-disable no-unused-vars */
          // Variables for referencing the canvas and 2dcanvas context
          var canvas, ctx, canvashide, ctxhide, input;
          var connection;
          ini()
          function ini() {
              init()
              console.log("script is running")
              pb = document.getElementById("predictbutton")
              cb = document.getElementById("clearbutton")
              // pb.addEventListener("click", predict)
              cb.addEventListener("click", wrap = function () {
                  console.log("clean")
                  document.getElementsByClassName("res")[0].innerHTML = ""
                  document.getElementById("submitIndicator").style.display="none"
                  clearCanvas(canvas, ctx)
              })
              pb.addEventListener("click", wrap = function () {
                predict()
            })
          }
          
          function clearCanvas(canvas, ctx) {
              input.value = ""
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              // document.getElementById('rightside').innerHTML = '';
          }
          
          function predict() {
            if (input.files[0] == undefined) {
                alert("请先上传图片")
                return
            }
              document.getElementById("submitIndicator").style.display="flex"
              if (connection == undefined) {
                //   connection = new WebSocket("ws://localhost:8240")
                  connection = new WebSocket("${ModelTestAddress}")
                  connection.onopen = () => {
                      str = canvas.toDataURL().split(",").pop()
                      len = str.length.toString()
                      content = '{' + "imgs" + "," + len.padStart(5, '0') + "," + str + "}"
                      connection.send(content)
                      connection.onmessage = async (mesg) => {
                          var img = document.createElement("img")
                          x = 10
                          y = 30
                          width = 0.3 * canvas.width
                          height = 0.2 * canvas.height
                          user="陈思培"
                          var mesgArr = mesg.data.split(",")
                            var type = mesgArr[0].slice(1)
                            var data = mesgArr.pop().split("}")[0]
                            var infoArr
                            if (type == "infos") {
                                infoArr = data.split(":")
                                x = parseInt(infoArr[0])
                                y = parseInt(infoArr[1])
                                width = parseInt(infoArr[2])
                                height = parseInt(infoArr[3])
                                user = infoArr[4]
                              ctx.save()
                              // document.body.appendChild(img)
                              ctx.beginPath()
                              ctx.strokeStyle = 'red';
                              ctx.strokeRect(x, y, width, height);                             
                              ctx.font = 'bold 19px serif';
                              ctx.fillStyle = 'red';
                              ctx.stroke();
                              ctx.fillText(user, x+width*0.3, y+height*0.9);
                              ctx.restore()
                              document.getElementById("submitIndicator").style.display="none"
                              // img.onload = () => ctx.drawImage(img, 31, 31, canvas.width, canvas.height)
                          } 
                      }
                  }
              } else {
                  str = canvas.toDataURL().split(",").pop()
                  len = str.length.toString()
                  content = '{' + "imgs" + "," + len.padStart(5, '0') + "," + str + "}"
                  connection.send(content)
              }
          
          }
          
          function loadImage() {
            //   cb.click()
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              str = URL.createObjectURL(input.files[0])
              var img = document.createElement("img")
              img.src = str
              img.onload = () => {
                rate = img.height / img.width
                rate > 1 ? ctx.drawImage(img, canvas.width*0.5*(1-rate), 0, canvas.width / rate, canvas.height) :
                    ctx.drawImage(img, 0, canvas.width*0.5*(1-rate), canvas.width, canvas.height * rate)
              }
          }
          async function init() {
              canvas = document.getElementById('sketchpad');
              input = document.getElementById("uploadbutton")
              if (canvas.getContext)
                  ctx = canvas.getContext('2d');
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              if (ctx) {
                  input.addEventListener("input", loadImage)
              }
          }`
                :
                ``
        // console.log(script.innerHTML)
        document.head.appendChild(script);
        //         let markdownLib = document.createElement("script")
        //         markdownLib.src = `//simonwaldherr.github.io/micromarkdown.js/dist/micromarkdown.min.js`
        //         document.head.appendChild(markdownLib)
        //         window.localStorage.setItem("markdownContent", `
        //         # 图像人脸识别操作
        // ### 操作环境
        // * Chrome 网络浏览器
        // * AILab在线实验平台
        // * WebIDE
        // ### 操作过程
        // * 登录AILab在线实验平台
        // * 点击图像人脸识别选项卡开启按钮，进入WebIDE
        // * ![ ](http://localhost:8089/face/start.png)
        // * 在WebIDE中的代码编辑器中添加需要训练的脚本
        // * ![ ](http://localhost:8089/face/editor.png)
        // * 点击左上角的Explorer图标
        // * ![ ](http://localhost:8089/face/explore.png)
        // * 展开图像人脸识别文件夹,于hexFiles文件夹上右键展开属性卡
        // * 点击New Folder，以需要识别的人名命名，新建一个文件夹
        // * ![ ](http://localhost:8089/face/folder.png)
        // * ![ ](http://localhost:8089/face/foldername.png)
        // * 右击该文件夹展开属性卡
        // * 点击Upload Files选择训练需要的照片上传
        // * ![ ](http://localhost:8089/face/uploadfiles.png)
        // * ![ ](http://localhost:8089/face/filedir.png)
        // * 点击实验详情标签，回到实验详情页面
        // * ![ ](http://localhost:8089/face/profile.png)
        // * 点击submit，上传训练脚本即模型至GPU服务器训练
        // * ![ ](http://localhost:8089/face/submit.png)
        // * 等待模型训练完毕，于LDCShell可看到详细的输出过程
        // * ![ ](http://localhost:8089/face/ldcshell.png)
        // * 模型训练完毕后，摁ctrl + b组合键，打开识别框
        // * 点击上传，上传需要识别的图片
        // * ![ ](http://localhost:8089/face/uploadface.png)
        // * 点击识别，测试训练好的模型
        // * ![ ](http://localhost:8089/face/recongnize.png)
        // * 识别结束后识别框中人脸将被框出，并显示姓名
        // * ![ ](http://localhost:8089/face/result.png)
        // * 重置可清除上次的测试操作
        // * ![ ](http://localhost:8089/face/reset.png)`)
        //         let markdownReader = document.createElement("script")
        //         markdownReader.innerHTML = `   
        //         console.log(data=window.localStorage.getItem("markdownContent"))
        //         outputEle = document.getElementById('codingInfoArea');
        //         outputEle.innerHTML = micromarkdown.parse(data);`
        //         document.head.appendChild(markdownReader)
        //         let iframe = document.createElement("iframe")
        //         iframe.src = "http://localhost:8089/index3.html"
        //         iframe.style={{}}
        //         $("#codingInfoArea").html(iframe)
    }
    render(): JSX.Element {
        return (
            this.boardType == "digit" ?
                < div id="mnistapp" style={{ width: '100%', height: "100%" }}>
                    <div style={{
                        height: '15%', fontSize: "3em", textAlign: "center", padding: '4%', margin: '0', border: "solid", borderWidth: '0 0 2px'
                    }}>{this.title}
                        <div style={{ fontSize: "15px" }}>尽量画满后识别</div>
                    </div>
                    <div className="leftside" style={{ position: "relative", width: '100%', height: "55%", display: "flex", justifyContent: "center", paddingTop: "20px" }}>
                        <div style={{ position: "relative" }}>
                            <canvas id="sketchpad" height="400px" width="400px" style={{
                                borderRadius: "20px",
                                position: "relative"
                                ,
                            }} >
                            </canvas>
                            <table style={{
                                width: "400px",
                                height: "400px",
                                pointerEvents: "none",
                                border: "solid"
                                , position: "absolute"
                                , top: '0'

                            }} >
                                <tr>
                                    <td style={{ border: "solid" }}></td>
                                    <td style={{ border: "solid" }}></td>
                                    <td style={{ border: "solid" }}></td>
                                </tr>
                                <tr>
                                    <td style={{ border: "solid" }}></td>
                                    <td style={{ border: "solid" }}></td>
                                    <td style={{ border: "solid" }}></td>
                                </tr>

                                <tr>
                                    <td style={{ border: "solid" }}></td>
                                    <td style={{ border: "solid" }}></td>
                                    <td style={{ border: "solid" }}></td>
                                </tr>
                            </table>
                            <div style={{ width: "100%", display: "flex", justifyContent: "space-around", padding: "0 20px" }}>
                                <div style={{ width: "20%" }} ><label htmlFor="predictbutton" className="predictbutton btn btn-primary" style={{
                                    float: "left", cursor: "pointer", padding: "0 10px",
                                    borderStyle: "double", borderWidth: "1px",
                                    width: "100%", fontSize: "15px",
                                    margin: "6px"
                                }}>识别</label></div>
                                <div style={{ width: "20%" }} ><label htmlFor="clearbutton" className="clearbutton btn btn-primary" style={{
                                    float: "left", cursor: "pointer", padding: "0 10px",
                                    borderStyle: "double", borderWidth: "1px",
                                    width: "100%", fontSize: "15px",
                                    margin: "6px"
                                }}>重置</label></div>
                                <input type="submit" value="识别" id="predictbutton" style={{ display: "none" }} />
                                <input type="submit" value="重置" id="clearbutton" style={{ display: "none" }} />
                            </div>
                        </div>
                    </div>


                    <div style={{
                        position: "relative", width: "100%", height: "30%",
                        border: "solid", borderWidth: "2px 0 0 0"
                    }}>
                        <div id="submitIndicator" style={{
                            width: "100%", height: "100%", position: "absolute",
                            display: "none", justifyContent: "center", alignItems: "center"
                        }}>
                            <div className="spinner-border" role="status" style={{ width: "130px", height: "130px", position: "absolute" }}>
                                <span className="sr-only">Loading...</span>
                            </div>
                            <div >识别中...</div>
                        </div>
                        <div className="res" style={{
                            display: "flex", justifyContent: "center", alignItems: "center",
                            width: "100%", height: "100%", fontSize: '130px',
                        }}>
                            9
                              </div>


                        <div style={{ "display": "none" }}>
                            <canvas id='sketchpadhide' height='28px' width='28px'></canvas>
                            <img id='imgtag' />
                        </div>
                    </div>

                    {/* <div style={{ borderStyle: "solid", borderWidth: "2px", width: "80%", height: "20%", marginBottom: "auto" }}>
                        识别中
                    </div> */}
                </div >
                :
                this.boardType == "practice" ?
                    < div id="mnistapp" style={{ width: '100%', height: "100%" }}>
                        <div style={{
                            height: '15%', fontSize: "3em", textAlign: "center", padding: '4%', margin: '0', border: "solid", borderWidth: '0 0 2px'
                        }}>{this.title}
                            <div style={{ fontSize: "15px" }}>请上传图片后识别</div>
                        </div>
                        <div className="leftside" style={{ position: "relative", width: '100%' }}>
                            <div style={{ position: "relative", width: "100%", borderRadius: "20px", margin: "auto", textAlign: "center", paddingTop: "20px" }}>
                                <canvas id="sketchpad" height="400px" width="400px" style={{ display: "table", position: "relative", margin: "auto", borderStyle: "solid", left: 0, right: 0 }} ></canvas>
                            </div>
                            <div style={{ width: '100%', position: 'relative', display: "flex", justifyContent: "center" }}>
                                <div><label htmlFor="predictbutton" className="predictbutton btn btn-primary" style={{
                                    float: "left", cursor: "pointer", padding: "0 10px",
                                    borderStyle: "double", borderWidth: "1px",
                                    width: "60px", fontSize: "15px",
                                    margin: "6px"
                                }}>识别</label></div>
                                <div><label htmlFor="clearbutton" className="clearbutton btn btn-primary" style={{
                                    float: "left", cursor: "pointer", padding: "0 10px",
                                    borderStyle: "double", borderWidth: "1px",
                                    width: "60px", fontSize: "15px",
                                    margin: "6px"
                                }}>重置</label></div>
                                <div><label htmlFor="uploadbutton" className="uploadbutton btn btn-primary" style={{
                                    float: "left", cursor: "pointer", padding: "0 10px",
                                    borderStyle: "double", borderWidth: "1px",
                                    width: "60px", fontSize: "15px",
                                    margin: "6px"
                                }}>上传</label></div>
                                <input type="submit" value="识别" id="predictbutton" style={{ display: "none" }} />
                                <input type="submit" value="重置" id="clearbutton" style={{ display: "none" }} />
                                <input type='file' id='uploadbutton' style={{ display: "none" }} />
                            </div>
                            <div style={{
                                position: "relative", width: "100%", height: "20%",
                                border: "solid", borderWidth: "2px 0 0 0"
                            }}>
                                <div className="res" style={{ display: "none", justifyContent: "center", alignItems: "center", width: '10%', position: 'relative', marginLeft: '20px', fontSize: '40px' }}>
                                </div>
                                <div style={{ "display": "none" }}>
                                    <canvas id='sketchpadhide' height='28px' width='28px'></canvas>
                                    <img id='imgtag' />
                                </div>

                            </div>
                        </div >
                        <div id="submitIndicator" style={{
                            width: "100%", height: "30%", position: "absolute",
                            display: "none", justifyContent: "center", alignItems: "center"
                        }}>
                            <div className="spinner-border" role="status" style={{ width: "130px", height: "130px", position: "absolute" }}>
                                <span className="sr-only">Loading...</span>
                            </div>
                            <div >识别中...</div>
                        </div>
                    </div>
                    :
                    <div>not for this problem</div>

        )
    }
}
View.contextType = MyContext