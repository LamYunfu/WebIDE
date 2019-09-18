import React = require("react");
import URI from "@theia/core/lib/common/uri";
import { Experiment } from "./experiment-view"
import { Chapter } from './chapter-view'
import { Scene } from './scene-view'
import * as $ from "jquery"
import { MyContext } from './context'
export namespace View {
    export interface Props {
        getData: (type: string) => Promise<string>
        storeData: (data: string) => void
        connect: (loginType: string, model: string, pid: string, timeout: string) => void
        disconnect: () => void
        callUpdate: () => void
        openSrcFile: (uri: URI) => void
        postSrcFile: (fn: string) => void
        setCookie: (cookie: string) => void
        gotoVideo: (uri: string, videoName: string) => void
        say: (verbose: string) => void
        outputResult: (res: string) => void
        setSize: (size: number) => void
        setQueue: () => void
        closeTabs: () => void
        initPidQueueInfo(infos: string): Promise<string>
        openShell: () => void
        setTinyLink: (name: string, passwd: string) => void
        config: () => void
        setLocal: (key: string, obj: object) => void
        getLocal: (key: string, obj: object) => object
        programSingleFile: (pidAndFn: string) => void
    }
    export interface State {
        ajaxNotFinish: boolean,
        optionDescription: string,
        optionChoicesDecription: JSX.Element[],
        sid: string,
        pid: string,
        viewType: string,
        scid: string,
        sidArray: string[]
    }
}
export class View extends React.Component<View.Props, View.State>{
    constructor(props: Readonly<View.Props>) {
        super(props)
        this.state = {
            optionChoicesDecription: [],
            optionDescription: "",
            ajaxNotFinish: true,
            sid: "",
            pid: "",
            viewType: "",
            scid: "",
            sidArray: []
        }
    }
    vid = ""
    type: string = ""
    title: string = ""
    ppid: string = ""
    sections: [{ [key: string]: string }] = [{}]
    renderView: JSX.Element = <div>**</div>
    typeDataPool: { [key: string]: { [key: string]: {} } } = {}
    answerPool: { [section: string]: { [index: string]: { "uAnswer": string | undefined, "isRight": boolean | undefined } } } = {}
    questionPool: { [section: string]: any } = {}
    /* 
   
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
    setAnswerPool = (section: string, index: string, data: any) => {
        let _this = this
        let tmp: {
            [key: string]: any
        } = {}
        tmp[index] = data
        _this.answerPool[section] = {
            ...this.answerPool[section]!,
            ...tmp
        }
        // alert(JSON.stringify(_this.answerPool))
    }

    setOptionDescription = (ds: string) => {
        let _this = this
        _this.setState(({
            ..._this.state,
            optionDescription: ds,
        }))
    }
    setOptionChoicesDescription = (dss: JSX.Element[]) => {
        let _this = this
        _this.setState(({
            ..._this.state,
            optionChoicesDecription: dss
        }))
    }

    setChapterData = (vid: string, chapterData: {}) => {
        if (chapterData == {}) {
            console.log("null chapterData")
            return
        }
        this.typeDataPool[this.type][this.vid] = chapterData
    }
    componentWillMount() {

        let _this = this
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
                    // alert(data.data.JSESSIONID)
                    _this.props.setTinyLink(data.data.tinyId, data.data.tinyPasswd)
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
                success: async function (data) {
                    // let x = data.question.slice(0, 3)
                    console.log(JSON.stringify(data) + "****************************")
                    if (data.message != "success") {
                        console.log("INFO:GET VIEW DETAIL FAILED!!!!!!!!!!!!!!!!!!!!!!!!!")
                        return
                    }
                    _this.type = data.data.type
                    _this.vid = data.data.vid
                    setInterval(() => {
                        _this.props.storeData(JSON.stringify(_this.typeDataPool))
                    }, 8000)
                    if (_this.typeDataPool[_this.type] == undefined) {
                        _this.typeDataPool[_this.type] = {}
                    }
                    if (_this.typeDataPool[_this.type][_this.vid] == undefined) {
                        _this.typeDataPool[_this.type][_this.vid] = {}
                    }
                    console.log(`"VID:${_this.vid}!!!!!!!!!!!!!!!!!!!!!!!!!"`)
                    switch (_this.type) {
                        case "4":
                        case "1": {//章节
                            _this.sections = data.data.section
                            _this.title = data.data.title
                            let sids: string[] = []
                            for (let item of _this.sections) {
                                sids.push(item.sid)
                            }
                            _this.setState({ "sidArray": sids })
                            break
                        }
                        case "2": {//实验
                            _this.title = data.data.title
                            _this.ppid = data.data.ppid
                            console.log(`ppid.......................................${_this.ppid}`)
                            break
                        }
                        case "3": {
                            _this.title = data.data.title
                            _this.ppid = data.data.ppid
                            console.log(`ppid.......................................${_this.ppid}`)

                            break
                        }
                    }
                    _this.setState((state) => ({
                        ajaxNotFinish: false
                        ,
                        viewType: _this.type
                    }))
                }
            })

        console.log("rendering......................................")

        this.setState((state) => ({
            ...state,
            ajaxNotFinish: true
        }))

    }
    componentWillUpdate() {
        $(".oneOptionDescription").removeClass("skyblueItem")
        $(".resultBoard").text("")

    }
    componentDidMount() {
        let _this = this
        setInterval(() => $("#timer").text(new Date().toLocaleString()), 1)
        $(document).on("click", ".oneOptionDescription", (e) => {
            if ($(e.currentTarget).hasClass("skyblueItem"))
                $(e.currentTarget).removeClass("skyblueItem")
            else
                $(e.currentTarget).addClass("skyblueItem")
        })
        $(document).on("click", ".next", () => {
            let csid = _this.state.sid
            let pid = _this.state.pid
            if (parseInt(pid) < Object.keys(_this.questionPool[csid].descriptions).length) {
                pid = (parseInt(pid) + 1).toString()
                // alert(`pid:${pid}`)
            }
            else {
                // alert("no more answer")
                let index = _this.state.sidArray.findIndex((val, index) => {
                    if (val == _this.state.sid)
                        return true;
                })
                // alert(`sidArrayIndex:${index}`)
                // alert(`length:${_this.state.sidArray.length}`)
                // alert(`sidArray:${JSON.stringify(_this.state.sidArray)}`)
                // alert(`sidArray:${ _this.state.sidArray.join(";")}`)
                if (index >= _this.state.sidArray.length - 1) {
                    alert("没有更多了！")
                    return;
                }
                else {
                    csid = _this.state.sidArray[++index]
                    pid = "1"
                    // alert(pid)
                }

            }
            let options = []
            let choices = _this.questionPool[csid]["choices"][pid]
            for (let index in choices) {
                options.push(<div className="oneOptionDescription col-12" style={{
                    backgroundColor: "white", height: "60px",
                    borderStyle: "solid", borderColor: "grey",
                    borderRadius: "8px", borderWidth: "2px", verticalAlign: "middle",
                    display: "inline-table", margin: "5px 10px"
                }} title={(parseInt(index) + 1).toString()}>
                    <div className="option-choice" style={{
                        display: "table-cell", verticalAlign: "middle",
                    }} >
                        {choices[index]}
                    </div>
                </div>)
            }
            _this.setState({
                sid: csid,
                optionDescription: _this.questionPool[csid]["descriptions"][pid],
                optionChoicesDecription: options,
                pid: pid,
                scid: _this.questionPool[csid]["scids"][pid],
            }, () => {
                $(".list-group-item").removeClass("list-group-item-primary")
                $(`a[id=${_this.state.pid}]`).parents(`.optionItem.${_this.state.sid}`).addClass("list-group-item-primary")
            })
        })
        $(document).on("click", ".newSubmitButton", () => {
            let answers: string[] = []
            $(".oneOptionDescription.skyblueItem").map((index, html) => {
                answers.push($(html).prop("title"))
                // alert("aaa")
            })
            let uAnswers: any = {}
            uAnswers[_this.state.pid] = { answer: answers, uRight: undefined }
            $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "POST",
                    url: "http://judge.tinylink.cn/quiz/choices/judge",
                    dataType: 'json',
                    contentType: "text/javascript",
                    data: JSON.stringify({
                        scid: _this.state.scid,
                        answer: answers.join(",")
                    }),
                    success: async function (data) {
                        let correctItem: string = data.correct
                        let pid = (parseInt(_this.state.pid)).toString()
                        let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
                        if (correctItem == "1") {
                            uAnswers[_this.state.pid].uRight = true
                            sp.prop("class", "oi oi-check")
                            sp.show()
                            $(".resultBoard").text("答案正确")
                            $(".resultBoard").css("color", "green")

                        }
                        else {
                            sp.prop("class", "oi oi-x")
                            sp.show()
                            uAnswers[_this.state.pid].uRight = false
                            $(".resultBoard").text("答案错误")
                            $(".resultBoard").css("color", "red")
                        }
                        _this.setAnswerPool(_this.state.sid, _this.state.pid, uAnswers)
                        _this.props.setLocal(_this.state.sid, uAnswers)
                        // _this.uAnswers[_this.state.pid] = { answer: [], uRight: false }
                    }
                }
            )
        })

    }



    render(): JSX.Element {
        let _this = this
        return (
            this.state.viewType == "1" || this.state.viewType == "4" ?
                <MyContext.Provider value={{
                    setQuestionPool: (section: string, data: any) => {
                        _this.questionPool[section] = data
                        // alert(JSON.stringify(_this.questionPool))

                    },
                    setOptionDescription: (a: string) => {
                        _this.setOptionDescription(a)
                    },
                    setOptionChoicesDescription: (a: JSX.Element[]) => {
                        _this.setOptionChoicesDescription(a)
                    },
                    setState: (name: string, value: any) => {
                        let tmp: any = {}
                        tmp[name] = value
                        // alert(JSON.stringify(value))
                        _this.setState({
                            ...tmp
                        })

                    },
                    props: _this.props

                }}>
                    <div className="col-12">
                        <div className="title_timer col-12"><h4> {_this.title}</h4><span id='timer'></span></div>
                        {/* <hr /> */}
                        <div className="col-4" style={{ float: "left", height: "790px", overflow: "scroll", minWidth: "590px" }}>
                            <Chapter
                                viewType={_this.type}
                                programSingleFile={_this.props.programSingleFile}
                                setLocal={_this.props.setLocal}
                                getLocal={_this.props.getLocal}
                                config={_this.props.config}
                                openShell={_this.props.openShell}
                                closeTables={_this.props.closeTabs}
                                initPidQueueInfo={_this.props.initPidQueueInfo}
                                setQueue={_this.props.setQueue}
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
                                openSrcFile={_this.props.openSrcFile}
                                postSrcFile={_this.props.postSrcFile}
                            />

                        </div>
                        <div className="optionDescription col-4" style={{ backgroundColor: "#f8fafc", color: "black", float: "left", fontSize: `20px`, height: "790px" }} >
                            {_this.state.optionDescription}

                        </div>
                        <div className="optionChocies col-4" style={{ backgroundColor: "#e7ebee", color: "green", fontSize: `15px`, float: "left", height: "790px" }}>
                            <div className="choices"> {_this.state.optionChoicesDecription}</div>
                            <div className="resultBoard" style={{ textAlign: "center", fontSize: `30px`, marginTop: `80px` }}></div>
                            <div className="next btn btn-primary" style={{ left: '5px', bottom: '10px', position: "absolute" }}>下一个</div>
                            <div className="newSubmitButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</div>
                        </div>
                    </div>
                </MyContext.Provider >
                :
                this.state.viewType == "2" ?
                    <MyContext.Provider value={{


                        setOptionDescription: (a: string) => {
                            _this.setOptionDescription(a)
                        },
                        setOptionChoicesDescription: (a: JSX.Element[]) => {
                            _this.setOptionChoicesDescription(a)
                        },
                        setState: (name: string, value: string) => {
                            let tmp: any = {}
                            tmp[name] = value
                            _this.setState({
                                ...tmp
                            })
                        },
                        props: _this.props

                    }}>
                        <div>
                            <div >
                                {/* <div><h4> {_this.title}<span id='timer' style={{"float":'right'}}></span></h4></div> */}
                                <Experiment
                                    programSingleFile={_this.props.programSingleFile}
                                    config={_this.props.config}
                                    openShell={_this.props.openShell}
                                    initPidQueueInfo={_this.props.initPidQueueInfo}
                                    closeTabs={_this.props.closeTabs}
                                    setQueue={_this.props.setQueue}
                                    section={{ ppid: [_this.ppid], sid: "experiment" }}
                                    outputResult={_this.props.outputResult}
                                    say={_this.props.say}
                                    setCookie={_this.props.setCookie}
                                    disconnect={_this.props.disconnect}
                                    connect={_this.props.connect}
                                    callUpdate={_this.props.callUpdate}
                                    openSrcFile={_this.props.openSrcFile}
                                    postSrcFile={_this.props.postSrcFile}
                                />
                            </div>
                        </div>
                    </MyContext.Provider >
                    :
                    this.state.viewType == "3" ?
                        <MyContext.Provider value={{
                            setQuestionPool: (section: string, data: any) => {
                                _this.questionPool[section] = data
                                // alert(JSON.stringify(_this.answerPool))
                            },

                            setOptionDescription: (a: string) => {
                                _this.setOptionDescription(a)
                            },
                            setOptionChoicesDescription: (a: JSX.Element[]) => {
                                _this.setOptionChoicesDescription(a)
                            },
                            setState: (name: string, value: string) => {
                                let tmp: any = {}
                                tmp[name] = value
                                _this.setState({
                                    ...tmp
                                })
                            },
                            props: _this.props

                        }}>
                            <div>
                                <div >
                                    {/* <div><h4> {_this.title}<span id='timer' style={{"float":'right'}}></span></h4></div> */}
                                    <Scene
                                        programSingleFile={_this.props.programSingleFile}
                                        config={_this.props.config}
                                        openShell={_this.props.openShell}
                                        initPidQueueInfo={_this.props.initPidQueueInfo}
                                        closeTabs={_this.props.closeTabs}
                                        setQueue={_this.props.setQueue}
                                        section={{ ppid: [_this.ppid], sid: "Scene" }}
                                        outputResult={_this.props.outputResult}
                                        say={_this.props.say}
                                        setCookie={_this.props.setCookie}
                                        disconnect={_this.props.disconnect}
                                        connect={_this.props.connect}
                                        callUpdate={_this.props.callUpdate}
                                        openSrcFile={_this.props.openSrcFile}
                                        postSrcFile={_this.props.postSrcFile}
                                    />
                                </div>
                            </div>
                        </MyContext.Provider >
                        :
                        <div></div>
        )
    }
}
