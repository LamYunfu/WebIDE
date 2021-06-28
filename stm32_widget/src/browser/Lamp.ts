import { injectable } from "inversify";
import { createTextChangeRange } from "typescript";
export class Lamp {
  position = [0, 1];
  status = "";
  cv: HTMLCanvasElement;
  color: string = "red";
  ba: Blob[] = [];
  marginX: number;
  marginY: number;
  leftPort: number[];
  rightPort: number[];
  downPort: number[];
  upPort: number[];
  dimData: Blob;
  screenScheduler: any;
  constructor() {
    
  }
  /**
   * 
   * @param cor 闪光点的坐标(比例坐标)
   * @param cv canvas画布对象
   */
  set(cor: number[], cv: HTMLCanvasElement) {
    this.position[0] = (cv.width * cor[0]) / 100;
    this.position[1] = (cv.height * cor[1]) / 100;
    this.cv = cv;
    this.marginX = 0.10 * this.cv.height;
    this.marginY = 0.10 * this.cv.width;

    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    
    //在整个图片的四周画一圈红色的边框
    ctx.strokeStyle = "red";
    ctx.beginPath();
    //绘制图片的矩形边框
    ctx.strokeRect(0, 0, this.cv.width, this.cv.height);
    ctx.closePath();
    ctx.stroke();
    //画指向灯的线
    //this.drawASlot();
    this.save();
    this.color = "#C7C3C4";
    //绘制灯
    this.paint();
  }
  get x() {
    return this.position[0];
  }
  get y() {
    return this.position[1];
  }

  /**
   * 画指向灯的文字和线
   */
  drawASlot() {
    this.drawX(
      this.cv.width - this.marginX,
      3 + this.marginY,
      0.9 * this.marginX,
      0.7 * this.marginY,
      "button"
    );
  }
  
  /**
   * 画指向灯的线和标注文字
   * @param x 文字的x坐标
   * @param y  文字的y坐标
   * @param width 边框的宽度
   * @param height  边框的高度
   * @param label 标注的文字
   */
  drawX(x: number, y: number, width: number, height: number, label: string) {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#00FFFF";              //指示画笔的颜色
    ctx.fillStyle = "#00FFFF";
    ctx.textBaseline = "middle";
    ctx.font = `${(2 * height) / 3}px serif`;
    //画指向线
    this.calculatePath(x, y, this.x, this.y);
    //画L2外面那个框框
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    //画L2
    ctx.fillText(label, x - (2 * width) / 5, y, (4 * width) / 5);
    // ctx.beginPath();
    // ctx.arc(x, y, 10, 0, 360);
    // ctx.closePath();
    // ctx.fill();
  }

  /**
   * 画指向灯的线
   * @param x2   目标点坐标点
   * @param y2 
   * @param x1   起点坐标点
   * @param y1 
   */
  calculatePath(x2: number, y2: number, x1: number, y1: number) {
    y2 = y2 + 15;
    x1 = x1 + 10;
    let k = (1.5 * (y2 - y1)) / (x2 - x1);
    // let x = k / Math.abs(k);
    let dxu = (x2 - x1) / Math.abs(x2 - x1);
    let dyu = (y2 - y1) / Math.abs(y2 - y1);
    let d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    let theta = Math.atan(k);

    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    let tmpX = x1 + 0.33 * d * Math.abs(Math.cos(theta)) * dxu;
    let tmpY = y1 + 0.33 * d * Math.abs(Math.sin(theta)) * dyu;
    k;
    ctx.beginPath();
    ctx.moveTo(x1, y1);               //设置第一条线起点
    ctx.lineTo(tmpX, tmpY);           //设置第一条线目的点
    ctx.moveTo(tmpX, tmpY);           //设置第二条线起点
    ctx.lineTo(x2, y2);               //设置第二条线目的点
    ctx.closePath();
    ctx.stroke();
  }
  

  
  
  /**
   * 画圆形形状的灯
   */
  async paint() {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    await this.save();
    ctx!.fillStyle = this.color;
    ctx.beginPath();
    let xcor = 0.363*this.cv.width;
    let ycor = 0.878*this.cv.height;
    let r = 0.028*this.cv.width;;
    ctx.arc(xcor, ycor, r, 0, 2*Math.PI);
    // ctx.arc(this.x, this.y, r, 0, 360);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 灯亮换成对应的颜色
   */
  lightChange(rgb_color:number[]) {
    let red = rgb_color[0] == 1 ? 255: 0;
    let green = rgb_color[1] == 1 ? 255: 0;
    let blue = rgb_color[2] == 1 ? 255: 0;
    this.color = "rgb(" + red + "," + green + "," + blue + ")";   
    if(red == 0 && green == 0 && blue == 0){
      this.color = "#C7C3C4";
    }
    //console.log(this.color);        
    this.paint();
  }

  

  /**
   * 保存当前的canvas图像，将其压入栈中
   */
  async save() {
    let ctx = this.cv.getContext("2d");  
    if (!ctx) return;
    return await new Promise<boolean>((res) => {
      this.cv.toBlob((b) => {
        if (!b) res(false);
        else {
          if (this.ba.length > 300) {
            this.ba.shift();
          }
          this.ba.push(b);
          res(true);
        }
      });
    });
  }

  /**
   * 恢复上一次保存的canvas图像
   */
  async restore() {
    let ctx = this.cv.getContext("2d");
    let r = this.ba.pop();
    if (!ctx || !r) return;
    ctx.drawImage(await createImageBitmap(r), 0, 0);
  }
  
  /**
   * 在屏幕位置显示内容
   * @param something 
   * @returns 
   */
  public writeOnScreen(something: string) {
    alert("收到的消息是：" + something);
    //stm32_screen_display{"color":"63448, 0", "content":["打印内容","第一行","第二行","第三行","第四行","第五行","第六行","第七行","第八行","第九行"]}\
    //解析显示的内容，获取需要显示的信息
    let a = something.indexOf('{');
    let info = something.substring(a, something.lastIndexOf('}') + 1);
    console.log("获取到的消息是：" + info);
    let info_json = JSON.parse(info);
    let background_color = info_json.color.split(',')[1];
    let font_color = info_json.color.split(',')[0]
    let content = info_json.content;
    //alert("背景颜色是：" + background_color + " 字体颜色是：" + font_color + " 显示内容是：" + content);
    //设置屏幕背景颜色
    this.turnOnScreen("#" + Number(background_color).toString(16));
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#" + Number(font_color).toString(16);
    ctx.font= "12px SimSun";//Microsoft YaHei
    alert("打印的字符串是：" + content);
    //显示文字
    for(let i = 0;i < content.length;i++){
      ctx.fillText(content[i], 97, 100+i*13);
    }
    
    // let ctx = this.cv.getContext("2d");
    // if (!ctx) return;
    // //await this.turnOnScreen(color);
    // let w = this.cv.width;
    // let h = this.cv.height;
    // ctx.fillStyle = "white";
    // ctx.font = "TimesNewRoman";
    // ctx.fillText(something, w * 0.379, h * 0.499, w * 0.25);
    // this.screenScheduler = setTimeout(() => {
    //   //this.turnOffScreen();
    // }, 1000);
  }

  async turnOnScreen(screen_color:string) {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    clearTimeout(this.screenScheduler);
    //alert("屏幕颜色是：" + screen_color);
    ctx.fillStyle = "black";//screen_color;
    ctx.fillRect(90, 80, 195, 278);
    // ctx.drawImage(
    //   this.screenOn,
    //   400 * 0.348,
    //   600 * 0.456,
    //   400 * 0.307,
    //   600 * 0.109
    // );
  }

  
}
