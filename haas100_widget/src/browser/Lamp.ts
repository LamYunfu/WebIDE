import { injectable } from "inversify";
export class HaaSLamp {
  position = [0, 1];
  status = "";
  colorOff:string = "#5F6167";
  colorOn:string = "#FFFEF5";
  cv: HTMLCanvasElement;
  color: string = "red";
  ba: Blob[] = [];
  marginX: number;
  marginY: number;
  lightArr:string[] = [this.colorOff, this.colorOn, this.colorOff,  this.colorOff, this.colorOff, this.colorOff]
  //灯名称和灯下标映射Map
  reflectMap = new Map([
    ["LED 3", "0"],
    ["LED 4", "2"],
    ["LED 1", "3"],
    ["LED 5", "4"],
    ["LED 2", "5"],
  ]); 
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
    //ctx.lineWidth = 6;
    ctx.beginPath();
    //绘制图片的矩形边框
    ctx.strokeRect(0, 0, this.cv.width, this.cv.height);
    ctx.closePath();
    ctx.stroke();
    //画指向灯的线
    this.drawASlot();
    this.save();
    this.color = "#bcbdbf";
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
      this.marginX,
      0.4*this.marginY,
      1.5 * this.marginX,
      0.6 * this.marginY,
      "light"
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
   * 画六个圆形形状的灯,初始状态第二个灯是亮的
   */
  async paint() {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    await this.save();
    let k = 0;
    //let x = 0.285*this.cv.width;        //圆心x轴坐标
    //let y = 0.820*this.cv.height;       //圆心y轴坐标
    let r = 0.0145*this.cv.width;                    //圆的半径
    for(let i = 0;i < 3;i++){
      for(let j = 0;j < 2;j++){
        let xcor = (0.285+0.05*j)*this.cv.width;
        let ycor = (0.775+0.05*i)*this.cv.height;
        //alert("k=" + k + "color=" +this.lightArr[k]);
        ctx.fillStyle= this.lightArr[k++];
        ctx.beginPath();
        ctx.arc(xcor, ycor, r, 0, 2*Math.PI);
        // ctx.arc(this.x, this.y, r, 0, 360);
        //ctx.fillStyle="#6E7277";
        ctx.closePath();
        ctx.fill();
      }
    }
    //(0.285,0.775)
    //ctx!.fillStyle = this.color;
   
  }

  /**
   * 根据日志打印信息点亮对应的灯
   * log:  LDC平台发过来的日志
   */
  public async lightChange(log:string) {
    //获取LED编号
    //console.log("进入了lightChange函数里面" + log);
    let SerialNum = log.substr(0, 5);
    //获取编号
    //console.log("编号是：" + SerialNum)
    let num:number = parseInt(this.reflectMap.get(SerialNum)!);
    //console.log("数字是：" + num);
    let status = log.substring(6).trim();
    //console.log("灯的状态是1" + status);
    //更改对应灯号的颜色
    if(status.substr(0,2) == "ON"){
      //console.log("点亮");
      this.lightArr[num] = this.colorOn;
    } else{
      //console.log("熄灭");
      this.lightArr[num] = this.colorOff;
    }
    //重新绘制灯阵
    await this.paint();
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

}
