import { WidgetFactory } from "@theia/core/lib/browser";
import { STM32Widget } from "./stm32_widget-widget";
import { injectable, inject } from "inversify";
/**
 * 自带函数，制造STM32Widget对象的工厂
 */
@injectable()
export class STM32WidgetFactory implements WidgetFactory {
  @inject( STM32Widget)
  public widget:  STM32Widget;
  constructor() {}
  id = STM32Widget.ID;

  /**
   * Creates a widget and attaches it to the application shell.
   * @param options serializable JSON data.
   */
  createWidget(options?: any): STM32Widget {
    return this.widget;
  }
}
