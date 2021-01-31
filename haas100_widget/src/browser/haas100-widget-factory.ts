import { WidgetFactory } from "@theia/core/lib/browser";
import { HaaS100Widget } from "./haas100_widget-widget";
import { injectable, inject } from "inversify";
/**
 * 自带函数，制造HaaS100Widget对象的工厂
 */
@injectable()
export class HaaS100WidgetFactory implements WidgetFactory {
  @inject( HaaS100Widget)
  widget:  HaaS100Widget;
  constructor() {}
  id = HaaS100Widget.ID;

  /**
   * Creates a widget and attaches it to the application shell.
   * @param options serializable JSON data.
   */
  createWidget(options?: any): HaaS100Widget {
    return this.widget;
  }
}
