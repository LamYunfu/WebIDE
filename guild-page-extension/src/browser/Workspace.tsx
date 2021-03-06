/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
import { HashRouter as Router} from "react-router-dom";
import { WizardBackendService } from "../common/protocol";
// import SystemDevelopment from './SystemDevelopment';
// import ApplicationDevelopment from './ApplicationDevelopment';
import Home from './Home';
export interface State{

}

interface Props{
  projectCreation:(config_json:string) => boolean;
  wbs :WizardBackendService
  openWorkspace:(st:string) =>void
}
class WorkSpace extends React.Component<Props,State> {
  constructor(props: Props | Readonly<Props>){
    super(props);
    this.state={
      projects :[]
    }; 
  }
componentWillMount(){
  console.log("------get projects front end ")
  let ps =this.props.wbs.getProjects()
 this.setState({
   ... this.state,
   projects:ps

 })
}
 //设置project_name
  render(){
    return (
        <Router >
            <div className="workspace_title"> 
                工作空间
            </div>
            <hr style={{backgroundColor:"#2D2D2D",border:"0px",height:"1px"}}/>
            <Home openWorkspace={this.props.openWorkspace} wbs={this.props.wbs} projectCreation={this.props.projectCreation}/>
            {/* <div>
                <Route path="/" component={Home} />
                <Route path="/SystemDevelopment" component={SystemDevelopment} />
                <Route path="/ApplicationDevelopment" component={ApplicationDevelopment} />
            </div> */}
            
        </Router>
      );
    }
  }
  
  export default WorkSpace;