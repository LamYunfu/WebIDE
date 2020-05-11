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

  set(cor: number[], cv: HTMLCanvasElement) {
    this.position[0] = (cv.width * cor[0]) / 100;
    this.position[1] = (cv.height * cor[1]) / 100;
    this.cv = cv;
    this.marginX = 0.07 * this.cv.height;
    this.marginY = 0.07 * this.cv.width;

    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    // ctx.strokeStyle = "green";
    // ctx.beginPath();
    // ctx.strokeRect(
    //   this.marginX,
    //   this.marginY,
    //   this.cv.width - 2 * this.marginX,
    //   this.cv.height - 2 * this.marginY
    // );
    // ctx.closePath();
    // ctx.stroke();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.strokeRect(0, 0, this.cv.width, this.cv.height);
    ctx.closePath();
    ctx.stroke();
    this.drawASlot();
    this.save();
    this.color = "#bcbdbf";
    this.paint(10);
  }
  get x() {
    return this.position[0];
  }
  get y() {
    return this.position[1];
  }
  drawASlot() {
    this.drawX(
      this.cv.width - this.marginX,
      3 + this.marginY,
      0.7 * this.marginX,
      0.7 * this.marginY,
      "L2"
    );
  }
  drawSlot() {
    let ctx = this.cv.getContext("2d");
    if (!ctx) {
      return;
    }
    let width = this.cv.width;
    let height = this.cv.height;
    let xR = (width % this.marginY) / 2;
    let rate = 0.7;
    for (
      let i = xR + (1 + rate) * this.marginX;
      i < width - this.marginX - (1 + rate) * this.marginX;
      i += this.marginX
    ) {
      this.drawX(
        i + this.marginX / 2,
        this.marginY,
        rate * this.marginX,
        rate * this.marginY,
        "L1"
      );
      this.drawX(
        i + this.marginX / 2,
        height - this.marginY,
        rate * this.marginX,
        rate * this.marginY,
        "L1"
      );
    }
    let yR = (height % this.marginX) / 2;
    for (
      let i = xR + (1 + rate) * this.marginY;
      i < height - (1 + rate) * this.marginY;
      i += this.marginX
    ) {
      this.drawX(
        this.marginX,
        i + this.marginY,
        rate * this.marginX,
        rate * this.marginY,
        "L2"
      );
      this.drawX(
        width - yR - this.marginX,
        i + yR + this.marginY / 2,
        rate * this.marginX,
        rate * this.marginY,
        "L2"
      );
    }
  }
  calculatePath(x2: number, y2: number, x1: number, y1: number) {
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
    ctx.moveTo(x1, y1);
    ctx.lineTo(tmpX, tmpY);
    ctx.moveTo(tmpX, tmpY);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
  }
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

  async restore() {
    let ctx = this.cv.getContext("2d");
    let r = this.ba.pop();
    if (!ctx || !r) return;
    ctx.drawImage(await createImageBitmap(r), 0, 0);
  }
  async paint(r: number) {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    await this.save();
    ctx!.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(
      this.cv.width * 0.652,
      this.cv.height * 0.345,
      this.cv.width * 0.014,
      this.cv.height * 0.012
    );
    // ctx.arc(this.x, this.y, r, 0, 360);
    ctx.closePath();
    ctx.fill();
  }

  lighton() {
    this.color = "yellow";
    this.paint(10);
  }
  lightoff() {
    this.color = "#bcbdbf";
    this.paint(10);
  }
  drawX(x: number, y: number, width: number, height: number, label: string) {
    let ctx = this.cv.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "red";
    ctx.textBaseline = "middle";
    ctx.font = `${(2 * height) / 3}px serif`;
    this.calculatePath(x, y, this.x, this.y);
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    ctx.fillText(label, x - (2 * width) / 5, y, (4 * width) / 5);
    // ctx.beginPath();
    // ctx.arc(x, y, 10, 0, 360);
    // ctx.closePath();
    // ctx.fill();
  }
  async blink() {
    while (true) {
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
      this.save();
      this.paint(10);
      // alert("fasd");
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
      await this.restore();
    }
  }
}
