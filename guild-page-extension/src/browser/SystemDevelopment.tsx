/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
// import { Link } from "react-router-dom";
import { Row, Col, Radio, Button} from 'antd';
export interface State{
    //记录用户选择的开发板
  boradChecked:string[]
    //是否选用默认仓库的标志
  repAddressShow:boolean
}

interface Props{
    showMain: ()=>void
}
class SystemDevelopment extends React.Component<Props,State> {
    constructor(props: Props | Readonly<Props>){
        super(props);
        this.state={boradChecked:["#2BD37D"], repAddressShow:true};
      }
     
      //配置json文件
      config_json = {
        "project_name": "",            //项目名称
        "discription": "",             //项目描述
        "boardType": "haas100",        //开发板类型
        "code_source":"default"        //代码来源
      };
    
      boardCheckedArr:string[] = ["white"];
      selectBoard = (num:any)=>{
            this.boardCheckedArr[num] === "white" ? (this.boardCheckedArr[num] = "#2BD37D") : (this.boardCheckedArr[num] = "white");
            this.setState({
                ...this.state,
                boradChecked:this.boardCheckedArr
            });
      }
    
      selectCodeSource = (e:any) => {
          //设置仓库输入位置是否可见
          if(e.target.value === "empty"){
            this.setState({
                ...this.state,
                repAddressShow:false
            });
          }else{
            this.setState({
                ...this.state,
                repAddressShow:true
            });
          }
      }
    
      //返回主界面
      returnMain = () =>{
          this.props.showMain();
      }
    
      //设置project_name
      setProjectName = (e:any)=>{
        this.config_json.project_name = e.target.value;
      }
    
    //设置discription
    setDescription = (e:any)=>{
        this.config_json.discription = e.target.value;
    }
    
    //设置template
    setCodeSourceSource = (value:any) => {
        this.config_json.code_source = value;
    }
    
    //点击提交
    submit = ()=>{
        //检查是否勾选
        if(this.config_json.project_name === ""){
            alert("请填写project name！");
            return;
        }else if(this.config_json.discription === ""){
            alert("请填写描述！");
            return;
        }else if(this.config_json.boardType === ""){
            alert("请选择开发板类型！")
        }else{
            alert(JSON.stringify(this.config_json));
        }
    }
     //设置project_name
      render(){
        return (
            <div>
                <div className="system">  
                    <div>
                        <span style={{float:"left"}}>Project Name: </span>
                        <div style={{marginLeft:"20px",float:"left",width:"80%"}}>
                            <input className="project_name" placeholder="请输入项目名称" onChange={this.setProjectName}/>
                            <div className="project_name_hint">只能由数字、字母、下划线(_)、中划线(-)、点(.)组成</div>
                        </div>
                    </div>
                    <div style={{marginTop:"30px"}}>
                        <span style={{float:"left"}}>描述 </span>
                        <div style={{marginLeft:"78px",float:"left",width:"80%"}}>
                            <textarea className="discription" placeholder="简要描述一下这个项目的功能" onChange={this.setDescription}/>
                        </div>
                    </div>
                    <div style={{marginTop:"25px"}}>
                        <span style={{float:"left"}}>开发板 </span>
                        <div style={{marginLeft:"64px",float:"left",width:"80%"}}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24}  md={12}  xl={6}>
                                <div className="board gutter_box"  onClick={this.selectBoard.bind(this, 0)}>
                                    <div className="board_discription">
                                        <div>
                                            <i className="fa fa-jsfiddle" aria-hidden="true" style={{color:"#FF6900", fontSize:"35px", float:"left"}}></i>
                                            <div className="board_name">
                                                HaaS 100开发板
                                            </div>
                                            <i className="fa fa-check-circle-o" aria-hidden="true" style={{float:"right",marginRight:"10px", fontSize:"22px", color: this.state.boradChecked[0]}}></i>
                                        </div>
                                        <div className="board_discription">
                                            内置AliOS操作系统
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        </div>
                    </div>
                    <div style={{marginTop:"25px"}}>
                        <span style={{float:"left"}}> 代码来源 </span>
                        <div className="codeSource">
                            <div style={{marginLeft:"50px"}}>
                                <Radio.Group onChange={this.selectCodeSource} defaultValue={"empty"}>
                                    <Radio value={"repository"} style={{color:"white"}}>仓库</Radio>
                                    <Radio value={"empty"} style={{color:"white", marginLeft:"40px"}}>默认</Radio>
                                </Radio.Group>
                            </div>
                            <div style={{display: this.state.repAddressShow?"block":"none"}}>
                                <div style={{marginLeft:"110px", marginTop:"10px", float:"left",width:"80%"}}>
                                    <input className="repository_address" placeholder="请输入Git仓库地址" onChange={this.setCodeSourceSource}/>
                                    <div className="project_name_hint">HTTPS只能克隆公有仓库</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{marginTop:"15px", marginLeft:"110px"}}>
                        <Button type="primary" className="create_button" onClick={this.submit}>创建</Button>
                        <Button className="cancel_button" style={{marginLeft:"30px", backgroundColor:"#232325", color:"white", borderColor:"#4A4C51"}} onClick={this.returnMain}>返回</Button>
                    </div>
                </div>
            </div>
          
          );
        }
  }
  
  export default SystemDevelopment;