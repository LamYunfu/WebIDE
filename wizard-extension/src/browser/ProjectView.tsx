import React = require("react");
import {Input,Button,Upload,Typography} from 'antd';
const { Paragraph } = Typography;
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
        discription:string;
        img_path:string;
    }
}
//const { Option } = Select;

export class ProjectView extends React.Component<ProjectView.Props,ProjectView.State>{

    constructor(props: Readonly<ProjectView.Props>){
        super(props);
        this.state={
            compile : ["基于AliOS的Esp32开发","基于AliOS的Developer Kit开发"], 
            local_burn:"support", 
            occupy_mode:"queue",
             project_name:"",
             upload_file:"",
             run_time:120, 
             first_menu_num:0, 
             discription:"基于AliOS的Esp32开发，开发的程序基于alios编译，程序烧写运行在esp32devkit开发板上", 
             img_path:"esp32.png"
        };
    }
    componentWillMount() {
        
    }

    
    compile_type_arr = [["基于AliOS的Esp32开发","基于AliOS的Developer Kit开发"],["基于Arduino Mega2650的原生开发","基于Arduino UNO的原生开发"],["基于contiki的TelosB开发"],["基于AliOS的HaaS100开发"],["TinySim开发"]];
    complie_type:string[] = ["alios", "arduino", "contiki-ng", "alios-haas", "tinysim"];
    device_type = [["ESP32DevKitC", "DeveloperKit"], ["ArduinoMega2560", "ArduinoMega2560"], ["TelosB"],["Haas100"],["TinySim"]];
    board_type = [["esp32devkitc", "developerkit"],["arduino:avr:mega:cpu=atmega2560","arduino:avr:uno"],["sky"],["haas100"],["linuxhost"]];
    discriptions = [["基于AliOS的Esp32开发，开发的程序基于alios编译，程序烧写运行在esp32devkit开发板上",
                    "基于AliOS的Developer Kit开发，开发的程序基于alios编译，程序烧写运行在developerkit开发板上"],
                    ["基于Arduino Mega2650的原生开发，开发的程序基于arduino编译，程序烧写运行在arduino mega2560开发板上",
                    "基于Arduino UNO的原生开发，开发的程序基于arduino编译，程序烧写运行在arduino uno开发板上"],
                    ["基于contiki的TelosB开发，开发的程序基于contiki-ng编译，程序烧写运行在sky开发板上"],
                    ["基于AliOS的HaaS100开发，开发的程序基于alios-haas编译，程序烧写运行在阿里云HaaS 100开发板上"],
                    ["基于物联网在线虚拟仿真平台TinySim开发"]];
    //图片路径
    img_paths = [["esp32.png","developer_kit.png"], ["arduino_mega_2560.png", "arduino_uno.png"], ["telosb.png"], ["haas100.png"], ["tinysim.jpg"]];
    //配置json文件
    config_json = {
      "version": "1.0.0",
      "usage": "queue",                       //和burnType同属于设备占用方式
      "hexFileDir": "hexFiles",
      "serverType": "ESP32DevKitC",           //和model同属于device_type
      "projects": [{
        "projectName": "test",
        "compileType": "alios",
        "boardType": "esp32devkitc",
        "burnType": "queue",
        "program": {
          "model": "ESP32DevKitC",
          "runtime": 120 ,
          "address": "0x1000"
        }
      }]
    };
  
    config_json_default = {
      "version": "1.0.0",
      "usage": "queue",                       //和burnType同属于设备占用方式
      "hexFileDir": "hexFiles",
      "serverType": "ESP32DevKitC",           //和model同属于device_type
      "projects": [{
        "projectName": "test",
        "compileType": "alios",
        "boardType": "esp32devkitc",
        "burnType": "queue",
        "program": {
          "model": "ESP32DevKitC",
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
        //this.restortState();
        this.setState({
          ...this.state,
          compile :_this.compile_type_arr[value],
          first_menu_num: value,
         // discription: ""
        });
        this.config_json.projects[0].compileType = this.complie_type[value];
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
        let desc = this.discriptions[this.state.first_menu_num][value];      //获取这个开发类型对应的文档
        let img = this.img_paths[this.state.first_menu_num][value];
        this.setState({
          ...this.state,
          discription:desc,
          img_path:img
        })
    }

     //恢复默认配置和设置project名称为空
     restortState=()=>{
       this.setState({
        ...this.state,
        local_burn:"support",
        occupy_mode:"queue", 
        project_name:"",
        upload_file:"",
        run_time:120, 
        first_menu_num:0, 
        discription:"基于AliOS的Esp32开发，开发的程序基于alios编译，程序烧写运行在esp32devkit开发板上", 
        img_path:"esp32.png"
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
         run_time:120,
         compile : ["基于AliOS的Esp32开发","基于AliOS的Developer Kit开发"],
         first_menu_num:0,
         discription:"基于AliOS的Esp32开发，开发的程序基于alios编译，程序烧写运行在esp32devkit开发板上", 
         img_path:"esp32.png"
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
                       <div className="device_select" onClick={this.onDeviceClick.bind(this,0)}><i className="fa fa-product-hunt" aria-hidden="true" style={{color:"#BC1042"}}></i>&nbsp;&nbsp;AliOS</div> 
                       <div className="device_select" onClick={this.onDeviceClick.bind(this,1)}><i className="fa fa-buysellads" aria-hidden="true" style={{color:"#07BBA9"}}></i>&nbsp;&nbsp;Arduino</div>
                       <div className="device_select" onClick={this.onDeviceClick.bind(this,2)}><i className="fa fa-envira" aria-hidden="true" style={{color:"#006D9C"}}></i>&nbsp;&nbsp;Contiki</div>
                       <div className="device_select" onClick={this.onDeviceClick.bind(this,3)}><i className="fa fa fa-modx" aria-hidden="true" style={{color:"#FFD766"}}></i>&nbsp;&nbsp;HaaS</div>
                       <div className="device_select" onClick={this.onDeviceClick.bind(this,4)}><i className="fa fa-fort-awesome" aria-hidden="true" style={{color:"#FC012A"}}></i>&nbsp;&nbsp;TinySim</div>
                  </div>
                </div>
                <div className="compile_type" >
                    <div className="content compile" >
                        {/* <Compile compile={this.state.compile}/> */}
                        {this.state.compile.map((item,num) =>(
                            <div className="item" key={num} style={{marginTop:"5px",marginLeft:"10px",position:"relative"}} onClick={this.onCompileClick.bind(this,num)}><i className="fa fa-file-code-o" aria-hidden="true" style={{color:"#D8AC6A"}}></i>&nbsp;&nbsp;{item}</div>
                        ))}
                    </div>
                </div>
                <div className="other_param">
                    <div className="content">
                      <div className="discription"></div>
                          <Paragraph style={{color:"white",fontSize:"smaller"}}>
                            {this.state.discription}
                          </Paragraph>
                          <br/>
                          <img src={require("../../data/" + this.state.img_path)} alt="图片加载中"></img>
                        {/* <div className="local_burn">
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
                        {/* <div className="occupy_mode">
                           设备占用模式：
                           <Select value={this.state.occupy_mode} style={{ width: "100",marginTop:"5px"}} onChange={this.onOcupySelect}>
                              <Option value="queue">排队模式</Option>
                              <Option value="adhoc">独占模式</Option>
                            </Select>
                        </div>
                        <div style={{marginTop:"5px"}}>
                            预计运行时间：<InputNumber min={1} max={120} value={this.state.run_time} onChange={this.onTimeChange} style={{width:"60px"}}/>&nbsp;s
                        </div>  */}
                    </div>
                </div>
           </div>
           <div className="input_info">
              <div className="bottom_content">
                <div className="name_input">
                  Project Name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Input className="project_name" value={this.state.project_name} onChange={this.setProjectName}/>
                </div>
                 <div className="upload_file">
                    <div style={{float:"left"}}>Upload File: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><Input className="folder_name" value={this.state.upload_file}/>&nbsp;&nbsp;&nbsp;
                    <Upload>
                      <div className="file_icon"><i className="fa fa-folder-open fa-lg" aria-hidden="true"></i></div>
                    </Upload>          
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