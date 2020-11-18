import { WidgetFactory } from "@theia/core/lib/browser";
import { NewWidget } from "./new_widget-widget";
import { injectable, inject } from "inversify";
@injectable()
export class NewWidgetFactory implements WidgetFactory {
  @inject(NewWidget)
  widget: NewWidget;
  constructor() {}
  id = NewWidget.ID;

  /**
   * Creates a widget and attaches it to the application shell.
   * @param options serializable JSON data.
   */
  createWidget(options?: any): NewWidget {
    return this.widget;
  }
}
