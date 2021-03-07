/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
// import { Link } from "react-router-dom";
import { Row, Col, Button, Select} from 'antd';
// import { Link } from "react-router-dom";
import {Tooltip} from 'antd';
import {
    VIEW_DETAIL_URL
  } from "udc-extension/lib/setting/front-end-config";

const { Option } = Select;

export interface State{
  //记录用户选择的开发板
  boradChecked:string[]
    //是否选用默认仓库的标志
  repAddressShow:boolean
}

interface Props{
    showMain: ()=>void
    projectCreation:(config_json:string) => boolean;
}
class ApplicationDevelopment extends React.Component<Props,State> {
    constructor(props:Props | Readonly<Props>){
        super(props);
        this.state={boradChecked:["#2BD37D"], repAddressShow:true};
        }
    
        //配置json文件
        config_json = {
            "project_name": "",            //项目名称
            "discription": "",             //项目描述
            "boardType": "haas100",        //开发板类型
            "template": "defalut",         //模板类型
            
        };

        boardCheckedArr:string[] = ["white"];
        selectBoard = (num:any)=>{
            this.boardCheckedArr[num] === "white" ? (this.boardCheckedArr[num] = "#2BD37D") : (this.boardCheckedArr[num] = "white");
            this.setState({
                ...this.state,
                boradChecked:this.boardCheckedArr
            });
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
        setTemplate = (value:any) => {
            this.config_json.template = value;
        }
    
        //点击提交
        submit = async ()=>{
            //检查是否勾选
            if(this.config_json.project_name === ""){
                alert("请填写project name！");
                return;
            }else if(this.config_json.discription === ""){
                alert("请填写描述！");
                return;
            }else if(this.config_json.boardType === ""){
                alert("请选择开发板类型！")
                return;
            }

            //创建新的同名文件夹
            const vid_value = this.config_json.template;
            console.log(`vid is ${vid_value}!!!!!!!!`);
            const data = {vid:vid_value}
            await  fetch("http://api.tinylink.cn/user/view/activate", {
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify(data),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })

            // $.ajax({
            //     headers: {
            //     accept: "application/json",
            //     },
            //     //crossDomain: true,
            //     xhrFields: {
            //     withCredentials: true,
            //     },
            //     method: "GET",
            //     url: VIEW_DETAIL_URL, //请求用户信息，用于记录日志和统计用户信息
            //     // processData: false,
            //     dataType: "json",
            //     contentType: "text/plain",
            //     data: "", // serializes the form's elements.
            //     success: function(data) {
            //     console.log("success!!!!!!!!!!!!!!!!!!!!!!");
            //     console.log(`current project name is:${data.data.title}!!!!!!!!!!!!!!`);
            //     this.config_json.project_name =data.data.title;
            //     },
            //     error: function(e){
            //     alert(arguments[1]);
            //     console.log("return error !!!!!!!!!!!!!!!!!");
            // }
            // });

            await fetch(VIEW_DETAIL_URL,{
                credentials: 'include',
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })}).then(async (res)=>{
                    const json= await res.json()
                    try {
                    console.log(`current project name is:${json.data.title}!!!!!!!!!!!!!!`);
                    this.config_json.project_name =json.data.title;
                    } catch (error) {
                        console.log("create experiment failed");
                    }
                });
    
            let _this = this;
            this.props.projectCreation(JSON.stringify(_this.config_json));
        }

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
                                            {/* <AliyunOutlined style={{color:"#FF6900", fontSize:"35px", float:"left"}}></AliyunOutlined> */}
                                            <i className="fa fa-jsfiddle" aria-hidden="true" style={{color:"#FF6900", fontSize:"35px", float:"left"}}></i>
                                            <div className="board_name">
                                                HaaS 100开发板
                                            </div>
                                            <i className="fa fa-check-circle-o" aria-hidden="true" style={{float:"right",marginRight:"10px", fontSize:"22px", color: this.state.boradChecked[0]}}></i>
                                            {/* <CheckCircleFilled style={{float:"right",marginRight:"10px", fontSize:"22px", color: this.state.boradChecked[0]}}/> */}
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
                        <span style={{float:"left"}}>应用模板 </span>
                        <Tooltip title="不同的模版项目只能有一个">
                        <Select defaultValue="default" style={{ width: "150px", marginLeft:"50px", backgroundColor:"#2F3033", height:"33px", border:"1px solid #4A4C51"}} onChange={this.setTemplate}>
                            <Option value="default">默认模板</Option>
                            <Option value="200">亮灯交互</Option>
                            <Option value="201">LinkKit实验</Option>
                        </Select>
                        </Tooltip>
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
  
  export default ApplicationDevelopment;