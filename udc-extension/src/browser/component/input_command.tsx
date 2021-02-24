import React = require("react");
import * as $ from "jquery"
// import { Select } from '@linkdesign/components';
// import styles from '../styles/index.less';
// const styles = require('../styles/index.less')
import {AutoComplete} from 'antd';
import {Select} from 'antd';
import { Input, Tooltip, Icon } from 'antd';
import { Popover, Button,List,Typography } from 'antd';
import { Menu, Dropdown ,message} from 'antd';
const { Option } = Select;
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";
import { AI1DOC, AI2DOC, AI3DOC, MODEL_DOWNLOAD_URL, AI4DOC, AI5DOC } from '../../setting/front-end-config'
import { LazyServiceIdentifer } from "inversify";
export namespace AI {
    export interface Props {
        title: string,
        outputResult: (res: string) => void
    }
    export interface State {
        dataSource,
        showLoadMore:boolean,
    }
}
export class InputView extends React.Component<AI.Props, AI.State> {
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = [];
    data = [
        'Racing car sprays burning fuel into crowd.',
        'Japanese princess to wed commoner.',
        'Australian walks 100km after outback crash.',
        'Man charged over missing wedding girl.',
        'Los Angeles battles huge wildfires.',
        'Racing car sprays burning fuel into crowd.',
        'Japanese princess to wed commoner.',
        'Australian walks 100km after outback crash.',
        'Man charged over missing wedding girl.',
        'Los Angeles battles huge wildfires.',
      ];
    content = (
        <div>
              <List
      dataSource={this.data}
      renderItem={item => (
        <List.Item>
          <Typography.Text mark>[ITEM]</Typography.Text> {item}
        </List.Item>
      )}
    />
        </div>
      );
    dataSource = ['dumpsys', 'dumpsys mm', 'dumpsys info', 'dumpsys mm_info', 'tasklist', 'dumpsys task', 'time', 'sysver', 'help'];
    constructor(props: Readonly<AI.Props>) {
        super(props);
        this.state = {
            dataSource: [
              { label: 'option1', value: 'option1' },
              { label: 'option2', value: 'option2' },
              { label: 'option3', value: 'option3' }
            ],
            showLoadMore: true,
            
          };
    }
    componentWillMount() {
        // this.context.props.setSize(520)
        let _this = this

    }

     handleButtonClick(e) {
        message.info('Click on left button.');
        console.log('click left button', e);
      }
      
       handleMenuClick(e) {
        message.info('Click on menu item.');
        console.log('click', e);
      }
      
    menu = (
        <Menu onClick={this.handleMenuClick}>
          <Menu.Item key="1">
            <Icon type="user" />
            1st menu item
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="user" />
            2nd menu item
          </Menu.Item>
          <Menu.Item key="3">
            <Icon type="user" />
            3rd item
          </Menu.Item>
        </Menu>


      );

    loadData = (resolve, reject) => {
        this.setState({
          dataSource: [
            { label: 'option1', value: 'option1' },
            { label: 'option2', value: 'option2' },
            { label: 'option3', value: 'option3' },
            { label: 'option4', value: 'option4' },
            { label: 'option5', value: 'option5' }
          ],
          showLoadMore: false
        });
        resolve();
      }

    public getValue():string {
        let vak = $("#input_text").val();
        return vak.toString();
    }

     handleChange(value) {
        console.log(`selected ${value}`);
        $("#input_text").val(value);
      }

      onChange(e) {
        console.log(e);
      };
      


    async componentDidMount() {
        let _this = this
        $("#submitSrcButton").click(() => {
            // _this.context.props.train(_this.props.section["ppid"][0])
        })
        $("#openDrawBoard").click(() => {
            // _this.context.props.openDrawBoard()
        })
        $("#usedCommnand").click(() => {
            // _this.context.props.openDrawBoard()
            // $("#list1").css("display", "block");
            // let sp = document.createElement("p")
            // sp.innerText ="1111111";
            // document.body.appendChild(sp);
            
            
        })

        $("#sendCommand").click(() => {
          let vak = $("#input_text").val();
          this.props.outputResult(vak.toString());
          $("#input_text").val('');
          alert(vak);  
        })
    }
    onPressEnter(e) {
        this.props.outputResult(e);
        alert(e);
        $("#input_text").val('');

    }

    render(): JSX.Element {
        return (
            <div style={{ width: "100%", height: "100%", background: '1c1c1c' }}>

                <datalist id="commands" title="常用命令" style={{height: "300px"}}>
                <option value="dumpsys" />
                <option value="dumpsys mm" />
                <option value="dumpsys info" />
                <option value="dumpsys mm_info" />
                <option value="tasklist" />
                <option value="dumpsys task" />
                <option value="time" />
                <option value="sysver" />
                <option value="help" />

                <option value="dumpsys" />
                <option value="dumpsys mm" />
                <option value="dumpsys info" />
                <option value="dumpsys mm_info" />
                <option value="tasklist" />
                <option value="dumpsys task" />
                <option value="time" />
                <option value="sysver" />
                <option value="help" />
                </datalist>
                {/* <button id="usedCommnand" style={{width: "160px", height:"50px", marginRight: "10px",  color: "blue", fontSize: "20px",marginTop: "2px", marginBottom:"15px",background:"white"}}>^常用命令</button> */}
                {/* <input id="usedCommnand" list= "commands" style={{width: "160px", height:"50px", marginRight: "10px",  color: "blue", fontSize: "20px",marginTop: "2px", marginBottom:"15px",background:"white"}}></input> */}
                {/* <input id="input_text" type="text" list= "commands" name="firstname" placeholder="请输入命令" style={{height: "50px", width: "400px", fontSize:"20px", color: "blue", marginRight: "20px", marginTop: "2px", marginBottom:"15px",background: "white"}}  />
                <button id="sendCommand"  style={{height: "50px", width: "80px", color: "blue", fontSize: "20px", alignItems: "center", alignSelf:"center", alignContent :"center", marginTop: "2px", marginBottom:"15px",background: "white"}} >发送</button> */}
                {/* <Select
                    visible = {true}
                    size={"large"}
                    dataSource={this.state.dataSource}
                    popupStyle={{height: "60px" ,width: "400px"}}
                    showLoadMore={false}
                    loadMore={() => {
                    const self = this;
                    const promise = new Promise((resolve, reject) => {
                        setTimeout(() => {
                        self.loadData(resolve, reject);
                        }, 3000);
                    });
                    }}
                    /> */}

                    <Select value="lucy" size = 'large'  style={{display: 'inline-block', width: 240, height: 40, marginRight: 30, marginTop:3, marginLeft: 20,  color:"white"}}  onChange={this.handleChange}>
                    
                          <Option value="dumpsys">dumpsys</Option>
                          <Option value="lucy" style={{display:'none'}}>常用命令</Option>
                          <Option value="dumpsys mm">dumpsys mm</Option>
                          <Option value="dumpsys info">dumpsys info</Option>
                          <Option value="dumpsys mm_info">dumpsys mm_info</Option>
                          <Option value="tasklist">tasklist</Option>
                          <Option value="dumpsys task">dumpsys task</Option>
                          <Option value="time">time</Option>
                          <Option value="sysver">sysver</Option>
                          <Option value="help">help</Option>
                          

                        </Select>
                    {/* <Popover content={this.content} title="Title" trigger="click" style={{ width: 180,height: 60, marginRight: 20}}>
                    <Button>Click me</Button>
                    </Popover> */}

                    
                    {/* <Dropdown overlay={this.menu} placement="topCenter" >
                    <Button style={{ width: '180px',height: '60px', marginRight: '20px'}}>
                        常用命令 <Icon type="up" />
                    </Button>
                    </Dropdown> */}
            
                    <Input id="input_text" size= 'small' placeholder="请输入命令" allowClear onChange={this.onChange} style={{ width: 400,height: 40, marginRight: '30px',fontSize: "20px",marginTop:3 , color: 'black'}} onPressEnter={this.onPressEnter}/>
                    <button id="sendCommand"  style={{height: 40, width: 80, color: "blue", fontSize: "20px", marginTop: 3,background: "#3c3c3c", borderRadius: 3}} >发送</button>
            </div>
        )
    }
}
InputView.contextType = MyContext