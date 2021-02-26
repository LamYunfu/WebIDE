/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
import { HashRouter as Router, Route} from "react-router-dom";
import SystemDevelopment from './SystemDevelopment';
import ApplicationDevelopment from './ApplicationDevelopment';
import Home from './Home';
export interface State{
  
}

interface Props{

}
class WorkSpace extends React.Component<Props,State> {
  constructor(props: {} | Readonly<{}>){
    super(props);
    this.state={}; 
  }
 
 //设置project_name
  render(){
    return (
        <Router >
            <div className="workspace_title"> 
                工作空间
            </div>
            <hr style={{backgroundColor:"#2D2D2D",border:"0px",height:"1px"}}/>
            <div>
                <Route path="/" component={Home} />
                <Route path="/SystemDevelopment" component={SystemDevelopment} />
                <Route path="/ApplicationDevelopment" component={ApplicationDevelopment} />
            </div>
        </Router>
      );
    }
    
  }
  
  export default WorkSpace;