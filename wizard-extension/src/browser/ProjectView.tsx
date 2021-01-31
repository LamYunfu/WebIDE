import React = require("react");
import { Select,InputNumber,Input,Button} from 'antd';
export namespace ProjectView {
    export interface Props {
       projectCreation: (config_json: string, otherConfig: string)=>void
    }
    export interface State{
        compile:string[];
        local_burn:string;
        occupy_mode:string;
        project_name:string;
        run_time:number;
        upload_file:string;
        first_menu_num:number;
    }
}
const { Option } = Select;

export class ProjectView extends React.Component<ProjectView.Props,ProjectView.State>{

    constructor(props: Readonly<ProjectView.Props>){
        super(props);
        this.state={
            compile : ["基于树莓派的C语言开发"], 
            local_burn:"support", 
            occupy_mode:"queue",
             project_name:"",
             upload_file:"",
             run_time:120, 
             first_menu_num:0
        };
    }
    componentWillMount() {
        
    }

    
    compile_type_arr = [["基于树莓派的C语言开发"],["基于AliOS的Esp32开发","基于AliOS的Developer Kit开发"],["基于Mega2650的原生开发"],["基于Mega2650的TinyLink平台开发"],["基于Numaker-IoT-M487的MebedOS开发"],["基于TelosB的contiki开发"]];
    complit_type:string[] = ["raspbian", "alios", "arduino", "tinylink", "mbed", "contiki-ng"];
    device_type = [["raspberry_pi"],["ESP32DevKitC", "DeveloperKit"], ["ArduinoMega2560"], ["ArduinoMega2560"],["numaker_iot_m487"],["TelosB"]];
    board_type = [["raspberry3"],["esp32devkitc", "developerkit"],["arduino:avr:mega:cpu=atmega2560"],["null"],["NUMAKER_IOT_M487"],["sky"]];
    //配置json文件
    config_json = {
      "version": "1.0.0",
      "usage": "queue",                       //和burnType同属于设备占用方式
      "hexFileDir": "hexFiles",
      "serverType": "raspberry_pi",           //和model同属于device_type
      "projects": [{
        "projectName": "test",
        "compileType": "raspbian",
        "boardType": "raspberry3",
        "burnType": "queue",
        "program": {
          "model": "raspberry_pi",
          "runtime": 120 ,
          "address": "0x1000"
        }
      }]
    };
  
    config_json_default = {
      "version": "1.0.0",
      "usage": "queue",                       //和burnType同属于设备占用方式
      "hexFileDir": "hexFiles",
      "serverType": "raspberry_pi",           //和model同属于device_type
      "projects": [{
        "projectName": "test",
        "compileType": "raspbian",
        "boardType": "raspberry3",
        "burnType": "queue",
        "program": {
          "model": "raspberry_pi", 
          "runtime": 120 ,
          "address": "0x1000"
        }
      }]
    }

    //更改本地烧写模式
    onLocalBurnSelect = (value:any)=>{
        this.setState({
          ...this.state,
          local_burn:value
        })
      }
      
     onAmountSelect = (value:any)=>{
      
      }
      
      //更改占用模式
      onOcupySelect = (value:any)=>{
        this.setState({
          ...this.state,
          occupy_mode:value
        })
        this.config_json.projects[0].burnType = value;
      }
      
      //更改时间
      onTimeChange = (value:any) =>{
        this.setState({
          ...this.state,
          run_time:value
        });
        this.config_json.projects[0].program.runtime = value;
      }
     
      //一级菜单目录点击:选择compile_type
     onDeviceClick = (value:any,e:any) =>{
       let _this = this;
        //alert(this.compile_type_arr[value]);
        this.setState({
          ...this.state,
          compile :_this.compile_type_arr[value],
          first_menu_num: value
        });
        this.config_json.projects[0].compileType = this.complit_type[value];
        //二级菜单默认值为第一个
        this.config_json.serverType = this.device_type[value][0];
        this.config_json.projects[0].program.model = this.config_json.serverType;
        this.config_json.projects[0].boardType = this.board_type[value][0];
     }
      
     // 二级菜单目录点击 value:device类型坐标
     onCompileClick = (value:any, e:any) => {
        this.restortState();
        this.config_json.serverType = this.device_type[this.state.first_menu_num][value];
        this.config_json.projects[0].program.model = this.config_json.serverType;
        this.config_json.projects[0].boardType = this.board_type[this.state.first_menu_num][value];
     }
    
     //恢复默认配置和设置project名称为空
     restortState=()=>{
       this.setState({
        ...this.state,
        local_burn:"support",
        occupy_mode:"queue", 
        project_name:"",
        upload_file:"",
        run_time:60
       });
     }
    
     //设置project_name
     setProjectName = (e:any)=>{
      this.setState({
        ...this.state,
        project_name:e.target.value
      })
      this.config_json.projects[0].projectName = e.target.value;
     }
    
     //点击取消按钮
     cancel=()=>{
       this.setState({
         ...this.state,
         local_burn:"support",
         occupy_mode:"queue", 
         project_name:"",
         upload_file:"",
         run_time:60,
         compile : ["基于树莓派的C语言开发"],
         first_menu_num:0
       });
       this.config_json = this.config_json_default;
     }
    
     //点击确定按钮
     submit = ()=>{
        //验证信息是否输入
        if(this.state.project_name.trim() ===  ""){
            alert("请输入项目名！");
        }
        else{
          const otherConfig = {
            "local_burn": this.state.local_burn,
            "run_time": this.state.run_time
          }
          this.props.projectCreation(JSON.stringify(this.config_json), JSON.stringify(otherConfig));
        }
     }
    
    async  componentDidMount() {
        // alert( await  this.props.getData())
        const script = document.createElement("script", {
        });
        script.async = true;      
    }

    render(): JSX.Element {
        return (
                 <div className="App">
        <div className="title"> <i className="fa fa-window-restore" aria-hidden="true" style={{color:"green"}}></i>&nbsp;&nbsp;New Project</div>
         <div className="select_info">
              <div className="device_type">
                <div className="content">
                     <div className="device_select" onClick={this.onDeviceClick.bind(this,0)}><i className="fa fa-product-hunt" aria-hidden="true" style={{color:"#BC1042"}}></i>&nbsp;&nbsp;Raspberri Pi</div> 
                     <div className="device_select" onClick={this.onDeviceClick.bind(this,1)}><i className="fa fa-buysellads" aria-hidden="true" style={{color:"#07BBA9"}}></i>&nbsp;&nbsp;AliOS</div>
                     <div className="device_select" onClick={this.onDeviceClick.bind(this,2)}><i className="fa fa-envira" aria-hidden="true" style={{color:"#006D9C"}}></i>&nbsp;&nbsp;Arduino Mega2650</div>
                     <div className="device_select" onClick={this.onDeviceClick.bind(this,3)}><i className="fa fa fa-modx" aria-hidden="true" style={{color:"#FFD766"}}></i>&nbsp;&nbsp;TinyLink</div>
                     <div className="device_select" onClick={this.onDeviceClick.bind(this,4)}><i className="fa fa-fort-awesome" aria-hidden="true" style={{color:"#FC012A"}}></i>&nbsp;&nbsp;Numaker-IoT-M487</div>
                     <div className="device_select" onClick={this.onDeviceClick.bind(this,5)}><i className="fa fa-dribbble" aria-hidden="true" style={{color:"#16754B"}}></i>&nbsp;&nbsp;TelosB</div>
                     
                </div>
              </div>
              <div className="compile_type">
                  <div className="content compile">
                      {/* <Compile compile={this.state.compile}/> */}
                      {this.state.compile.map((item,num) =>(
                          <div className="item" key={num} style={{marginTop:"5px",marginLeft:"10px"}} onClick={this.onCompileClick.bind(this,num)}><i className="fa fa-file-code-o" aria-hidden="true" style={{color:"#D8AC6A"}}></i>&nbsp;&nbsp;{item}</div>
                      ))}
                  </div>
              </div>
              <div className="other_param">
                  <div className="content">
                      <div className="local_burn">
                          本地烧写功能：
                          <Select  value={this.state.local_burn} style={{ width: "100" }} onChange={this.onLocalBurnSelect}>
                            <Option value="support">支持</Option>
                            <Option value="dissupport">不支持</Option>
                          </Select>
                      </div>
                      {/* <div className="device_amout">
                         设备使用数量：
                         <Select defaultValue="single" style={{ width: "100",marginTop:"5px"}} onChange={this.onAmountSelect}>
                            <Option value="single">单设备</Option>
                            <Option value="double">双设备</Option>
                          </Select>
                      </div> */}
                      <div className="occupy_mode">
                         设备占用模式：
                         <Select value={this.state.occupy_mode} style={{ width: "100",marginTop:"5px"}} onChange={this.onOcupySelect}>
                            <Option value="queue">排队模式</Option>
                            <Option value="adhoc">独占模式</Option>
                          </Select>
                      </div>
                      <div style={{marginTop:"5px"}}>
                          预计运行时间：<InputNumber min={5} max={600} value={this.state.run_time} onChange={this.onTimeChange} style={{width:"60px"}}/>&nbsp;s
                      </div>
                  </div>
              </div>
         </div>
         <div className="input_info">
            <div className="bottom_content">
               Project Name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Input className="project_name" value={this.state.project_name} onChange={this.setProjectName}/>
               <div className="upload_file">
                  <div style={{float:"left"}}>Upload File: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><Input className="folder_name" value={this.state.upload_file}/>&nbsp;&nbsp;&nbsp;
                  <div className="file_icon"><i className="fa fa-folder-open fa-lg" aria-hidden="true"></i></div>
               </div>
            </div>
            <div className="button_goup">
                <Button className="cancel_button" onClick={this.cancel}>Cancel</Button>
                <Button type="primary" onClick={this.submit}>OK</Button>
            </div>
         </div>
      </div>
     );

    }
 }