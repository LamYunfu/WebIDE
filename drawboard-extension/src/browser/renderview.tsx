import React = require("react");
import { MyContext } from "./context";


export namespace View {
    export interface Props {

    }
}
export class View extends React.Component<View.Props>{
    componentDidMount() {

        const script = document.createElement("script", {

        });
        script.async = true;
        script.innerHTML = `
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
            document.getElementsByClassName("res")[0].innerHTML = ""
            webSocket = new WebSocket("ws://47.98.249.190:8005/")
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
                    content = '{' + "imgs" + "," + len.padStart(5, '0') + "," + str + "}"
                    webSocket.send(content)
                }
            }
            webSocket.onmessage = (mesg) => {
                document.getElementsByClassName("res")[0].innerHTML = mesg.data;
            }
            // document.body.append(cd);
        
        }
        // Keep track of the mouse button being pressed and draw a dot at current location
        function sketchpad_mouseDown() {
            mouseDown = 1;
            drawLine(ctx, mouseX, mouseY, 42);
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
                drawLine(ctx, mouseX, mouseY, 42);
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

            drawLine(ctx, touchX, touchY, 42);

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
            drawLine(ctx, touchX, touchY, 42);

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
        document.head.appendChild(script);
    }
    render(): JSX.Element {
        return (

            <div id="mnistapp" style={{ width: '100%' }}>
                <h4 style={{ marginLeft: "10px" }}>手写数字识别</h4>
                <div className="leftside" style={{ position: "relative", width: '100%' }}>
                    <div style={{ position: "relative", width: "90%", borderRadius: "20px", float: "right" }}>
                        <canvas id="sketchpad" height="400px" width="400px" style={{ display: "table", position: "relative", margin: "auto", borderStyle: "solid", left: 0, right: 0 }} ></canvas>
                        <div style={{ width: '30%', position: 'relative', margin: "auto", display: "table", left: 0, right: 0 }}>
                            <input type="submit" value="识别" id="predictbutton" />
                            <input type="submit" value="重置" id="clearbutton" />
                        </div>
                    </div>
                    <div>
                    识别结果:
                    </div>
                    <div className="res" style={{ width: '10%', position: 'relative', marginLeft: '20px',fontSize:'40px' }}>
                    </div>
                    <div style={{ "display": "none" }}>
                        <canvas id='sketchpadhide' height='28px' width='28px'></canvas>
                        <img id='imgtag' />
                    </div>
                </div>
            </div>


        )
    }
}
View.contextType = MyContext