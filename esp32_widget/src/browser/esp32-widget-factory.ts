import { WidgetFactory } from "@theia/core/lib/browser";
import { Esp32Widget } from "./esp32_widget-widget";
import { injectable, inject } from "inversify";
/**
 * 自带函数，制造ESP32Widget对象的工厂
 */
@injectable()
export class Esp32WidgetFactory implements WidgetFactory {
  @inject( Esp32Widget)
  widget:  Esp32Widget;
  constructor() {}
  id = Esp32Widget.ID;

  /**
   * Creates a widget and attaches it to the application shell.
   * @param options serializable JSON data.
   */
  createWidget(options?: any): Esp32Widget {
    return this.widget;
  }
}
