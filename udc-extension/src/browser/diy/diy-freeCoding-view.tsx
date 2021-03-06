import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import { MyContext } from "../component/context";
import { PROBLEM_STATUS_URL } from "../../setting/front-end-config";
export namespace DiyFreeCoding {
    export interface Props {
        title: string
        section: { [key: string]: any }
        localBurn: string
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
        showLocalBurn:()=>void                          //显示本地烧写界面
    }


    export interface State {
        codingItems: JSX.Element[]
    }
}
export class DiyFreeCoding extends React.Component<DiyFreeCoding.Props, DiyFreeCoding.State> {
    [x: string]: any;
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
    constructor(props: Readonly<DiyFreeCoding.Props>) {
        super(props)
        this.state = {
            codingItems: []
        }
    }


    async componentWillMount() {
        this.context.props.setSize(500)
        let _this = this
    
        console.log("进到了我diy-freeCoding里面");

        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: this.props.title, ppid: _this.props.section["ppid"][0], type: "freecoding" }
        await _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
        
        console.log("加载完毕");

    }
    async componentDidMount() {
        this.props.openShell()
        this.context.props.openExplorer()
        this.context.props.openSrcFile(this.props.section["ppid"][0])
        let _this = this
        
        console.log("localBurn的字段名称是：" + this.props.localBurn);
        if(this.props.localBurn == "true"){
           this.props.showLocalBurn();
           console.log("需要打开本地烧写器");
        }
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
                    url: PROBLEM_STATUS_URL,

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

              <div style={{ height: "100%", display: "none" }}>
                        <div className="title_timer" title={this.props.section["ppid"][0]} style={{ height: "10%" }}><h4 className={`section experiment`}>自由实验</h4><span id='timer'></span></div>
                        <div className="row col-12" style={{ height: "80%" }} >
                            <div className="col-12" style={{ fontSize: "30px", height: "20%" }}>
                                项目:{this.props.title}
                                <div style={{ marginLeft: '0px', fontSize: "30px" }} >
                                    这是一个关于{this.props.title}的项目
                                </div>
                                <span id={"coding_title"}>{this.props.title}</span>

            
                                {/* <img src="http://5b0988e595225.cdn.sohucs.com/images/20180721/0f6e106b88544c0b8b91fbf7d196898d.jpeg"
                                    style={{ "position": "absolute", "width": "200px", height: "200px", top: '0px', right: '0px', paddingLeft: "10px" }}></img> */}
                            </div>
                            <div className="col-12" style={{ fontSize: "30px", height: "30%" }}>
                                可用设备：
                            <div style={{ marginLeft: '100px', fontSize: "25px" }} >
                                    <li>tinylink_lora</li>
                                    <li>esp32</li>
                                    <li>tinylink_platform</li>
                                    <li>developerkit</li>
                                </div>
                            </div>
            
                        </div>
                        </div>

        )
    }
}
DiyFreeCoding.contextType = MyContext