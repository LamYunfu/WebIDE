/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
import { Row, Col } from 'antd';
import SystemDevelopment from './SystemDevelopment';
import ApplicationDevelopment from './ApplicationDevelopment';

export interface State{
    MainDisplay:string;
    SystemAppDisplay:string;
    ApplicationAppDisplay:string;
}

interface Props{

}
class Home extends React.Component<Props,State> {
  constructor(props: {} | Readonly<{}>){
    super(props);
    this.state={MainDisplay:"block", SystemAppDisplay:"none", ApplicationAppDisplay:"none"};
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
                <SystemDevelopment showMain = {this.showMain.bind(this)}/>
            </div>
            <div style={{display:this.state.ApplicationAppDisplay}}>
                <ApplicationDevelopment showMain = {this.showMain.bind(this)}/>
            </div>
            <div className="workspace" style={{display:this.state.MainDisplay}}>
            <div className="new_project">
                <Row gutter={[16, 16]}>
                    <Col xs={24}  md={12}  xl={8}>
                        <div className="System_project gutter_box" onClick={this.showSystemDevelop}>
                            <div className="plus_icon">
                                <i className="fa fa-plus" aria-hidden="true" style={{fontSize:"50px",marginLeft:"15px", marginTop:"12px",color:"#D3D5E0"}}></i>
                                {/* <PlusOutlined style={{fontSize:"50px",marginLeft:"10px", marginTop:"10px",color:"#D3D5E0"}}/> */}
                            </div>
                            <div className="new_title">
                                新建系统开发
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}  xl={8}>
                        <div className="app_project gutter_box" onClick={this.showApplicationDevelop}>
                            <div className="plus_icon">
                                <i className="fa fa-plus" aria-hidden="true" style={{fontSize:"50px",marginLeft:"15px", marginTop:"12px",color:"#D3D5E0"}}></i>
                            </div>
                            <div className="new_title">
                                新建应用开发
                            </div>
                        </div>   
                    </Col>
                </Row>
            </div>
            <div className="my_project">
                <span style={{fontSize:"15px"}}>我的工作空间</span>
            </div>
        </div>
        </div>
        
      );
    }
    
  }
  
  export default Home;