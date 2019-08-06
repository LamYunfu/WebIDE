import React = require("react");
import URI from "@theia/core/lib/common/uri";
import { Experiment } from "./experiment-view"
import { Chapter } from './chapter-view'
import * as $ from "jquery"
export namespace View {
    export interface Props {
        getData: () => Promise<string>
        storeData: (data: string) => void
        connect: (loginType: string, model: string, pid: string) => void
        disconnect: () => void
        callUpdate: () => void
        openSrcFile: (uri: URI) => void
        postSrcFile: (fn: string) => void
        createSrcFile: (fns: string[]) => void
        setCookie: (cookie: string) => void
        gotoVideo: (uri: string, videoName: string) => void
        say: (verbose: string) => void
        outputResult: (res: string) => void
    }
    export interface State {
        ajaxNotFinish: boolean
    }
}
export class View extends React.Component<View.Props, View.State>{
    vid = ""
    type: string = ""
    title: string = ""
    ppid: string = ""
    sections: [{ [key: string]: string }] = [{}]
    renderView: JSX.Element = <div>loading</div>
    typeDataPool: { [key: string]: { [key: string]: {} } } = {}   /* 
    {
       type:
              {
                  chapter:{
                              section:{
                                    
                                          pid:{
                                                    ptype:
                                                  answer:
                                                  isRight:
                                              }
                                            }
                                       
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    */
    setChapterData = (vid: string, chapterData: {}) => {
        if (chapterData == {}) {
            console.log("null chapterData")
            return
        }
        this.typeDataPool[this.type][this.vid] = chapterData
    }
    componentWillMount() {
        let _this = this
        let x = this.props.getData()
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + x)
        x.then(res => {
            try {
                _this.typeDataPool = JSON.parse(res)
            } catch (error) {
                console.log("getData failure")

            }
            setInterval(() => {
                _this.props.storeData(JSON.stringify(_this.typeDataPool))
            }, 8000)
            $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "GET",
                    url: "http://api.tinylink.cn/user/info",
                    // processData: false,
                    dataType: 'json',
                    contentType: "text/plain",
                    data: "", // serializes the form's elements.
                    success: function (data) {
                        $(".userName").text(data.data.uname)
                        //alert(data.data.JSESSIONID)
                        _this.props.setCookie(data.data.JSESSIONID)
                    }
                }
            )
            $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "GET",
                    url: "http://api.tinylink.cn/view/active/detail",
                    dataType: 'json',
                    contentType: "text/plain",
                    data: '',
                    success: function (data) {
                        // let x = data.question.slice(0, 3)
                        console.log(JSON.stringify(data) + "****************************")
                        if (data.message != "success") {
                            console.log("INFO:GET VIEW DETAIL FAILED!!!!!!!!!!!!!!!!!!!!!!!!!")
                            return
                        }
                        _this.type = data.data.type
                        _this.vid = data.data.vid
                        if (_this.typeDataPool[_this.type] == undefined) {
                            _this.typeDataPool[_this.type] = {}
                        }
                        if (_this.typeDataPool[_this.type][_this.vid] == undefined) {
                            _this.typeDataPool[_this.type][_this.vid] = {}
                        }
                        console.log(`"VID:${_this.vid}!!!!!!!!!!!!!!!!!!!!!!!!!"`)
                        switch (_this.type) {
                            case "1": {
                                _this.sections = data.data.section
                                _this.title = data.data.title
                                _this.renderView = <div>
                                    <div>
                                        <h4> {_this.title} </h4>
                                        <hr />
                                        <Chapter
                                            vid={_this.vid}
                                            chapterData={_this.typeDataPool[_this.type][_this.vid]}
                                            setChapterData={_this.setChapterData}
                                            sections={_this.sections}
                                            outputResult={_this.props.outputResult}
                                            say={_this.props.say}
                                            gotoVideo={_this.props.gotoVideo}
                                            disconnect={_this.props.disconnect}
                                            connect={_this.props.connect}
                                            callUpdate={_this.props.callUpdate}
                                            createSrcFile={_this.props.createSrcFile}
                                            openSrcFile={_this.props.openSrcFile}
                                            postSrcFile={_this.props.postSrcFile}
                                        />
                                    </div>
                                </div>
                                break
                            }
                            case "2": {
                                _this.title = data.data.title
                                _this.ppid = data.data.ppid
                                console.log(`ppid.......................................${_this.ppid}`)
                                _this.renderView = <div>
                                    <div>
                                        <h4> {_this.title} </h4>
                                        <hr />
                                        <Experiment
                                            section={{ ppid: [_this.ppid], sid: "experiment" }}
                                            outputResult={_this.props.outputResult}
                                            say={_this.props.say}
                                            setCookie={_this.props.setCookie}
                                            disconnect={_this.props.disconnect}
                                            connect={_this.props.connect}
                                            callUpdate={_this.props.callUpdate}
                                            createSrcFile={_this.props.createSrcFile}
                                            openSrcFile={_this.props.openSrcFile}
                                            postSrcFile={_this.props.postSrcFile}
                                        />
                                    </div>
                                </div>
                                break
                            }
                        }
                        _this.setState((state) => ({
                            ajaxNotFinish: false
                        }))

                    }
                }
            )


        })



        this.setState((state) => ({
            ...state,
            ajaxNotFinish: true
        }))

    }
    componentDidMount() {


    }


    render(): JSX.Element {
        return this.state.ajaxNotFinish ? this.renderView : this.renderView
    }
}
