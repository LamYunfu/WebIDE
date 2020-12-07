import React = require("react");
import fs = require("fs");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "../component/context";
import { DiyFreeCoding } from "./diy-freeCoding-view";
import { DiyExperiment } from "./diy-experiment-view";
import { CONFIG_JSON_URL } from "../../setting/front-end-config";
import * as $ from "jquery";
import { DiyAIView } from "./diy-ai-view";
import { UI_Setting } from "../isEnable";
export namespace diyMainView {
    export interface Props {
      ui_setting:UI_Setting
      title: string
      section: { [key: string]: any } 
      connect: (loginType: string, model: string, pid: string, timeout: string) => Promise<boolean>
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
      showLocalBurn:()=>void 
    }

    //
    export interface State {
       viewType: number;            //视图类型代号
       layout: string;              //视图类型名称
       title: string;                //实验标题
       ldc: { [key: string]: any };   //ldc配置文件
       discription: string;           //实验具体描述（LinkLab实验专有）
       buttons: JSON[];
       devices: string;
       localBurn: string;       //标志是否需要显示本地烧写窗口(自由实验专有)
    }  
}
export class DiyMainView extends React.Component<diyMainView.Props, diyMainView.State> {
    
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    projectName: string=""
    ppid: string = "";
    viewType: number = 0;
    constructor(props: Readonly<diyMainView.Props>) {
        super(props)
    }
    async componentWillMount() {
      this.ppid = this.props.section.ppid;
      //读取json配置文件,通过ajax请求的方式
      // console.log("进自定义组件里面了，ppid的值是：" + this.ppid);
      let _this = this;
      let jsonConfig: { [key: string]: string } = {};
      let jsonConfigData:any;
      
      
      $.ajax({
        headers: {
          accept: "application/json",
        },
        crossDomain: true,
        xhrFields: {
          withCredentials: true,
        },
        method: "GET",
        url: CONFIG_JSON_URL,
        async: false,
        
        dataType: "json",
        contentType: "text/plain",
        data: { "ppid": parseInt(_this.ppid)}, //model 为登录类型 alios,组别 ble, logintype 为登录的方式 如adhoc,
        //请求返回的题目相关的数据
        success: (data) => {
          jsonConfigData = JSON.parse(data.data);
          //jsonConfigData = temp;
          jsonConfig["layout"] = jsonConfigData.layout;
          jsonConfig["title"] = jsonConfigData.title;
          jsonConfig["ldc"] = jsonConfigData.ldc;
          console.log(jsonConfigData);
          //console.log("请求成功");
 //         res();
        }
      });
  //   });
      
     
      //设置所有类型实验都共有的json数据类型
      this.setState({
        layout:jsonConfig["layout"],
        title: jsonConfig["title"]
      })
      
      switch(jsonConfig['layout']){
          case "free_coding":
              //自由 编程实验 
              _this.viewType = 1;
              this.props.ui_setting.setFreeCoding()
              this.setState(state =>({
                ldc: jsonConfigData.ldc,
                localBurn: jsonConfigData.localBurn,
              })); 
              break;
          case "linklab_experiment":
              //Linklab实验
              this.props.ui_setting.setExperiment()
              _this.viewType = 2;
              this.setState({
                ldc: jsonConfigData.ldc,
                discription: jsonConfigData.descriptions,
                buttons: jsonConfigData.buttons
            });
              break;
          case "multi_device":
              //多设备实验
              this.props.ui_setting.setFreeCoding()
              _this.viewType = 3;
              this.setState({
                ldc: jsonConfigData.ldc,
                devices: jsonConfigData.devices,
                buttons: jsonConfigData.buttons
              })
              break;
          case "ai_experiment":
              //ai实验
              this.props.ui_setting.setAI()
              _this.viewType = 4;
              this.setState({
                discription: jsonConfigData.discription,
                buttons: jsonConfigData.buttons
              })
              break;   
          default:
            this.setState(state =>({
              viewType : 100
            })); 
      }
    }
    async componentDidMount() {
       
    }
    
  
    render(): JSX.Element {
      //根据实验类型选择对应的视图去渲染
      console.log("在render方法里面，视图类型是：" + this.viewType);
      let _this = this;
        return _this.viewType == 1 ? (
          <DiyFreeCoding
            title={this.state.title}
            localBurn={this.state.localBurn}
            programSingleFile={_this.props.programSingleFile}
            config={_this.props.config}
            openShell={_this.props.openShell}
            initPidQueueInfo={_this.props.initPidQueueInfo}
            closeTabs={_this.props.closeTabs}
            setQueue={_this.props.setQueue}
            section={{ ppid:  _this.ppid, sid: "freeCoding" }}
            outputResult={_this.props.outputResult}
            say={_this.props.say}
            setCookie={_this.props.setCookie}
            disconnect={_this.props.disconnect}
            connect={_this.props.connect}
            callUpdate={_this.props.callUpdate}
            postSrcFile={_this.props.postSrcFile}
            showLocalBurn={_this.props.showLocalBurn}
          />
          ) : _this.viewType == 2 ? (
            <div>
              <div>
                <DiyExperiment
                  programSingleFile={_this.props.programSingleFile}
                  config={_this.props.config}
                  openShell={_this.props.openShell}
                  initPidQueueInfo={_this.props.initPidQueueInfo}
                  closeTabs={_this.props.closeTabs}
                  setQueue={_this.props.setQueue}
                  section={{ ppid: _this.ppid, sid: "experiment" }}
                  outputResult={_this.props.outputResult}
                  say={_this.props.say}
                  setCookie={_this.props.setCookie}
                  disconnect={_this.props.disconnect}
                  connect={_this.props.connect}
                  callUpdate={_this.props.callUpdate}
                  postSrcFile={_this.props.postSrcFile}
                  title={_this.state.title}
                  ldc={_this.state.ldc}
                  discription={_this.state.discription}
                />
              </div>
            </div>
          // ): _this.state.viewType == 3 ? (
          //   <DisplayBoard
          //     openWorkSpace={this.props.openWorkSpace}
          //     setSize={this.props.setSize}
          //     processDisplaySubmit={this.props.processDisplaySubmit}
          //     attach={this.props.attach}
          //  />
          ): _this.state.viewType == 4 ? (
              <DiyAIView
                discriptions={this.state.discription}
                buttons={this.state.buttons}
                title={this.state.title}
                config={_this.props.config}
                initPidQueueInfo={_this.props.initPidQueueInfo}
                section={{ ppid: [_this.ppid], sid: "experiment" }}
                outputResult={_this.props.outputResult}
                say={_this.props.say}
              />
          ): (<div> </div>);
    }
}



DiyMainView.contextType = MyContext