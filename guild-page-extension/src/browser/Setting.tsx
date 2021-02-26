/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
// import { Link } from "react-router-dom";

export interface State{
  
}

interface Props{

}
class Setting extends React.Component<Props,State> {
  constructor(props: {} | Readonly<{}>){
    super(props);
    this.state={};
  }
 
 //设置project_name
  render(){
    return (
      <div className="setting">
          设置
      </div>
      );
    }
    
  }
  
  export default Setting;