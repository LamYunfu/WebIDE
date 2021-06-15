import React = require("react");
import {Input,Button} from 'antd';
//const { Paragraph } = Typography;
export namespace ProjectView {
    export interface Props {
       projectCreation: (config_json: string, otherConfig: string)=>void
    }
    export interface State{
        os_type:string[];
        branch:string[];
        local_burn:string;
        occupy_mode:string;
        project_name:string;
        run_time:number;
        first_menu_num:number;
        second_menu_num:number;
        a_color:boolean[];
        b_color:boolean[];
        c_color:boolean[];
        // discription:string;
        // img_path:string;
    }
}
//const { Option } = Select;

export class ProjectView extends React.Component<ProjectView.Props,ProjectView.State>{

    constructor(props: Readonly<ProjectView.Props>){
        super(props);
        this.state={
            os_type : ["stm32_gcc"], 
            branch: ["stm32-std", "stm32-hal"],
            local_burn:"support", 
            occupy_mode:"queue",
             project_name:"",
             run_time:120, 
             first_menu_num:0, 
             second_menu_num:0,
             //false代表对应位置不被激活，true代表对应位置被激活，将背景颜色进行改变
             a_color:[false, false, false, false, false, false, false, false, false, false],
             b_color:[false, false, false, false, false, false, false, false, false, false],
             c_color:[false, false, false, false, false, false, false, false, false, false],
        };
    }
    componentWillMount() {
        
    }

    board_type = ["STM32F103C8"];
    board_click = 0;
    os_type = [["stm32_gcc"]];
    os_click = 0;
    branch_arr = [[["stm32-std", "stm32-hal"]]];
    branch_click = 0;
    
    config_json = {
      "version": "1.0.0",
      "usage": "queue",                       //和burnType同属于设备占用方式
      "hexFileDir": "hexFiles",
      "serverType": "STM32F103C8",           //和model同属于device_type
      "osType":"stm32_gcc",
      "branch":"stm32-std",
      "projects": [{
        "projectName": "test",
        "compileType": "stm32-std",
        "boardType": "STM32F103C8",
        "burnType": "queue",
        "program": {
          "model": "STM32F103C8",
          "runtime": 120,
          "address": "0x1000"
        }
      }]
    };
  
    config_json_default = {
      "version": "1.0.0",
      "usage": "queue",                       //和burnType同属于设备占用方式
      "hexFileDir": "hexFiles",
      "serverType": "STM32F103C8",           //和model同属于device_type
      "osType":"stm32_gcc",
      "branch":"stm32-std",
      "projects": [{
        "projectName": "test",
        "compileType": "stm32-std",
        "boardType": "STM32F103C8",
        "burnType": "queue",
        "program": {
          "model": "STM32F103C8",
          "runtime": 120,
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
        //更改被点击者背景颜色
        let tmp_color:boolean[] = [];
        for(let i = 0; i < this.board_type.length;i++){
          tmp_color[i] = false;
        }
        tmp_color[value] = true;

        this.board_click = value;
        this.setState({
          ...this.state,
          os_type :_this.os_type[value],
          first_menu_num: value,
          a_color: tmp_color,
         // discription: ""
        });
        //设置相关参数
        this.config_json.serverType = this.board_type[value];
        this.config_json.projects[0].program.model = this.config_json.serverType;
        this.config_json.projects[0].boardType = this.config_json.projects[0].program.model;
    }
      
    // 二级菜单目录点击选择
    onCompileClick = (value:any, e:any) => {
        let tmp_color:boolean[] = [];
        for(let i = 0; i < this.os_type[this.board_click].length;i++){
          tmp_color[i] = false;
        }
        tmp_color[value] = true;
        this.os_click = value;
        this.config_json.osType = this.state.os_type[value];
        //默认分支是第一个
        this.config_json.branch = this.branch_arr[this.state.first_menu_num][value][0];
        this.setState({
          ...this.state,
          second_menu_num:value,
          branch: this.branch_arr[this.state.first_menu_num][this.state.second_menu_num],
          b_color:tmp_color
        })
    }

    //分支选择
    onBranchClick = (value:any, e:any) => {
        this.config_json.branch = this.state.branch[value];
        this.config_json.projects[0].compileType = this.config_json.branch;
        let tmp_color:boolean[] = [];
        for(let i = 0; i < this.branch_arr[this.board_click][this.os_click].length;i++){
          tmp_color[i] = false;
        }
        tmp_color[value] = true;
        this.setState({
          ...this.state,
          c_color:tmp_color
        })
    }
     //恢复默认配置和设置project名称为空
     restortState=()=>{
       this.setState({
        ...this.state,
        local_burn:"support",
        occupy_mode:"queue", 
        project_name:"",
        run_time:120, 
        first_menu_num:0, 
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
         run_time:120,
         os_type : ["stm32_gcc"], 
         branch: ["stm32-std", "stm32-hal"],
         first_menu_num:0,
         second_menu_num:0,
         a_color:[false, false, false, false, false, false, false, false, false, false],
         b_color:[false, false, false, false, false, false, false, false, false, false],
         c_color:[false, false, false, false, false, false, false, false, false, false],
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
          {/* <div className="title"> <i className="fa fa-window-restore" aria-hidden="true" style={{color:"green"}}></i>&nbsp;&nbsp;System Development</div> */}
           <div className="select_info">
                <div className="device_type">
                  <div style = {{fontSize: "medium", marginTop:"13px", marginLeft:"15px", color:"orange"}}>Board Type</div>
                  <div></div>
                  <div className="content">
                       <div className="device_select" onClick={this.onDeviceClick.bind(this,0)} style={{backgroundColor:this.state.a_color[0]?"#4B6EAF":"#2D2D30"}}><i className="fa fa-product-hunt" aria-hidden="true" style={{color:"#BC1042"}}></i>&nbsp;&nbsp;STM32F103C8</div> 
                  </div>
                </div>
                <div className="compile_type" >
                    <div className="content compile" >
                        {/* <Compile compile={this.state.compile}/> */}
                        <div style = {{color:"orange"}}>Libraries</div>
                        {this.state.os_type.map((item,num) =>(
                            <div className="item" key={num} tabIndex={num} style={{marginTop:"5px",marginLeft:"10px",position:"relative", backgroundColor:this.state.b_color[num]?"#4B6EAF":"#252526"}} onClick={this.onCompileClick.bind(this,num)}><i className="fa fa-file-code-o" aria-hidden="true" style={{color:"#D8AC6A"}}></i>&nbsp;&nbsp;{item}</div>
                        ))}
                    </div>
                </div>
                <div className="other_param">
                    <div className="content">
                      {/* <div className="discription"></div> */}
                          <div style = {{color:"orange"}}>Branch</div>
                          {this.state.branch.map((item,num) =>(
                            <div className="item" key={num} tabIndex={num} style={{marginTop:"5px",marginLeft:"10px",position:"relative", backgroundColor:this.state.c_color[num]?"#4B6EAF":"#2D2D30"}} onClick={this.onBranchClick.bind(this,num)}><i className="fa fa-hand-o-rightfa fa-hand-o-right" aria-hidden="true" style={{color:"DeepSkyBlue"}}></i>&nbsp;&nbsp;{item}</div>
                          ))}
                    </div>
                </div>
           </div>
           <div className="input_info">
              <div className="bottom_content">
                <div className="name_input">
                  <div style={{ float:"left"}}>Project Name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><Input className="project_name" style={{ float:"left", width:"85%"}} value={this.state.project_name} onChange={this.setProjectName}/>
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