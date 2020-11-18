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

            <div style={{ height: "100%", display: "none" }}>
               
            </div>

        )
    }
}
DiyFreeCoding.contextType = MyContext