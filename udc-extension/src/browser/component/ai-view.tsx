import React = require("react");
import * as $ from "jquery"
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
export namespace AI {
    export interface Props {
        section: { [key: string]: any }
        title: string
        config: () => void
        say: (verbose: string) => void
        outputResult: (res: string, types?: string) => void
        initPidQueueInfo(infos: string): Promise<string>
    }
    export interface State {
        codingItems: JSX.Element[]
    }
}
export class AIView extends React.Component<AI.Props, AI.State> {
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    constructor(props: Readonly<AI.Props>) {
        super(props)
    }


    componentWillMount() {
        this.context.props.setSize(520)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: this.props.title, ppid: _this.props.section["ppid"][0], type: "ai" }
        _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
    }


    async componentDidMount() {
        let _this = this
        _this.context.props.openSrcFile(_this.props.section["ppid"][0])
        $("#submitSrcButton").click(() => {
            _this.context.props.train(_this.props.section["ppid"][0])
        })
    }
    render(): JSX.Element {
        return (
            <div>
                <h5 id="titleAndStatus" className="card-title">
        <span id={"coding_title"}>{this.props.title}</span>
                </h5>
                <div id="codingInfoAreaContainer">
                    <pre className="card-text" id={"codingInfoArea"} title="1">这是一个关于{this.props.title}的AI实验</pre>
                </div>
                <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"submitSrcButton"}>submit</button></span>
            </div >
        )
    }
}
AIView.contextType = MyContext