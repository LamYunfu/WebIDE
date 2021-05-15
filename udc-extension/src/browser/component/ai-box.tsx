import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import { MyContext } from "./context";
import { PROBLEM_STATUS_URL } from "../../setting/front-end-config";
import { CommandRegistry } from "@theia/core";
//experiment type is AIBOX
export namespace AIBox {
    export interface Props {
        initPid:(pid:string)=>void
        cr:CommandRegistry
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
export class AIBox extends React.Component<AIBox.Props, AIBox.State> {
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
    constructor(props: Readonly<AIBox.Props>) {
        super(props)
        this.state = {
            codingItems: []
        }
    }


    async componentWillMount() {
        this.context.props.setSize(500)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: this.props.title, ppid: _this.props.section["ppid"][0], type: "AIBOX" }
        await _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
    }
    async componentDidMount() {
        await this.props.initPid(this.props.section["ppid"][0])
        let _this = this
        console.log("ai-box load")
        setTimeout(()=>{
            let arr =document.getElementsByClassName("p-TabBar-tabLabel")
            for(let i =0 ;i< arr.length;i++){
                console.log("cmd:"+arr[i].innerHTML)
                if(arr[i].innerHTML=="aibox"){
                    return
                }
            }
            _this.props.cr.executeCommand("iot.plugin.tinylink.aibox")
        },3000)
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
                    url: PROBLEM_STATUS_URL,

                    contentType: "text/plain",
                    data: JSON.stringify({ pid: _this.pids.join().trim() }),
                    success: function (data) {                    }
                }

            )

        }, 5000)        
    }

    render(): JSX.Element {
        return (
            
            <div>
                <h5 id="titleAndStatus" className="card-title" style={{display:"none"}}>
                    <span id={"coding_title"}>{this.props.title}</span>
                </h5>
                <div className="jumbotron" style={{fontFamily:"SimSun"}}>
                    <h1 className="display-4">LinkLab工业互联网开发</h1>
                    <p className="lead">"依托Linklab平台，给与全新的AI-Box工业互联网开发体验!"</p>
                    <hr className="my-4"/>
                    <p>开始体验吧！</p>
                    <a className="btn btn-primary btn-lg" href="#" role="button">了解更多</a>
                </div>
            </div >

        )
    }
}
AIBox.contextType = MyContext