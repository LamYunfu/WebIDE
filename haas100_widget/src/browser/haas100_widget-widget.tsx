import * as React from "react";
import { injectable, postConstruct, inject } from "inversify";
import { ReactWidget } from "@theia/core/lib/browser/widgets/react-widget";
import { MessageService } from "@theia/core";
import { HaaSLamp } from "./Lamp";
import { ApplicationShell } from "@theia/core/lib/browser";

@injectable()
export class HaaS100Widget extends ReactWidget {
  static readonly ID = "HaaS100_widget:widget";
  id = "HaaS100_widget:widget";
  static readonly LABEL = "Display HaaS100";
  ref: React.RefObject<HTMLCanvasElement>;
  iniImg: Blob;
  haasLamp: HaaSLamp;
  @inject(MessageService)
  protected readonly messageService: MessageService;
  constructor(@inject(ApplicationShell) protected applicationShell: ApplicationShell) {
    super();
    this.id = HaaS100Widget.ID;
    this.title.label = HaaS100Widget.LABEL;
    this.title.caption = HaaS100Widget.LABEL;
    this.title.closable = true;
    this.title.iconClass = "fa fa-tachometer"; // example widget icon.
    this.addClass("theia-abc-vieaw");
    this.update();
    this.ref = React.createRef<HTMLCanvasElement>();
  }
  @postConstruct()
  protected async init(): Promise<void> {
    
  }

  async onAfterAttach() {
    this.setSize(500);
    let lightCor = [24.0, 74.8];            // 闪光点比例坐标 
    let canvasPainter = this.ref.current;
    if (!canvasPainter) return;
    //返回一个2D渲染上下文
    let context2D = canvasPainter.getContext("2d");
    if (context2D == null) return;
    else {
      context2D.fillStyle = "rgb(200,0,0,1)";
      let HaaS100_img = await fetch(require("../../data/haas100.png"));           // 获取开发板图片数据 

      let imgBlob = await HaaS100_img.blob();
      let bm = await createImageBitmap(imgBlob);                // 返回一个解决ImageBitmap的Promise
      context2D.drawImage(bm, 0, 0, 425, 247);
   
      this.haasLamp = new HaaSLamp();
      this.haasLamp.set(lightCor, canvasPainter);

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
        <canvas ref={this.ref} width="430" height="252"></canvas>
      </div>
    );
  }

  setSize = (size: number) => {
    //console.log("新设置的宽度是：" + size);
    this.applicationShell.setLayoutData({
      version: this.applicationShell.getLayoutData().version,
      activeWidgetId: this.id,
      rightPanel: {
        type: "sidepanel",
        size: size,
      },
    });
  };

  protected displayMessage(): void {
    this.messageService.info(
      "Congratulations: HaaS100_widget Widget Successfully Created!"
    );
  }
}
