import React = require("react");
import * as $ from "jquery"
import { Select } from '@linkdesign/components';
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
        showLoadMore:boolean
    }
}
export class InputView extends React.Component<AI.Props, AI.State> {
    pidQueueInfo: { [pid: string]: {} } = {};
    pids: string[] = []
    codingItems: JSX.Element[] = []
    constructor(props: Readonly<AI.Props>) {
        super(props);
        this.state = {
            dataSource: [
              { label: 'option1', value: 'option1' },
              { label: 'option2', value: 'option2' },
              { label: 'option3', value: 'option3' }
            ],
            showLoadMore: true
          };
    }
    componentWillMount() {
        // this.context.props.setSize(520)
        let _this = this

    }

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


    async componentDidMount() {
        let _this = this
        if(this.props.title == "韩信点兵"){
            $("#aiDSP").attr("src", AI4DOC)
        }
        else if(this.props.title=="体重指数计算器"){
            $("#aiDSP").attr("src", AI5DOC)
        }
        else if (this.props.title == "画板数字识别")
            $("#aiDSP").attr("src", AI1DOC)
        else if (this.props.title == "图像人脸识别")
            $("#aiDSP").attr("src", AI2DOC)
        else if (this.props.title == "相机人脸识别") {
            $("#aiDSP").attr("src", AI3DOC)
            let sp = document.createElement("script")
            sp.innerHTML = `
            db = document.getElementById("downloadButton")         
            db.addEventListener("click", wrap = function () {
            console.log("click download button")
            connection = new WebSocket("ws://localhost:8240")
            // connection = new WebSocket("${MODEL_DOWNLOAD_URL}")
            connection.onopen = async () => {                        
                                    content = "{download,0,0}"
                                    connection.send(content)
                                    connection.onmessage = async (mesg) => {
                                                                link = document.getElementById("downloadlink")
                                                                file = mesg.data.split(",").pop().split("}")[0]                                         
                                                                link.href = "data:application/octet-stream;base64,"+file
                                                                link.download = "model.zip";
                                                                link.click()
                                                            }               
                                 }
            })
            `
            document.head.appendChild(sp)

        }
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

    render(): JSX.Element {
        return (
            <div style={{ width: "100%", height: "100%", background: 'white' }}>
                {/* <h5 id="titleAndStatus" className="card-title" style={{ display: "" }}>
                    <span id={"coding_title"}>{this.props.title}</span>
                </h5>
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'darkgray',
                }}>
                    <iframe id="aiDSP" src="" style={{
                        width: " 100%",
                        height: '100%',
                        borderWidth: '0',
                        background: 'darkgray',
                        paddingBottom: "50px",
                    }}></iframe>
                </div>

                <a id="downloadlink" style={{ "display": "none" }}></a>
                {this.props.title == "韩信点兵"||this.props.title == "体重指数计算器"?<div>
                    <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"submitSrcButton"}>提交</button></span>
                </div> :this.props.title != "相机人脸识别"? <div>
                    <span style={{ position: "absolute", left: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"openDrawBoard"}>开关画板</button></span>
                    <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"submitSrcButton"}>提交</button></span>
                </div> :
                    // <span style={{ position: "absolute", right: "30px", bottom: "15px" }}><button className="btn btn-primary" id={"downloadButton"}>下载</button></span>
                    <div />
                } */}
                {/* <h5>
                    <span>我就是我，是不一样的烟火</span>
                </h5> */}
                    {/* <span id="list1" style={{ display: "none" }}>
                    <dl>
                        <dt>Coffee</dt>
                        <dt>Black hot drink</dt>
                        <dt>Milk</dt>
                        <dt>White cold drink</dt>
                    </dl>
                    </span> */}

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
                <Select
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
                    />
            </div >
        )
    }
}
InputView.contextType = MyContext