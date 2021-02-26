/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
import WorkSpace from './Workspace';
import Setting from './Setting';
import {Menu} from 'antd';  
import { HashRouter as Router, Link, Route} from "react-router-dom";
//import ApplicationDevelopment from './ApplicationDevelopment';
//import SystemDevelopment from './SystemDevelopment';

export interface State{
  collapsed:boolean
}

interface Props{

}
class Haas extends React.Component<Props,State> {
  constructor(props: {} | Readonly<{}>){
    super(props);
    this.state={collapsed: false};
  }
 
 //设置project_name
  render(){
    return (
      <div className="Haas">
          <Router>
          <div className="left_panel">
            <div className="studio_name">
              HaasLab
            </div>
            {/* <div className="workspace">
                <div className="left_word">
                  工作空间
                </div>
            </div>
            <div className="setting">
                <div className="left_word">
                  设置
                </div>
            </div> */}     
              <Menu
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="dark"
                inlineCollapsed={this.state.collapsed}
                style={{backgroundColor:"#2F3033"}}
              >
                <Menu.Item key="workspace">
                  <Link to="/WorkSpace">工作空间</Link>
                </Menu.Item>
                <Menu.Item key="setting">
                  <Link to="/Setting"> 设置</Link>
                </Menu.Item>
              </Menu>          
          </div>
          <div className="main_panel">
              <Route path="/WorkSpace" exact render={() => <WorkSpace></WorkSpace>}></Route>
              <Route path="/Setting" component={Setting}></Route>
          </div> 
          </Router>  
      </div>
    );
  }
  
}

export default Haas;
