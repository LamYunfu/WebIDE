import React = require("react");
import { MyContext } from "./context";
//import { ModelTestAddress, VOICE_RECOGNIZE_URL } from "../settings/aiconfig";
export namespace View {
    export interface Props {
       dotData: number[][];
       onRef: (ref:any)=> void;
    }
    export interface State{
        dotData: number[][];
    }
}
export class View extends React.Component<View.Props,View.State>{

    constructor(props: Readonly<View.Props>){
        super(props);
        this.state={
            dotData: []
        }
    }
    componentWillMount() {
        this.props.onRef(this);
        let dotDataTmp:number[][] = new Array(32);
        for(let i = 0;i < 32;i++){
            dotDataTmp[i] = new Array(128);
            for(let j = 0;j < 128;j++){
                dotDataTmp[i][j] = 0;
            }
        }
        let _this = this;
        _this.setState({
            ..._this.state,
            dotData:dotDataTmp
        });
    }

    async  componentDidMount() {
        // alert( await  this.props.getData())
        const script = document.createElement("script", {
        });
        script.async = true;
        
    //     script.innerHTML = `
    //     var container=document.getElementById("Test"); //获取容器div的引用
    //     var _table=document.createElement("table"); //创建表格对象
    //     _table.setAttribute("border","1");//设置表格属性
    //     _table.setAttribute("cellspacing","0");
    //     _table.setAttribute("cellpadding","0");
    //     _table.setAttribute("id","lcdbox");
    //     _table.setAttribute("height","64px");
    //     _table.setAttribute("width", "256px");
    //     _table.setAttribute("bordercolor", "#3D543E");
    //     _table.setAttribute("overflow", "hidden");
    //     for(var r=0;r<32;r++)//创建行
    //     {
    //         var _tr=_table.insertRow(r);
    //         // console.log(r);
    //         _tr.setAttribute("border", "none");
    //         for(var d=0;d<128;d++)//创建列
    //         {
    //             var _td=_tr.insertCell(d);
    //             _td.setAttribute("border", "none");
    //             if(data[r][d] == 0){
    //                 _td.setAttribute("bgcolor",bg_color);
    //             }
    //             else{
    //                 console.log(1);
    //                 _td.setAttribute("bgcolor",dot_color); 
    //             } 
    //         }
    //     }
    //     container.appendChild(_table); //将表格显示于页面
    
    // //    $(function(){
    // //        $("#form1").ajaxForm(function(data){
    // //            console.log(data);   
    // //        })
    // //    })
    //     `;
            
       
    //     document.head.appendChild(script);
       
    }

    setDotData = (data: number[][]) => {
        console.log("已经进入组件内部了222！");
        this.setState({
            dotData:data
        })
    }

    render(): JSX.Element {
        return (
            <div>
                 <img src={require("../../data/grove-lcd-rgb-backlight.png")} height="205px" width="354px" style={{float: "left"}}/>
                <div id="Test" style={{position: "absolute", top: "51px", left: "38px"}}>
                    <table id="lcdbox" style={{border: "1", height:"64px", width:"256px", borderColor:"#3D543E", overflow:"hidden"}} cellSpacing="0" cellPadding="0">
                        {
                            this.state.dotData.map((row, index) =>{
                                return (
                                    <tr key = {index} style={{border:"none"}}>
                                        {
                                            row.map(
                                                (cell, index) =>{
                                                    let color = cell == 0 ? "#3D543E" : "black";
                                                    return <td style={{border: "none", backgroundColor: color}}></td>
                                                }
                                            )
                                        }
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
            </div>
           
        )
    }
 }
View.contextType = MyContext