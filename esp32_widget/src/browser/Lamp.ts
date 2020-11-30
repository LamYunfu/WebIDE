import { injectable } from "inversify";
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
      this.cv.width - this.marginX,
      3 + this.marginY,
      0.9 * this.marginX,
      0.7 * this.marginY,
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
  
  // drawSlot() {
  //   let ctx = this.cv.getContext("2d");
  //   if (!ctx) {
  //     return;
  //   }
  //   let width = this.cv.width;
  //   let height = this.cv.height;
  //   let xR = (width % this.marginY) / 2;
  //   let rate = 0.7;
  //   for (
  //     let i = xR + (1 + rate) * this.marginX;
  //     i < width - this.marginX - (1 + rate) * this.marginX;
  //     i += this.marginX
  //   ) {
  //     this.drawX(
  //       i + this.marginX / 2,
  //       this.marginY,
  //       rate * this.marginX,
  //       rate * this.marginY,
  //       "L1"
  //     );
  //     this.drawX(
  //       i + this.marginX / 2,
  //       height - this.marginY,
  //       rate * this.marginX,
  //       rate * this.marginY,
  //       "L1"
  //     );
  //   }
  //   let yR = (height % this.marginX) / 2;
  //   for (
  //     let i = xR + (1 + rate) * this.marginY;
  //     i < height - (1 + rate) * this.marginY;
  //     i += this.marginX
  //   ) {
  //     this.drawX(
  //       this.marginX,
  //       i + this.marginY,
  //       rate * this.marginX,
  //       rate * this.marginY,
  //       "L2"
  //     );
  //     this.drawX(
  //       width - yR - this.marginX,
  //       i + yR + this.marginY / 2,
  //       rate * this.marginX,
  //       rate * this.marginY,
  //       "L2"
  //     );
  //   }
  // }


  
  
  /**
   * 画矩形形状的灯
   */
  async paint() {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    await this.save();
    ctx!.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(
      this.cv.width * 0.640,        //开始坐标的X坐标
      this.cv.height * 0.518,       //开始坐标的y坐标
      this.cv.width * 0.024,        //矩形灯的宽
      this.cv.height * 0.036        //矩形灯的长
    );
    // ctx.arc(this.x, this.y, r, 0, 360);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 灯亮换成黄色
   */
  lighton() {
    this.color = "yellow";           //灯亮的时候是黄色
    this.paint();
  }

  /**
   * 灯灭变成其他颜色
   */
  lightoff() {
    this.color = "#bcbdbf";           //灯暗下来的时候是灰色
    this.paint();
  }

  async blink() {
    while (true) {
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
      this.save();
      this.paint();
      // alert("fasd");
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 3000);
      });
      await this.restore();
    }
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
