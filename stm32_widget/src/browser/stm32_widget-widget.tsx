import * as React from "react";
import { injectable, postConstruct, inject } from "inversify";
import { ReactWidget } from "@theia/core/lib/browser/widgets/react-widget";
import {UdcService} from "udc-extension/lib/common/udc-service";
import { MessageService } from "@theia/core";
import { BackendClient, STM32BackendService, STM32BackendServiceSymbol } from "../common/protocol";
import { Lamp } from "./Lamp";
   
@injectable()
export class STM32Widget extends ReactWidget {
  static readonly ID = "STM32_widget:widget";
  id = "STM32_widget:widget";
  static readonly LABEL = "Display STM32";
  ref: React.RefObject<HTMLCanvasElement>;
  iniImg: Blob; 
  lamp: Lamp;
  @inject(MessageService) protected readonly messageService: MessageService;
  @inject(STM32BackendServiceSymbol) stmBackService:STM32BackendService;
  @inject(UdcService) udcService:UdcService;
  constructor() {
    super();
    this.id = STM32Widget.ID;
    this.title.label = STM32Widget.LABEL;
    this.title.caption = STM32Widget.LABEL;
    this.title.closable = true;
    this.title.iconClass = "fa fa-tachometer"; // example widget icon.
    this.addClass("theia-abc-vieaw");
    this.update();
    this.ref = React.createRef<HTMLCanvasElement>();
  }
  @postConstruct()
  protected async init(): Promise<void> {}
    
  async onAfterAttach() {
  //  console.log("udcService是否注入成功" + this.stmBackService.sendMessage("suscceed"));
    let lightCor = [64.0, 51.8];            // 闪光点比例坐标 
    let canvasPainter = this.ref.current;
    if (!canvasPainter) return;
    //返回一个2D渲染上下文
    let context2D = canvasPainter.getContext("2d");
    if (context2D == null) return;
    else {
      context2D.fillStyle = "rgb(200,0,0,1)";
      let STM32_img = await fetch(require("../../data/stm32.png"));           // 获取开发板图片数据 

      let imgBlob = await STM32_img.blob();
      let bm = await createImageBitmap(imgBlob);                // 返回一个解决ImageBitmap的Promise
      context2D.drawImage(bm, 0, 0, 372, 467);

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
      <div>
         {/* <button style={{backgroundColor:"red",borderRadius:"50%", height:"15px",  width:"15px"}}></button> */}
        <canvas ref={this.ref} width="372" height="467 " style={{position:"absolute"}}></canvas>
        <div className="button_group" style={{position:"absolute", objectFit:"none"}}>
            <button style={{marginTop:"430px", backgroundColor:"#5F5F67",borderRadius:"50%", height:"15px",  width:"15px",marginLeft:"80px", border:"none", outline:"none"}} onClick= {this.reset.bind(this)}></button>
            <button style={{marginTop:"428px", backgroundColor:"#5F5F67",borderRadius:"50%", height:"15px",  width:"15px", marginLeft:"34px", border:"none", outline:"none"}} onClick= {this.k1.bind(this)}></button>
            <button style={{marginTop:"428px", backgroundColor:"#5F5F67",borderRadius:"50%", height:"15px",  width:"15px", marginLeft:"33px", border:"none", outline:"none"}} onClick= {this.k2.bind(this)}></button>
        </div>
        {/* <img src={require("../../data/stm32.png")} style={{height:"467px", width:"372px", objectFit:"none"}} /> */}
      </div>
    );
  }

  protected displayMessage(): void {
    this.messageService.info(
      "Congratulations: STM32_widget Widget Successfully Created!"
    );
  }

  //reset按钮点击时响应事件
  protected reset(){
    alert("resetdown");
    //this.udcService.serialPortInput("reset key down");
  }

  //k1按钮点击时响应事件
  protected k1(){  
    alert("key1down");
    this.udcService.serialPortInput("key1down\r\n");
  }

  //k2按钮点击时响应事件
  k2(){
    alert("key2down");
    //console.log("k2是否被成功点击" + this.stmBackService.sendMessage("K2 key down test"));
    this.udcService.serialPortInput("key2down\r\n");
    //this.lamp.lightChange([0,0,1]);
  }
}

@injectable()
export class BackendClientImpl implements BackendClient {
  sendMessage(message: string): void {
    throw new Error("Method not implemented.");
  }
  
};
