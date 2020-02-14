import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
import { Input } from "./linkedge";
import * as $ from "jquery"
export namespace OneLinkView {
    export interface Props {
        gotoPhone:()=>void
        gotoUnity:()=>void
        openUnity:()=>void
        openFileView: () => void
        complileMobile:()=> Promise<boolean>
        compileDevice: ()=>Promise<boolean>
        openMobile:()=>void
        openDevice:()=>void
        createOnelinkProject:(projectName:string,pid:string)=>Promise<boolean>
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
    projectName:string=""
    constructor(props: Readonly<OneLinkView.Props>) {
        super(props)
    }
    componentWillMount() {
        this.context.props.setSize(560)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: this.props.title, ppid: _this.props.section["ppid"][0], type: "OneLinkView" }
        _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
        
    }
    submit=()=>{
        this.context.props.virtualSubmit(this.props.section["ppid"][0])
    }
    async componentDidMount() {
        let _this = this
        _this.context.props.openSrcFile(this.props.section["ppid"][0])
        $("#submitSrcButton").click(() => {
            // _this.context.props.gotoVirtualScene()
            alert("vir")
            _this.context.props.virtualSubmit(_this.props.section["ppid"][0])
        })
        console.log("waiting")

        setTimeout(() => {  
            console.log("start unity")
            this.props.openUnity()
        }, 3000);
    }
    createMobile =  async ()=>{

    }
    createProject=async()=>{
        if(this.projectName!=""){
           let res=await this.props.createOnelinkProject(this.projectName,this.props.section["ppid"][0])
           if(res){
               alert("create project scc")
           }
        }
        else{
            alert("project name is null")
        }

    }
    complileMobile=async ()=>{
        this.props.complileMobile()
    }
    compileDevice=async ()=>{
        await this.props.compileDevice()
        this.openMobile()

    }
    openMobile= async ()=>{
        this.props.openMobile()

    }
    openDevice=async ()=>{
        this.props.openDevice()

    }
    
    changeAppName=(e:any)=>{
        this.projectName=e.target.value
    }
    render(): JSX.Element {
        return (

            <div>
                <h5 id="titleAndStatus" className="card-title">
                    <span id={"coding_title"}>{this.props.title}</span>
                </h5>
                <div id="codingInfoAreaContainer">
                    <pre className="card-text" id={"codingInfoArea"} title="1">这是一个有关{this.props.title}的虚拟场景</pre>
                </div>
                <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"gotoPhone"} onClick={this.props.gotoPhone}>gotoPhoneSimulator</button></span>
                <span style={{ position: "absolute", left: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"gotoUnity"} onClick ={this.props.gotoUnity}>gotoUnity</button></span>
                <div style={{ width: "100%", fontSize: "20px", position: "absolute", top: "60%" }}>
                    <Input label="*appName:" hint="please input appName" copy={true} onChange={this.changeAppName}></Input>
                    <button className="btn btn-primary" onClick={this.createProject}>创建</button>
                    <div className="row" >
                        <div className="col-6">设备端联合开发:</div><a  className="col-2" style={{ color: 'green', cursor: "pointer" }}>教程</a><div className="col-2" style={{ color: 'green', cursor: "pointer" }}  onClick={this.props.openFileView}>开发</div> <div className="col-2" style={{ color: 'green', cursor: "pointer" }} onClick={this.submit}> 编译</div>
                    </div>
                    <div className="row" >                    
                        <div className="col-6">移动端联合开发:</div><a className="col-2" style={{ color: 'green', cursor: "pointer" }}>教程</a><div className="col-2" style={{ color: 'green', cursor: "pointer" }} onClick={this.openMobile}>开发</div> <div className="col-2" style={{ color: 'green', cursor: "pointer" }} onClick={this.complileMobile}> 编译</div>
                    </div>
                 
                </div>
            </div >
        )
    }
}
OneLinkView.contextType = MyContext