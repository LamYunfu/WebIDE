import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
// import { Input } from "./linkedge";
import * as $ from "jquery"
export namespace OsDevView {
    export interface Props {
        initPid:(pid:string)=>void
        openShell:()=>void
        section: { [key: string]: any }
        title: string
        config: () => void
        say: (verbose: string) => void
        outputResult: (res: string, types?: string) => void
        initPidQueueInfo(infos: string): Promise<string>
        openOSDev:()=>void
        openFileView:()=>void
    }
    export interface State {
        codingItems: JSX.Element[]
    }
}
export class OsDevView extends React.Component<OsDevView.Props, OsDevView.State> {
    //题目的信息
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    projectName: string=""
    constructor(props: Readonly<OsDevView.Props>) {
        super(props)
    }
    componentWillMount() {
        //设置组件位置，宽度
        this.context.props.setSize(400)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: "系统开发", ppid: _this.props.section["ppid"][0], type: "OneLinkView" }
       // _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
        
    }
    async componentDidMount() {
        let _this = this
        let  projectName=Math.round(Math.random()*1000000000000).toString()
       // await _this.props.initPid(_this.props.section["ppid"][0])
        this.props.openOSDev(); 
        this.props.openFileView();
    }
   
    
    render(): JSX.Element {
        return (
            <div style={{height: "100%", overflow:"-Scroll", overflowY:"hidden", color:"white"}}>
                <h4 style={{color:"white"}}>库文件系统开发</h4>
                <h5 style={{color:"white"}}>开发步骤：</h5>
                <h5 style={{color:"white"}}>1.选择应用运行的开发板</h5>
                <h5 style={{color:"white"}}>2.选择Library库类型</h5>
                <h5 style={{color:"white"}}>3.选择库文件分支</h5>
                <h5 style={{color:"white"}}>4.输入项目名称，点击确定按钮</h5>
                <h5 style={{color:"white"}}>5.打开文件开始开发</h5>
                <h5 style={{color:"white"}}>6.点击菜单栏Linklab-Library Remote Burn远程编译烧写代码</h5>
            </div>
        )
    }
}



OsDevView.contextType = MyContext