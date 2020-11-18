import * as React from "react";
import { injectable, postConstruct, inject } from "inversify";
import { ReactWidget } from "@theia/core/lib/browser/widgets/react-widget";
import { MessageService } from "@theia/core";
import { Lamp } from "./Lamp";

@injectable()
export class Esp32Widget extends ReactWidget {
  static readonly ID = "esp32_widget:widget";
  id = "esp32_widget:widget";
  static readonly LABEL = "Display ESP32";
  ref: React.RefObject<HTMLCanvasElement>;
  iniImg: Blob;
  lamp: Lamp;
  @inject(MessageService)
  protected readonly messageService: MessageService;
  constructor() {
    super();
    this.id = Esp32Widget.ID;
    this.title.label = Esp32Widget.LABEL;
    this.title.caption = Esp32Widget.LABEL;
    this.title.closable = true;
    this.title.iconClass = "fa fa-tachometer"; // example widget icon.
    this.addClass("theia-abc-vieaw");
    this.update();
    this.ref = React.createRef<HTMLCanvasElement>();
  }
  @postConstruct()
  protected async init(): Promise<void> {}

  async onAfterAttach() {
    let lightCor = [64.0, 51.8];            // 闪光点比例坐标 
    let canvasPainter = this.ref.current;
    if (!canvasPainter) return;
    //返回一个2D渲染上下文
    let context2D = canvasPainter.getContext("2d");
    if (context2D == null) return;
    else {
      context2D.fillStyle = "rgb(200,0,0,1)";
      let esp32_img = await fetch(require("../../data/ESP32-DevKitM.png"));           // 获取开发板图片数据 

      let imgBlob = await esp32_img.blob();
      let bm = await createImageBitmap(imgBlob);                // 返回一个解决ImageBitmap的Promise
      context2D.drawImage(bm, 0, 0, 400, 600);
   
      this.lamp = new Lamp();
      this.lamp.set(lightCor, canvasPainter);

      //缓存canvas图像
      canvasPainter.toBlob((b) => {
        if (!b) return;
        this.iniImg = b;
      });
      this.update();
    }
  }

  protected render(): React.ReactNode {
    return (
      <div id="widget-container">
        <canvas ref={this.ref} width="400" height="600"></canvas>
      </div>
    );
  }

  protected displayMessage(): void {
    this.messageService.info(
      "Congratulations: Esp32_widget Widget Successfully Created!"
    );
  }
}
