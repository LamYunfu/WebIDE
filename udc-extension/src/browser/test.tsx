import { ReactWidget } from "@theia/core/lib/browser";
import { DisplayBoard } from "./component/display-board";
import ReactDOM from "react-dom";
const React = require("react");

export class TestWidget extends ReactWidget {
  id = "testWidget";
  constructor() {
    super();
    this.update();
  }

  protected render(): React.ReactNode {
    return <div style={{ backgroundColor: "red" }}>asdasd</div>;
  }
}
