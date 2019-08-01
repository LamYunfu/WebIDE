import React = require("react");
import URI from "@theia/core/lib/common/uri";
import { Experiment } from "./experiment-view"
import { Chapter } from './chapter-view'
import * as $ from "jquery"
export namespace View {
    export interface Props {
        connect: (pid: string) => void
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
    vid: string = ""
    title: string = ""
    ppid: string = ""
    sections: [{ [key: string]: string }] = [{}]
    renderView: JSX.Element = <div>loading</div>
    componentWillMount() {
        let _this = this
        this.setState((state) => ({
            ...state,
            ajaxNotFinish: true
        }))
        $.ajax(
            {
                headers: {
                    "accept": "application/json",
                },
                xhrFields: {
                    withCredentials: true
                },
                method: "POST",
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
                    _this.vid = data.data.vid
                    console.log(`"VID:${_this.vid}!!!!!!!!!!!!!!!!!!!!!!!!!"`)
                    switch (_this.vid) {
                        case "1": {
                            _this.sections = data.data.section
                            _this.title = data.data.title
                            _this.renderView = <div>
                                <div>
                                    <h4> {_this.title} </h4>
                                    <hr />
                                    <Chapter
                                        sections={_this.sections}
                                        outputResult={_this.props.outputResult}
                                        say={_this.props.say}
                                        gotoVideo={_this.props.gotoVideo}
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

    }
    render(): JSX.Element {
        return this.state.ajaxNotFinish ? this.renderView : this.renderView
    }
}
