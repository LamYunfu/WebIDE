import React = require("react");
import * as $ from "jquery"
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
import { AI1DOC, AI2DOC, AI3DOC, MODEL_DOWNLOAD_URL } from '../../setting/front-end-config'
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
        if (this.props.title == "画板数字识别")
            $("#aiDSP").attr("src", AI1DOC)
        else if (this.props.title == "图像人脸识别")
            $("#aiDSP").attr("src", AI2DOC)
        else if (this.props.title == "视频人脸识别") {
            $("#aiDSP").attr("src", AI3DOC)
            let sp = document.createElement("script")
            sp.innerHTML = `
            db = document.getElementById("downloadButton")         
            db.addEventListener("click", wrap = function () {
            console.log("click download button")
            connection = new WebSocket("ws://localhost:8240")
            // connection = new WebSocket("${MODEL_DOWNLOAD_URL}")
            connection.onopen = async () => {                        
                                    content = "{download,0,0}"
                                    connection.send(content)
                                    connection.onmessage = async (mesg) => {
                                                                link = document.getElementById("downloadlink")
                                                                file = mesg.data.split(",").pop().split("}")[0]                                         
                                                                link.href = "data:application/octet-stream;base64,"+file
                                                                link.download = "model.zip";
                                                                link.click()
                                                            }               
                                 }
            })
            `
            document.head.appendChild(sp)

        }
        _this.context.props.openSrcFile(_this.props.section["ppid"][0])
        $("#submitSrcButton").click(() => {
            _this.context.props.train(_this.props.section["ppid"][0])
        })
    }
    render(): JSX.Element {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <h5 id="titleAndStatus" className="card-title" style={{ display: "none" }}>
                    <span id={"coding_title"}>{this.props.title}</span>
                </h5>
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'darkgray'
                }}>
                    <iframe id="aiDSP" src="" style={{
                        width: " 100%",
                        height: '99%',
                        borderWidth: '0',
                        background: 'darkgray',
                        paddingBottom: "50px",
                        pointerEvents:"none"
                    }}></iframe>
                </div>

                <a id="downloadlink" style={{ "display": "none" }}></a>
                {this.props.title != "视频人脸识别" ?
                    <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"submitSrcButton"}>提交</button></span>
                    :
                    <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"downloadButton"}>下载</button></span>
                }
            </div >
        )
    }
}
AIView.contextType = MyContext