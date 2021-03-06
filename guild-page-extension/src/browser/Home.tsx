/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
import { Row, Col } from 'antd';
import {Tooltip} from 'antd';
import SystemDevelopment from './SystemDevelopment';
import ApplicationDevelopment from './ApplicationDevelopment';
import { WizardBackendService } from "../common/protocol";
import RecentWorkspace from "./RecentWorkspace";

export interface State{
    MainDisplay:string;
    SystemAppDisplay:string;
    ApplicationAppDisplay:string;
    projects:string []
    
}

interface Props{
    projectCreation:(config_json:string) => boolean;
    wbs:WizardBackendService
    openWorkspace:(st:string)=>void
    
}
class Home extends React.Component<Props,State> {
  constructor(props: Props | Readonly<Props>){
    super(props);
    this.state={MainDisplay:"block", SystemAppDisplay:"none", ApplicationAppDisplay:"none" ,projects:[]};
  }
  async componentDidMount(){
     let ps = await this.props.wbs.getProjects()
      this.setState({
          ...this.state,
          projects:ps
      })
  }
 
  showSystemDevelop = ()=>{
      this.setState({
          ...this.state,
          MainDisplay:"none", 
          SystemAppDisplay:"block", 
          ApplicationAppDisplay:"none"
      });
  }

  showApplicationDevelop = ()=>{
    this.setState({
        ...this.state,
        MainDisplay:"none", 
        SystemAppDisplay:"none", 
        ApplicationAppDisplay:"block"
    });
  }

  showMain = ()=>{
    this.setState({
        ...this.state,
        MainDisplay:"block", 
        SystemAppDisplay:"none", 
        ApplicationAppDisplay:"none"
    });
  }

 //设置project_name
  render(){
    return (
        <div>
            <div style={{display:this.state.SystemAppDisplay}}>
                <SystemDevelopment showMain = {this.showMain.bind(this)} projectCreation={this.props.projectCreation}/>
            </div>
            <div style={{display:this.state.ApplicationAppDisplay}}>
                <ApplicationDevelopment showMain = {this.showMain.bind(this)} projectCreation={this.props.projectCreation}/>
            </div>
            <div className="workspace" style={{display:this.state.MainDisplay}}>
            <div className="new_project">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}  xl={8}>
                        <div className="app_project gutter_box_app" onClick={this.showApplicationDevelop}>
                            <div className="plus_icon">
                                <i className="fa fa-plus" aria-hidden="true" style={{fontSize:"50px",marginLeft:"15px", marginTop:"12px",color:"#D3D5E0"}}></i>
                            </div>
                            <div className="new_title">
                                应用开发
                            </div>
                        </div>   
                    </Col>
                    <Col xs={24}  md={12}  xl={8}>
                    <Tooltip title="我还没上线呢~">
                        <div className="System_project gutter_box_system">
                            <div className="plus_icon">
                                <i className="fa fa-plus" aria-hidden="true" style={{fontSize:"50px",marginLeft:"15px", marginTop:"12px",color:"#D3D5E0"}}></i>
                                {/* <PlusOutlined style={{fontSize:"50px",marginLeft:"10px", marginTop:"10px",color:"#D3D5E0"}}/> */}
                            </div>
                            <div className="new_title">
                                系统开发
                            </div>
                        </div>
                    </Tooltip>
                    </Col>
                </Row>
            </div>
            <div  className="my_project">
                <span  style={{fontSize:"15px"}}>我的工作空间</span>              
            </div>
            <hr style={{backgroundColor:"#2D2D2D",border:"0px",height:"1px"}}/>
            <RecentWorkspace openWorkspace ={this.props.openWorkspace} ps={this.state.projects}></RecentWorkspace>
        </div>
        </div>
        
      );
      
    }
    renderRecentWorkspace(){
        return 
    }
  }
  
  export default Home;