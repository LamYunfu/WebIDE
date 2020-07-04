import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
// import { Input } from "./linkedge";
import * as $ from "jquery"
export namespace taoFactoryView {
    export interface Props {
        initPid:(pid:string)=>void
        gotoFactoryScene:()=>void
        submitCode:(pid:string)=>void
        submitAlgorithm:(pid:string)=>void
        gotoTaoUnity:()=>void
        openShell:()=>void
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
export class TaoFactoryView extends React.Component<taoFactoryView.Props, taoFactoryView.State> {
    //题目的信息
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    projectName: string=""
    constructor(props: Readonly<taoFactoryView.Props>) {
        super(props)
    }
    componentWillMount() {
        //设置组件位置，宽度
        this.context.props.setSize(400)
        let _this = this
        _this.pidQueueInfo[_this.props.section["ppid"][0]] = { dirName: "智能制造", ppid: _this.props.section["ppid"][0], type: "OneLinkView" }
        _this.props.initPidQueueInfo(JSON.stringify(_this.pidQueueInfo))
        
    }
    async componentDidMount() {
        let _this = this
        let  projectName=Math.round(Math.random()*1000000000000).toString()
        await _this.props.initPid(_this.props.section["ppid"][0])
        setTimeout(()=>{
            //打开淘工厂unity页面
            _this.props.gotoFactoryScene()
        },2000)
        console.log("waiting")
        this.props.openShell();
    }
   
    
    
    changeAppName=(e:any)=>{
        this.projectName=e.target.value
    }

    codeSubmit = ()=>{
        this.context.props.submitCode(this.props.section["ppid"][0])

    }

    algorithmSubmit = ()=>{
        this.context.props.submitAlgorithm(this.props.section["ppid"][0])
    }
    render(): JSX.Element {
        return (
            <div style={{height: "100%"}}>
                <h5 id="titleAndStatus" className="card-title">
                    <span id={"coding_title"}>{"智能制造"}</span>
                </h5>
                <div id="codingInfoAreaContainer" style={{ height: "70%", width: "100%", position:"relative", overflow:"hidden"}}>
                <iframe id="iframe1"
                    src="http://120.55.102.225:12359/scene/steps.html"  
                    frameBorder="0"       
                    scrolling="auto"
                    style={{display: "block", top : "0px", width: "100%", height: "100%", visibility: "visible", position:"absolute"}}
                    sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
                </div>
        
                <div style = {{ position: "absolute", width: "100%", fontSize: "15px", top: "75%" }} >
                    <div className="row" >
                        <div className="col-12" style={{color: "white", cursor: "pointer", textAlign: "center", backgroundColor: "#3399FF",  margin:"5px", padding:"3px"}} id={"submitCode"} onClick={this.codeSubmit}>提交扫码枪代码</div>
                    </div>
                    
                    <div className="row" >
                        <div className="col-12" style={{color: "white", cursor: "pointer", textAlign: "center", backgroundColor: "#3399FF", margin:"5px", padding:"3px"}} id={"submitAlgorithm"} onClick ={this.algorithmSubmit}>提交识别算法</div>
                    </div>
                </div>
            </div>
        )
    }
}



TaoFactoryView.contextType = MyContext