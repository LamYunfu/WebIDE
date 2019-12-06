import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import { MyContext } from "./context";
export namespace FreeCoding {
    export interface Props {
        title: string
        section: { [key: string]: any }
        connect: (loginType: string, model: string, pid: string, timeout: string) => void
        disconnect: () => void
        callUpdate: () => void
        postSrcFile: (fn: string) => void
        config: () => void
        setCookie: (cookie: string) => void
        say: (verbose: string) => void
        outputResult: (res: string, types?: string) => void
        setQueue: () => void
        closeTabs: () => void
        initPidQueueInfo(infos: string): Promise<string>
        openShell: () => void
        programSingleFile: (pidAndFn: string) => void

    }


    export interface State {
        codingItems: JSX.Element[]
    }
}
export class FreeCoding extends React.Component<FreeCoding.Props, FreeCoding.State> {
    timeout: { [pid: string]: string } = {}
    model: { [key: string]: string } = {}
    ppids: { [key: string]: string } = {}
    loginType: { [key: string]: string } = {}
    role: { [key: string]: string[] } = {}
    currentFocusCodingIndex: string[] = ['00000']
    codingIssues: { [key: string]: string } = {}
    codingInfos: { [key: string]: string } = {}
    codingStatus: { [key: string]: string } = {}
    judgeStatus: string[] = []
    submittedCodingIssue: string[] = []
    pidQueueInfo: { [pid: string]: {} } = {};
    statusCode: { [key: number]: string } = {
        0x0000: 'NO_GEN',
        0x0001: 'GEN_FAIL',
        0x0010: 'NO_SUB',
        0x0011: "JUDGING",
        0x0012: 'PROG_ERR',
        0x0020: 'ACCEPT',
        0x0021: 'WRONG_ANSWER',
        0x0022: 'TIMEOUT'
    }
    statusColors: { [key: number]: string } = {
        0x0000: 'white',
        0x0001: 'black',
        0x0010: 'white',
        0x0011: "yellow",
        0x0012: 'black',
        0x0020: 'green',
        0x0021: 'red',
        0x0022: 'grey'
    }
    pids: string[] = []
    codingItems: JSX.Element[] = []
    addSubmittedCodingIssue = (issueIndex: string) => {
        this.submittedCodingIssue.push(issueIndex)
    }
    constructor(props: Readonly<FreeCoding.Props>) {
        super(props)
        this.state = {
            codingItems: []
        }
    }


    componentWillMount() {
        this.context.props.setSize(720)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: this.props.title, ppid: _this.props.section["ppid"][0], type: "freecoding" }
        _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
    }
    async componentDidMount() {
        this.context.props.openExplorer()
        this.context.props.openSrcFile(this.props.section["ppid"][0])
        let _this = this
        // this.props.openShell()
        // _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
        // if (decodeURI(window.location.href).split("/").pop() != "自由编程") {
        //     _this.context.props.openWorkSpace(`file:/home/project/自由编程`)
        //     return
        // }

        $(document).ready(
            () => {
                $(document).on("click", ".section." + _this.props.section.sid, (e) => {
                    console.log("section click...................")
                    _this.props.closeTabs()
                    $(".contentsAndInfos." + _this.props.section.sid).toggle()
                })
            }
        )
        $(document).ready(
            () => {
                $("#connectButton" + _this.props.section.sid).click(
                    (e) => {
                        if ($(e.currentTarget).text() == "断开") {
                            _this.currentFocusCodingIndex[0] = '-1'
                            _this.props.disconnect()
                            $(e.currentTarget).text("连接")
                            $("#setQueue" + this.props.section.sid).show()
                        }
                        else {
                            let val = $("#codingInfoArea" + _this.props.section.sid).attr("title")
                            // alert(val)
                            val != undefined && (_this.currentFocusCodingIndex[0] = val)
                            console.log("<<<<<<<<<set current coding index:" + _this.currentFocusCodingIndex[0])
                            val != undefined && _this.props.connect(_this.loginType[val], _this.model[val], val, _this.timeout[val])
                            $(e.currentTarget).text("断开")
                        }
                    }
                )
                $(document).on("click", ".list-group-item", (e) => {
                    $(".list-group-item").each((i, _this) => {
                        $(_this).removeClass("list-group-item-primary")
                    })
                    $(e.currentTarget).addClass("list-group-item-primary")
                })
            }
        )
        setInterval(() => {
            _this.pids.length != 0 && $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "POST",
                    url: "http://api.tinylink.cn/problem/status",

                    contentType: "text/plain",
                    data: JSON.stringify({ pid: _this.pids.join().trim() }),
                    success: function (data) {
                    }
                }

            )

        }, 5000)
        // while (this.state.codingItems.length == 0)
        //     await new Promise((resolve) => {
        //         setTimeout(() => {
        //             resolve()
        //         }, 300)
        //     })
        this.context.showTheDefaultFreeCodingView()

    }

    render(): JSX.Element {
        return (
            <div style={{ height: "100%" }}>
                <div className="title_timer" title={this.props.section["ppid"][0]} style={{ height: "10%" }}><h4 className={`section experiment`}>自由实验</h4><span id='timer'></span></div>
                <div className="row col-12" style={{ height: "80%" }} >
                    <div className="col-12" style={{ fontSize: "30px", height: "20%" }}>
                        项目:{this.props.title}
                        <div style={{ marginLeft: '0px', fontSize: "30px" }} >
                            这是一个关于{this.props.title}的项目
                        </div>

                        {/* <img src="http://5b0988e595225.cdn.sohucs.com/images/20180721/0f6e106b88544c0b8b91fbf7d196898d.jpeg"
                            style={{ "position": "absolute", "width": "200px", height: "200px", top: '0px', right: '0px', paddingLeft: "10px" }}></img> */}
                    </div>
                    <div className="col-12" style={{ fontSize: "30px", height: "30%" }}>
                        可用设备：
                     <div style={{ marginLeft: '100px', fontSize: "25px" }} >
                            <li>tinylink_lora</li>
                            <li>esp32</li>
                            <li>tinylink_platform</li>
                            <li>developerkit</li>
                        </div>
                    </div>

                    {/* <div className="col-12" style={{ fontSize: "30px", height: "35%" }}>
                        Config.json:
                        <div style={{ left: '100px', height: '100%', width: '70%', position: "absolute", fontSize: "28px", }} >
                            <textarea style={{
                                height: '100%', width: '100%', position: "absolute", fontSize: "8px",
                                borderStyle: "solid", borderWidth: "3px", borderRadius: "5px"
                            }} >
                                {`[
    {
        “
        ProjectName”: “Gateway”,
        “DeviceType”: “LoRa - gateway”,
        “CompileType”: “Arduino”“ DeviceNum”: “1”
    }, {
        “
        ProjectName”: “Node”,
        “DeviceType”: “LoRa - node”,
        “CompileType”: “Arduino”,
        “DeviceNum”: “3”
    }
]`}
                            </textarea>
                        </div>
                    </div> */}

                </div>
                {/* <button className="btn btn-primary" style={{ position: 'absolute', bottom: '5px', right: '0%' }}>提交</button> */}
            </div>

        )
    }
}
FreeCoding.contextType = MyContext