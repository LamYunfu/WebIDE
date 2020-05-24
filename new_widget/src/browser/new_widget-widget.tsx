import * as React from "react";
import { injectable, postConstruct, inject } from "inversify";
import { ReactWidget } from "@theia/core/lib/browser/widgets/react-widget";
import { MessageService } from "@theia/core";
import { Lamp } from "./Lamp";

@injectable()
export class NewWidget extends ReactWidget {
  static readonly ID = "new_widget:widget";
  id = "new_widget:widget";
  static readonly LABEL = "Display Board";
  ref: React.RefObject<HTMLCanvasElement>;
  iniImg: Blob;
  lp: Lamp;
  @inject(MessageService)
  protected readonly messageService: MessageService;
  constructor() {
    super();
    this.id = NewWidget.ID;
    this.title.label = NewWidget.LABEL;
    this.title.caption = NewWidget.LABEL;
    this.title.closable = true;
    this.title.iconClass = "fa fa-tachometer"; // example widget icon.
    this.addClass("theia-abc-vieaw");
    this.update();
    this.ref = React.createRef<HTMLCanvasElement>();
  }
  @postConstruct()
  protected async init(): Promise<void> {}

  async onAfterAttach() {
    let l1 = [66.1, 35.6];
    let p = this.ref.current;
    if (!p) return;
    let cx = p.getContext("2d");
    if (cx == null) return;
    else {
      cx.fillStyle = "rgb(200,0,0,1)";
      let response = await fetch(require("../../data/mega.png"));
      let screenon = await fetch(require("../../data/screenon.png"));
      let screenoff = await fetch(require("../../data/screenoff.png"));

      let b = await response.blob();
      let bm = await createImageBitmap(b);
      let sn = await createImageBitmap(await screenon.blob());
      let sf = await createImageBitmap(await screenoff.blob());
      cx.drawImage(bm, 0, 0, 400, 600);
   
      this.lp = new Lamp(sn, sf);
      this.lp.set(l1, p);
      this.lp.writeOnScreen("hello world");
      p.toBlob((b) => {
        if (!b) return;
        this.iniImg = b;
      });
      this.update();
      // lModel.blink();
      // cx.fillRect(0, 0, 500, 200);
    }
  }
  async drawPicture() {}
  protected render(): React.ReactNode {
    return (
      <div id="widget-container">
        <canvas ref={this.ref} width="400" height="600"></canvas>
      </div>
    );
  }

  protected displayMessage(): void {
    this.messageService.info(
      "Congratulations: New_widget Widget Successfully Created!"
    );
  }
}
