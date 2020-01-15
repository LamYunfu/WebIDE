import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
import { Input } from "./linkedge";
export namespace OneLinkView {
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
export class OneLinkView extends React.Component<OneLinkView.Props, OneLinkView.State> {
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    constructor(props: Readonly<OneLinkView.Props>) {
        super(props)
    }
    componentWillMount() {
        this.context.props.setSize(560)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: this.props.title, ppid: _this.props.section["ppid"][0], type: "OneLinkView" }
        _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
    }
    async componentDidMount() {
        // let _this = this
        // _this.context.props.openSrcFile(this.props.section["ppid"][0])
    }
    render(): JSX.Element {
        return (

            <div>
                <h5 id="titleAndStatus" className="card-title">
                    <span id={"coding_title"}>OneLink</span>
                </h5>
                <div id="codingInfoAreaContainer">
                    <pre className="card-text" id={"codingInfoArea"} title="1">这是一个有关OneLink的实验</pre>
                </div>

                <div style={{ width: "100%", fontSize: "20px", position: "absolute", top: "60%" }}>
                    <Input label="*appName:" hint="please input appName" copy={true}></Input>
                    <button className="btn btn-primary">创建</button>

                    <div className="row" >
                        <div className="col-6">设备端联合开发:</div><a className="col-2" style={{ color: 'blue', cursor: "pointer" }}>教程</a><div className="col-2" style={{ color: 'blue', cursor: "pointer" }}>开发</div> <div className="col-2" style={{ color: 'blue', cursor: "pointer" }}> 编译</div>
                    </div>
                    <div className="row" >
                    
                        <div className="col-6">移动端联合开发:</div><a className="col-2" style={{ color: 'blue', cursor: "pointer" }}>教程</a><div className="col-2" style={{ color: 'blue', cursor: "pointer" }}>开发</div> <div className="col-2" style={{ color: 'blue', cursor: "pointer" }}> 编译</div>
                    </div>
                 
                </div>
            </div >
        )
    }
}
OneLinkView.contextType = MyContext