import { ReactWidget, WidgetFactory, createTreeContainer } from "@theia/core/lib/browser";
import { ContainerModule, interfaces } from "inversify";
import React from "react";
export class DemoFactory implements WidgetFactory {
  id = "demos";
  createWidget(option?: any) {
    return new DemoWidget();
  }
}
export class DemoWidget extends ReactWidget {
  id = "demos";
  render(): React.ReactNode {
    return <div>this is a demo </div>;
  }
}