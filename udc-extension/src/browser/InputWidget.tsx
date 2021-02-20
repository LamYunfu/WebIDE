import { injectable, inject } from "inversify";
import {
    TreeWidget,
    TreeProps,
    TreeModel,
    ContextMenuRenderer,
    CompositeTreeNode,
    SelectableTreeNode,
    TreeNode,
    ApplicationShell,
    LocalStorageService,
    WidgetManager,
  } from "@theia/core/lib/browser";
import { InputView } from "./component/input_command";
import { UI_Setting } from "./isEnable";
import {UdcConsoleSession} from "./udc-console-session"
import React = require("react");
import * as $ from "jquery"

@injectable()
export class InputViewWidget extends TreeWidget {
    title1: string = "体重指数计算器";
    section1: string = "1111";
    @inject(UdcConsoleSession) session:UdcConsoleSession;
    outputResult = (res: string) => {
        this.session.execute(res);
    };

    public getValue():string {
        // alert(document.getElementById("input_text").nodeValue);
        
        let vak = $("#input_text").val();
        $("#input_text").val("");
        return vak.toString();
    }


    constructor(
        @inject(TreeProps) protected readonly treePros: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer)
        protected readonly contextMenuRenderer: ContextMenuRenderer,
    ) {
        super(treePros, model, contextMenuRenderer);
    }
    protected renderTree(): React.ReactNode {
        return (
          <div style={{ height: "100%" }}>
            <InputView
            outputResult={this.outputResult}
            title={this.title1}/>
            </div>
        );
    }
}