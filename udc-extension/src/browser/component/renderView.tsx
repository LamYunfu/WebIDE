import React = require("react");
import { Experiment } from "./experiment-view"
import { FreeCoding } from './freecoding-view'
import { Chapter } from './chapter-view'
import { Scene } from './scene-view'
import * as $ from "jquery"
import { MyContext } from './context'
import { AIView } from "./ai-view";
import { VirtualSceneView } from "./virtualscene-view";
import { USER_INFO_URL, VIEW_DETAIL_URL, QUIZE_JUDGE_URL, CHOICE_JUDGE_URL } from "../../setting/front-end-config";
import { LinkEdgeView } from "./linkedge";
// import { CodingInfo } from "./code-issue";
export namespace View {
    export interface Props {
        remove: (pid: string, index: string) => Promise<boolean>
        linkEdgeGetDevicesInfo: (pid: string) => Promise<any>
        linkEdgeProjectAdd: (pid: string, info: any) => Promise<boolean>
        linkEdgeDevelop: (pid: string, indexStr: string) => Promise<boolean>
        linkEdgeConnect: (pid: string, threeTuple: any) => Promise<boolean>
        openDrawBoard: () => void
        gotoVirtualScene: () => void
        virtualOpen: () => void
        virtualSubmit: (pid: string) => void
        openExplorer: () => void
        openFileView: () => void
        terminateExe: () => void
        continueExe: () => void
        getData: (type: string) => Promise<string>
        storeData: (data: string) => void
        connect: (loginType: string, model: string, pid: string, timeout: string) => Promise<boolean>
        isconnected: () => Promise<Boolean>
        disconnect: () => void
        callUpdate: () => void
        postSrcFile: (fn: string) => void
        setCookie: (cookie: string) => void
        gotoVideo: (uri: string, videoName: string) => void
        say: (verbose: string) => void
        outputResult: (res: string, types?: string) => void
        setSize: (size: number) => void
        setQueue: () => void
        closeTabs: () => void
        initPidQueueInfo(infos: string): Promise<string>
        openShell: () => void
        setTinyLink: (name: string, passwd: string) => void
        config: () => void
        setLocal: (key: string, obj: object) => void
        getLocal: (key: string, obj: object) => any
        programSingleFile: (pidAndFn: string) => void
        postSimFile: (pid: string) => void
        openSrcFile: (pid: string) => void
        saveAll: () => void
        setSubmitEnableWithJudgeTag: (val: boolean) => void
        getSubmitEnableWithJudgeTag: () => boolean
        openWorkSpace: (urlStr: string) => void
        train: (pid: string) => void
    }
    export interface State {
        ajaxNotFinish: boolean,
        optionDescription: string,
        optionChoicesDecription: JSX.Element[],
        sid: string,
        pid: string,
        viewType: string,
        scid: string,
        sidArray: string[],
        isLast: boolean,
        sidIndex: number,
        qzid: string,
        type: string,//optionChoice type
        defaultOptionViewToogle: boolean,
        redo: boolean,
        viewState: boolean
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
            pid: "1",
            viewType: "",
            scid: "",
            sidArray: [],
            isLast: false,
            sidIndex: 0,
            qzid: "",
            type: "SC",
            defaultOptionViewToogle: false,
            redo: false,
            viewState: false
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
    submittedAnswers: { [sid: string]: { [index: string]: { "uAnswer": string[] | undefined, "uRight": boolean | undefined, saved: boolean | undefined } } } = {}
    notForAll: boolean = true;
    clickTime: number = 9999999999999
    sectionData: any = {}
    typeData: any = {}

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
        ////alert(JSON.stringify(_this.answerPool))
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

    async componentWillMount() {
        $("title").html("WebIDE")
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
                url: USER_INFO_URL,
                // processData: false,
                dataType: 'json',
                contentType: "text/plain",
                data: "", // serializes the form's elements.
                success: function (data) {
                    $(".userName").text(data.data.uname)
                    ////alert(data.data.JSESSIONID)
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
                url: VIEW_DETAIL_URL,
                dataType: 'json',
                contentType: "text/plain",
                data: '',
                success: async function (data) {
                    // let x = data.question.slice(0, 3)
                    console.log(JSON.stringify(data) + "****************************")
                    let sidArray = _this.state.sidArray
                    if (data.message != "success") {
                        console.log("INFO:GET VIEW DETAIL FAILED!!!!!!!!!!!!!!!!!!!!!!!!!")
                        return
                    }
                    _this.type = data.data.type
                    _this.vid = data.data.vid
                    // setInterval(() => {
                    //     _this.props.storeData(JSON.stringify(_this.typeDataPool))
                    // }, 8000)
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
                                _this.sectionData[item.sid] = item
                            }
                            sidArray = sids
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
                        case "5": {
                            _this.title = data.data.title
                            _this.ppid = data.data.ppid
                            console.log(`ppid.......................................${_this.ppid}`)
                            break
                        }
                        case "8": {
                            _this.title = data.data.title
                            _this.ppid = data.data.ppid
                            console.log(`ppid.......................................${_this.ppid}`)
                            break
                        }
                        case "9": {
                            _this.title = data.data.title
                            _this.ppid = data.data.ppid
                            console.log(`ppid.......................................${_this.ppid}`)
                            break
                        }
                    }
                    _this.setState((state) => ({
                        ajaxNotFinish: false,
                        viewType: _this.type,
                        sidArray: sidArray
                    }))
                    console.log("view type :" + _this.type)
                }
            })

        console.log("rendering......................................")
        let viewState = await this.props.getLocal("viewState", {})
        if (viewState["viewState"] == undefined)
            viewState['viewState'] = false
        this.setState((state) => ({
            ...state,
            ajaxNotFinish: true,
            viewState: viewState["viewState"]
        }))
    }
    toggleRedoButton() {
        if ($(".newRedoButton:visible").length != 0) {
            $(".newRedoButton").hide()
            $(".newSubmitButton").show()
        }
        else {
            $(".newRedoButton").show()
            $(".newSubmitButton").hide()
        }
    }
    showSubmitButton() {
        $(".newRedoButton").hide()
        $(".newSubmitButton").show()
    }
    showRedoButton() {
        $(".newRedoButton").show()
        $(".newSubmitButton").hide()
    }
    async componentDidUpdate() {

        if (this.submittedAnswers[this.state.sid] == undefined) {
            this.submittedAnswers[this.state.sid] = await this.props.getLocal(this.state.sid, {})
            //alert("getLocal:" + JSON.stringify(this.submittedAnswers[this.state.sid]))
        }
        let sidData: any = this.submittedAnswers[this.state.sid]
        ////alert(JSON.stringify(sidData))
        if (sidData != undefined && sidData[this.state.pid] != undefined) {
            // alert(`updata:${this.state.pid}`)
            if (sidData[this.state.pid].uAnswer != undefined)
                for (let item of sidData[this.state.pid].uAnswer) {
                    $(`.oneOptionDescription[title=${item}]`).addClass("skyblueItem")
                }
            switch (sidData[this.state.pid].uRight) {
                case true: $(".resultBoard").text("答案正确"); $(".resultBoard").css("color", "green");
                    this.showRedoButton()
                    break
                case false: $(".resultBoard").text("答案错误"); $(".resultBoard").css("color", "red");
                    this.showRedoButton()
                    break
                case undefined: {
                    if (sidData[this.state.pid].saved) {
                        $(".resultBoard").text("已保存"); $(".resultBoard").css("color", "white");
                    }
                    else {
                        $(".resultBoard").text("")
                        this.showSubmitButton()
                    }

                    break
                }
            }
        }
        else {
            this.showSubmitButton()
        }

    }
    componentWillUpdate() {
        $(".oneOptionDescription").removeClass("skyblueItem")
        $(".resultBoard").text("")

    }

    componentDidMount() {
        let _this = this
        $(".oneOptionDescription").removeClass("skyblueItem")
        $(".resultBoard").text("")
        setInterval(() => $("#timer").text(new Date().toLocaleString()), 1000)
        $(document).on("click", ".oneOptionDescription", (e) => {
            if (_this.state.type == "SC") {
                $(".oneOptionDescription").removeClass("skyblueItem")
            }
            if ($(e.currentTarget).hasClass("skyblueItem"))
                $(e.currentTarget).removeClass("skyblueItem")
            else
                $(e.currentTarget).addClass("skyblueItem")
        })
        $(document).on('click', ".btn:not([id*=submitSrc],[id*=connectButton])", async (e) => {

            let sp = $(e.currentTarget)
            sp.attr("disabled", "true")
            await new Promise(res => {
                setTimeout((x) => {
                    $(x).removeAttr("disabled")
                    res()
                }, 100, sp);
            })

        })
        $(document).on("click", ".next", async (el) => {
            $(this).attr('disabled', 'true')
            let csid = _this.state.sid
            let pid = _this.state.pid
            let newIsLast = _this.state.isLast
            let index = _this.state.sidIndex
            $(document).one("optionSubmitFail", 'body', (el) => {
                $(document).off("optionSubmitScc", 'body')

            })
            $(document).one("optionSubmitScc", 'body', (el) => {
                $(el).removeAttr("disabled")
                //  new Promise((resolve) => {
                //     setTimeout(() => {
                //         resolve()
                //     }, 300)
                // })
                if (parseInt(pid) < Object.keys(_this.questionPool[csid].descriptions).length) {
                    pid = (parseInt(pid) + 1).toString()
                    // alert(`pid:${pid}`)
                    parseInt(pid) == Object.keys(_this.questionPool[csid].descriptions).length ?
                        _this.state.sidIndex == _this.state.sidArray.length - 1 ?
                            newIsLast = true
                            :
                            newIsLast = false
                        :
                        newIsLast = false

                }
                else {
                    ////alert("no more answer")
                    index = _this.state.sidArray.findIndex((val, index) => {
                        if (val == _this.state.sid)
                            return true;
                    })
                    if (index >= _this.state.sidArray.length - 1) {
                        alert("没有更多了！")
                        return;
                    }
                    else {
                        csid = _this.state.sidArray[++index]
                        pid = "1"
                    }

                }
                let options = []
                let choices = _this.questionPool[csid]["choices"][pid]
                for (let index in choices) {
                    options.push(<div className="oneOptionDescription col-12" style={{
                        height: "60px",
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
                    sidIndex: index,
                    isLast: newIsLast,
                    sid: csid,
                    optionDescription: _this.questionPool[csid]["descriptions"][pid],
                    optionChoicesDecription: options,
                    pid: pid,
                    scid: _this.questionPool[csid]["scids"][pid],
                    type: _this.typeData[csid][pid]
                }, () => {
                    $(".list-group-item").removeClass("list-group-item-primary")
                    $(`a[id=${_this.state.pid}]`).parents(`.optionItem.${_this.state.sid}`).addClass("list-group-item-primary")
                })
                $(document).off("optionSubmitFail", 'body')
            })
            $(".newSubmitButton").trigger("click")
            $(".newSaveButton").trigger("click")
        })
        $(document).on("click", ".displayStyle", async () => {
            await this.props.setLocal("viewState", { viewState: !this.state.viewState })
            parent.location.reload()
            // alert("ok")
        })
        $(document).on("click", ".last", () => {
            let csid = _this.state.sid
            let pid = _this.state.pid
            let newIsLast = _this.state.isLast
            let index = _this.state.sidIndex
            $(document).one("optionSubmitScc", "body", () => {
                if (parseInt(pid) > 1) {
                    pid = (parseInt(pid) - 1).toString()
                }
                else {
                    ////alert("no more answer")
                    index = _this.state.sidArray.findIndex((val, index) => {
                        if (val == _this.state.sid)
                            return true;
                    })
                    if (index == 0) {
                        alert("没有更多了！")
                        newIsLast = false
                        return;
                    }
                    else {
                        csid = _this.state.sidArray[--index]
                        pid = Object.keys(_this.questionPool[csid].descriptions).length.toString()
                    }

                }
                let options = []
                let choices = _this.questionPool[csid]["choices"][pid]
                for (let index in choices) {
                    options.push(<div className="oneOptionDescription col-12" style={{
                        height: "60px",
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
                    sidIndex: index,
                    isLast: newIsLast,
                    sid: csid,
                    optionDescription: _this.questionPool[csid]["descriptions"][pid],
                    optionChoicesDecription: options,
                    pid: pid,
                    scid: _this.questionPool[csid]["scids"][pid],
                    type: _this.typeData[csid][pid]
                }, () => {
                    $(".list-group-item").removeClass("list-group-item-primary")
                    $(`a[id=${_this.state.pid}]`).parents(`.optionItem.${_this.state.sid}`).addClass("list-group-item-primary")
                })
            })
            $(".newSubmitButton").trigger("click")
            $(".newSaveButton").trigger("click")
        })



        $(document).on("click", ".expander", async () => {
            if (!$(".list-group-item-primary").hasClass('optionItem'))
                return
            let sp = $(".expander>span")
            if (sp.hasClass("oi-chevron-right")) {
                sp.removeClass("oi-chevron-right")
                sp.addClass("oi-chevron-left")
            }
            else {
                sp.addClass("oi-chevron-right")
                sp.removeClass("oi-chevron-left")
            }
            $(".stateProfile").toggle()
            $(".selectPanel").toggle()
            // _this.clickTime = new Date().getTime()
            // await new Promise((res) => {
            //     setTimeout(() => {
            //         res()
            //     }, 5000);
            // })
            // let gap = (new Date().getTime() - _this.clickTime)

            // if (gap >= 5 && $(".selectPanel").css("display") != "none") {
            //     let sp = $(".expander>span")
            //     sp.addClass("oi-chevron-right")
            //     sp.removeClass("oi-chevron-left")
            //     $(".stateProfile").show()
            //     $(".selectPanel").hide()
            // }
        })
        $(document).on("mouseenter", ".sections", () => {
            if (this.state.viewState == false)
                return
            // alert('enter')
            _this.clickTime = 9999999999999
        })
        $(document).on("mouseleave", ".sections ", async () => {
            if (this.state.viewState == false)
                return

            _this.clickTime = new Date().getTime()

            await new Promise((res) => {
                setTimeout(() => {

                    res()
                }, 1300);
            })

            let gap = (new Date().getTime() - _this.clickTime)
            // alert(gap)
            if ($(".selectPanel").css("display") != "none" && $(".list-group-item-primary").hasClass('optionItem') && gap >= 1000) {
                let sp = $(".expander>span")
                sp.addClass("oi-chevron-right")
                sp.removeClass("oi-chevron-left")
                $(".stateProfile").show()
                $(".selectPanel").hide()

            }
        })
        $(document).on("click", ".newSubmitAll", async () => {
            if (_this.submittedAnswers[_this.state.sid] == undefined) {
                _this.submittedAnswers[_this.state.sid] = await _this.props.getLocal(_this.state.sid, {})
                //alert("getLocal:" + JSON.stringify(_this.submittedAnswers[_this.state.sid]))
            }
            let answers: string[] = []
            $(".oneOptionDescription.skyblueItem").map((index, html) => {
                answers.push($(html).prop("title"))
                ////alert("aaa")
            })
            if (answers.length == 0) {
                if (confirm("保存的结果为空，确认继续？") == false) {
                    return
                }

            }
            let uAnswers: any = {}
            uAnswers[_this.state.pid] = { answer: answers, uRight: undefined, saved: true }
            _this.submittedAnswers[_this.state.sid][_this.state.pid] = uAnswers[_this.state.pid]
            let pid = _this.state.pid
            let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
            sp.prop("class", "oi oi-pin")
            sp.show()
            $(".resultBoard").text("已保存")
            $(".resultBoard").css("color", "white")
            _this.props.setLocal(_this.state.sid, _this.submittedAnswers[_this.state.sid])
            for (let index = 0; index < Object.keys(_this.questionPool[_this.state.sid].descriptions).length; index++) {
                let indexStr = (index + 1).toString()
                if (_this.submittedAnswers[_this.state.sid][indexStr] == undefined ||
                    _this.submittedAnswers[_this.state.sid][indexStr].uAnswer == undefined ||
                    _this.submittedAnswers[_this.state.sid][indexStr].uAnswer!.length == 0) {
                    let toGo = _this.notForAll && confirm(`第${index + 1}题，答案为空，确认继续提交？`)
                    if (toGo == true) {
                        answers[index] = "X"
                        _this.submittedAnswers[_this.state.sid][indexStr] = { uAnswer: [], uRight: false, saved: true }
                        _this.notForAll && confirm(`提交全部不再提醒？`) ? _this.notForAll = false : _this.notForAll = true
                    }
                    else {
                        if (_this.notForAll == false) {
                            answers[index] = "X"
                            _this.submittedAnswers[_this.state.sid][indexStr] = { uAnswer: [], uRight: false, saved: true }
                        }
                        else {
                            return
                        }

                    }
                }
                else
                    answers[index] = _this.submittedAnswers[_this.state.sid][indexStr].uAnswer!.join(",")

            }
            _this.notForAll = true
            $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "POST",
                    url: QUIZE_JUDGE_URL,
                    dataType: 'json',
                    contentType: "text/javascript",
                    data: JSON.stringify({
                        qzid: _this.state.qzid,
                        answer: answers
                    }),
                    success: async function (data) {
                        let correctItem: string[] = data.data.correct
                        for (let item in correctItem) {
                            let pid = (parseInt(item) + 1).toString()
                            ////alert(`.optionItem.${_this.state.sid} a[id=${pid}]`)
                            let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
                            if (correctItem[item] == "1") {
                                _this.submittedAnswers[_this.state.sid][pid].uRight = true
                                sp.prop("class", "oi oi-check")
                                sp.show()
                            }
                            else {
                                _this.submittedAnswers[_this.state.sid][pid].uRight = false
                                sp.prop("class", "oi oi-x")
                                sp.show()
                            }
                        }

                        await _this.props.setLocal(_this.state.sid, _this.submittedAnswers[_this.state.sid])
                        //alert("setLocal:" + JSON.stringify(_this.submittedAnswers[_this.state.sid]))
                        let crtCount = 0
                        for (let item of correctItem) {
                            if (item == '1')
                                crtCount++;
                        }
                        alert(`正确${crtCount}道,\n错误${correctItem.length - crtCount}道`)
                    }
                }
            )


        })
        $(document).on("click", ".newSaveButton", async () => {
            if (_this.submittedAnswers[_this.state.sid] == undefined) {
                _this.submittedAnswers[_this.state.sid] = await _this.props.getLocal(_this.state.sid, {})
                //alert("getLocal:" + JSON.stringify(_this.submittedAnswers[_this.state.sid]))
            }
            let answers: string[] = []
            $(".oneOptionDescription.skyblueItem").map((index, html) => {
                answers.push($(html).prop("title"))
                ////alert("aaa")
            })
            if (answers.length == 0) {
                if (confirm("保存的结果为空，确认继续？") == false) {
                    $('body').trigger("optionSubmitFail")
                    return
                }

            }
            let uAnswers: any = {}
            uAnswers[_this.state.pid] = { uAnswer: answers, uRight: undefined, saved: true }
            _this.submittedAnswers[_this.state.sid][_this.state.pid] = uAnswers[_this.state.pid]
            let pid = _this.state.pid
            let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
            sp.prop("class", "oi oi-pin")
            sp.show()
            $(".resultBoard").text("已保存")
            $(".resultBoard").css("color", "white")
            await _this.props.setLocal(_this.state.sid, _this.submittedAnswers[_this.state.sid])
            $('body').trigger("optionSubmitScc")
            //alert("setLocal:" + JSON.stringify(_this.submittedAnswers[_this.state.sid]))
        })

        $(document).on("click", ".newRedoButton", async () => {
            let uAnswers: any = {}
            uAnswers[this.state.pid] = { uAnswer: [], uRight: undefined }
            this.submittedAnswers[this.state.sid][this.state.pid] = {
                ...uAnswers,
                saved: undefined,
            }
            let tmp = await _this.props.getLocal(_this.state.sid, {})
            let store = {
                ...tmp,
                ...uAnswers
            }
            await _this.props.setLocal(_this.state.sid, store)
            this.showSubmitButton()
            $(".resultBoard").text("")
            $(".skyblueItem").removeClass("skyblueItem")
            $(".list-group-item-primary>span[class*=oi-]:not(.oi-pencil)").attr("class", 'oi')
        })
        $(document).on("click", ".newSubmitButton", async () => {

            if (_this.submittedAnswers[_this.state.sid] == undefined) {
                _this.submittedAnswers[_this.state.sid] = await _this.props.getLocal(_this.state.sid, {})
                //alert("getLocal:" + JSON.stringify(_this.submittedAnswers[_this.state.sid]))
            }
            let answers: string[] = []
            $(".oneOptionDescription.skyblueItem").map((index, html) => {
                answers.push($(html).prop("title"))
                ////alert("aaa")
            })
            if (answers.length == 0) {
                if (confirm("提交的结果为空，确认继续？") == false) {
                    $('body').trigger("optionSubmitFail")
                    return
                }
            }
            let uAnswers: any = {}
            uAnswers[_this.state.pid] = { uAnswer: answers, uRight: undefined }

            $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "POST",
                    url: CHOICE_JUDGE_URL,
                    dataType: 'json',
                    contentType: "text/javascript",
                    data: JSON.stringify({
                        scid: _this.state.scid,
                        answer: answers.join(",")
                    }),
                    success: async function (data) {
                        let correctItem: string = data.correct
                        let pid = _this.state.pid
                        let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
                        ////alert(`.optionItem.${_this.state.sid} a[id=${pid}]`)
                        if (correctItem == "1") {
                            uAnswers[_this.state.pid]["uRight"] = true
                            _this.submittedAnswers[_this.state.sid][pid] = uAnswers[_this.state.pid]
                            sp.prop("class", "oi oi-check")
                            $(".resultBoard").text("答案正确")
                            $(".resultBoard").css("color", "green")
                            sp.show()
                        }
                        else {
                            uAnswers[_this.state.pid]["uRight"] = false
                            _this.submittedAnswers[_this.state.sid][pid] = uAnswers[_this.state.pid]
                            sp.prop("class", "oi oi-x")
                            $(".resultBoard").text("答案错误")
                            $(".resultBoard").css("color", "red")
                            sp.show()
                        }
                        let tmp = await _this.props.getLocal(_this.state.sid, {})
                        let store = {
                            ...tmp,
                            ...uAnswers
                        }
                        await _this.props.setLocal(_this.state.sid, store)
                        _this.showRedoButton()
                        $('body').trigger("optionSubmitScc")

                    }
                }

            )
        })
    }
    async showTheDefaultExperimentView() {
        let exitTag = true
        setTimeout(() => {
            exitTag = false
        }, 20000);
        while (exitTag && $("[class*=codeItem]").length == 0)
            await new Promise((resolve) => {
                setTimeout(() => {
                    console.log("waiting data")
                    resolve('scc')
                }, 300);
            })
        console.log("show experiment view:" + $("[class*=codeItem]").length)
        exitTag && $("[class*=codeItem]").first().trigger("click")
    }
    async showTheDefaultSceneView() {
        $("[class*=codeItem]").first().trigger("click")
    }
    async showTheDefaultOptionView() {
        let _this = this
        let csid = _this.state.sidArray[0]
        console.log("csid:" + csid)
        let exitTag = true
        setTimeout(() => {
            exitTag = false
        }, 10000);
        while (exitTag && _this.questionPool[csid] == undefined) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    console.log("waiting data")
                    resolve('scc')
                }, 300);
            })
        }
        if (!exitTag)
            return
        $(".optionDescription").show()
        $('.optionChoices').show()
        let pid = Object.keys(_this.questionPool[csid]["choices"])[0]
        let options = []
        let choices = _this.questionPool[csid]["choices"][pid]
        for (let index in choices) {
            options.push(<div className="oneOptionDescription col-12" style={{
                height: "60px",
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
            sidIndex: 0,
            isLast: false,
            sid: this.state.sidArray[0],
            optionDescription: _this.questionPool[csid]["descriptions"][pid],
            optionChoicesDecription: options,
            pid: pid,
            scid: _this.questionPool[csid]["scids"][pid],
            type: _this.typeData[csid][pid]
        }, () => {
            $(".list-group-item").removeClass("list-group-item-primary")
            $(`a[id=${_this.state.pid}]`).parents(`.optionItem.${_this.state.sid}`).addClass("list-group-item-primary")
        })

    }

    render(): JSX.Element {
        let _this = this
        return (
            this.state.viewType == "1" || this.state.viewType == "4" ?//选择 &&考试
                this.state.viewState == true ?
                    <div style={{ height: "100%", zIndex: 0 }}>
                        <div className="title_timer col-12" ><h4> {_this.title}</h4><span id='timer'></span></div>
                        <button className="displayStyle" style={{
                            position: 'fixed', top: '10%', right: '50px', borderRadius: '10px',
                            backgroundColor: 'silver'
                        }}>change style</button>
                        <MyContext.Provider value={{
                            setTypeData: (sid: string, types: any) => {
                                _this.typeData[sid] = types
                            },
                            getViewState: () => {
                                return _this.state.viewState
                            },
                            showTheDefaultExperimentView: () => {
                                _this.showTheDefaultExperimentView()
                            },
                            showTheDefaultOptionView: () => {
                                _this.showTheDefaultOptionView()
                            },
                            setClickTime: () => {
                                _this.clickTime = new Date().getTime()
                            },
                            setQuestionPool: (section: string, data: any) => {
                                _this.questionPool[section] = data
                            },
                            setOptionDescription: (a: string) => {
                                _this.setOptionDescription(a)
                            },
                            setOptionChoicesDescription: (a: JSX.Element[]) => {
                                _this.setOptionChoicesDescription(a)
                            },
                            setState: (tmp: object) => {
                                _this.setState({
                                    ...tmp
                                })

                            },
                            getState: (key: string) => {
                                let tmp: any = this.state
                                return tmp[key]
                            },
                            get sidArray() {
                                return _this.state.sidArray
                            },
                            props: _this.props

                        }}>
                            <div className="selectPanel row col-3" style={{
                                minWidth: '450px', height: "90%",
                                backgroundColor: "#262527", left: "10px",
                                zIndex: 1, position: "absolute",
                                boxShadow: '5px 5px 5px black',
                                paddingLeft: '0px'
                            }}>
                                <div className="col-12" style={{
                                    height: "98%", overflow: "scroll",

                                    backgroundColor: "#262527", zIndex: 1,
                                }}>
                                    <Chapter
                                        sectionData={_this.sectionData}
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
                                        postSrcFile={_this.props.postSrcFile}
                                    />
                                </div>
                            </div>

                            <div className="expander row col-3" style={{
                                width: '30px', height: "30px", fontSize: '30px', color: "blue",
                                left: "10px", backgroundColor: "rgb(38, 37, 39,0)", zIndex: 1, position: "absolute", bottom: "50%"
                            }}>
                                <span className="oi oi-chevron-left"></span>
                            </div>
                            <div className="stateProfile row col-3" style={{
                                minWidth: '450px', height: "30px", fontSize: "20px",
                                // color: "black",
                                left: "10px", backgroundColor: "rgba(0,0,0,0)", zIndex: 1, position: "absolute", top: "5%", display: "none"
                            }}>
                                {/* {`第${_this.state.sidIndex + 1}部分，`} */}
                                {/* {(_this.state.sidIndex + 1) > 0 ? `${$(`.section${_this.state.sidIndex + 1}`).text()} 选择题${_this.state.pid}` : `error`} */}
                                {(_this.state.sidIndex + 1) > 0 ? `${$(`.section${_this.state.sidArray[_this.state.sidIndex]}`).text()} 选择题${_this.state.pid}` : `error`}
                            </div>

                            <div className="row col-12" style={{
                                height: "90%", margin: 0,
                                padding: 0,
                            }}>
                                {/* <hr /> */}
                                {/* <div className="row col-3" style={{ backgroundColor: "#f8fafc", color: "black", float: "left", fontSize: `20px`, height: "100%" }} >
                
                            </div> */}
                                <div className="optionDescription col-6" style={{
                                    backgroundColor: "#555555",
                                    color: "white", float: "left", fontSize: `26px`, height: "100%"
                                }} >
                                    {_this.state.optionDescription}

                                </div>
                                <div className="optionChoices col-6" style={{
                                    backgroundColor: "##262527", color: "white",
                                    fontSize: `20px`, float: "left", height: "100%"
                                }}>
                                    <div className="choices" > {_this.state.optionChoicesDecription}</div>
                                    <div className="resultBoard" style={{ textAlign: "center", fontSize: `30px`, marginTop: `80px` }}></div>
                                    <button className="last btn btn-primary" style={{ left: '5px', bottom: '10px', position: "absolute" }}>上一个</button>
                                    <button className="next btn btn-primary" style={{ left: '90px', bottom: '10px', position: "absolute" }}>下一个</button>
                                    {this.state.viewType == "1" ?
                                        <span>
                                            <button className='newRedoButton btn btn-primary' style={{ right: '5px', bottom: '10px', position: "absolute" }}> 重做</button>
                                            <button className="newSubmitButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</button>
                                        </span>
                                        :
                                        this.state.isLast ? <button className="newSubmitAll btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</button>//考试模式
                                            :
                                            <button className="newSaveButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>保存</button>
                                    }
                                </div>

                            </div>
                        </MyContext.Provider >
                    </div >
                    //view2d
                    :
                    <div style={{ height: "100%" }}>
                        <div className="title_timer col-12" style={{ height: "10%" }}><h4> {_this.title}</h4><span id='timer'></span></div>
                        <button className="displayStyle" style={{
                            position: 'fixed', top: '10%', right: '50px', borderRadius: '10px',
                            backgroundColor: 'silver'
                        }}>change style</button>
                        <MyContext.Provider value={{
                            setTypeData: (sid: string, types: any) => {
                                _this.typeData[sid] = types
                            },
                            getViewState: () => {
                                return _this.state.viewState
                            },
                            showTheDefaultExperimentView: () => {
                                _this.showTheDefaultExperimentView()
                            },
                            showTheDefaultOptionView: () => {
                                _this.showTheDefaultOptionView()
                            },
                            setClickTime: () => {
                                _this.clickTime = new Date().getTime()
                            },
                            setQuestionPool: (section: string, data: any) => {
                                _this.questionPool[section] = data
                            },
                            setOptionDescription: (a: string) => {
                                _this.setOptionDescription(a)
                            },
                            setOptionChoicesDescription: (a: JSX.Element[]) => {
                                _this.setOptionChoicesDescription(a)
                            },
                            setState: (tmp: object) => {
                                _this.setState({
                                    ...tmp
                                })

                            },
                            getState: (key: string) => {
                                let tmp: any = this.state
                                return tmp[key]
                            },
                            get sidArray() {
                                return _this.state.sidArray
                            },
                            props: _this.props

                        }}>
                            <div className="row col-12" style={{ height: '90%' }}>
                                <div className="selectPanel row col-4" style={{
                                    minWidth: '450px', height: "98%",
                                    backgroundColor: "#262527", left: "10px",
                                    //   position: "absolute",
                                    paddingLeft: '0px'
                                }}>
                                    <div className="col-12" style={{
                                        height: "100%", overflow: "scroll",

                                        backgroundColor: "#262527"
                                    }}>
                                        <Chapter
                                            sectionData={_this.sectionData}
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
                                            postSrcFile={_this.props.postSrcFile}
                                        />
                                    </div>
                                </div>

                                <div className="row col-8" style={{
                                    height: "100%", margin: 0,
                                    paddingLeft: '70px',
                                }}>
                                    {/* <hr /> */}
                                    {/* <div className="row col-3" style={{ backgroundColor: "#f8fafc", color: "black", float: "left", fontSize: `20px`, height: "100%" }} >
                
                            </div> */}

                                    <div className="optionChoices col-12" style={{
                                        backgroundColor: "##262527", color: "white",
                                        fontSize: `20px`, float: "left", height: "100%",
                                        // left: '450px'


                                    }}>
                                        <div style={{
                                            fontSize: '30px'
                                        }}>
                                            {_this.state.optionDescription}
                                        </div>
                                        <div className="choices" style={{ paddingTop: "20px", width: "98%" }}> {_this.state.optionChoicesDecription}</div>
                                        <div className="resultBoard" style={{ textAlign: "center", fontSize: `30px`, marginTop: `80px` }}></div>
                                        <button className="last btn btn-primary" style={{ left: '25px', bottom: '10px', position: "absolute" }}>上一个</button>
                                        <button className="next btn btn-primary" style={{ left: '105px', bottom: '10px', position: "absolute" }}>下一个</button>
                                        {this.state.viewType == "1" ?
                                            <span>
                                                <button className='newRedoButton btn btn-primary' style={{ right: '5px', bottom: '10px', position: "absolute" }}> 重做</button>
                                                <button className="newSubmitButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</button>
                                            </span>
                                            :
                                            this.state.isLast ? <button className="newSubmitAll btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</button>//考试模式
                                                :
                                                <button className="newSaveButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>保存</button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </MyContext.Provider >
                    </div>
                :
                this.state.viewType == "11" ?
                    <MyContext.Provider value={{

                        props: _this.props

                    }}>
                        {/* <div><h4> {_this.title}<span id='timer' style={{"float":'right'}}></span></h4></div> */}
                        <LinkEdgeView
                            linkEdgeDisconnect={this.props.disconnect}
                            remove={this.props.remove}
                            getDevicesInfo={this.props.linkEdgeGetDevicesInfo}
                            add={this.props.linkEdgeProjectAdd}
                            develop={this.props.linkEdgeDevelop}
                            setSize={this.props.setSize}
                            initPidQueueInfo={this.props.initPidQueueInfo}
                            linkEdgeConnect={this.props.linkEdgeConnect}

                        />
                    </MyContext.Provider >

                    :

                    this.state.viewType == "2" ?//实验题
                        <MyContext.Provider value={{
                            showTheDefaultExperimentView: () => {
                                _this.showTheDefaultExperimentView()
                            },
                            setClickTime: () => {
                                _this.clickTime = new Date().getTime()
                            },
                            setOptionDescription: (a: string) => {
                                _this.setOptionDescription(a)
                            },
                            setOptionChoicesDescription: (a: JSX.Element[]) => {
                                _this.setOptionChoicesDescription(a)
                            },
                            setState: (tmp: object) => {
                                _this.setState({
                                    ...tmp
                                })

                            },
                            getState: (key: string) => {
                                let tmp: any = this.state
                                return tmp[key]
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
                                        postSrcFile={_this.props.postSrcFile}
                                    />
                                </div>
                            </div>
                        </MyContext.Provider >
                        :
                        this.state.viewType == "3" ?//场景模式
                            <MyContext.Provider value={{
                                showTheDefaultExperimentView: () => {
                                    _this.showTheDefaultExperimentView()
                                },
                                setClickTime: () => {
                                    _this.clickTime = new Date().getTime()
                                },
                                setQuestionPool: (section: string, data: any) => {
                                    _this.questionPool[section] = data
                                    ////alert(JSON.stringify(_this.answerPool))
                                },

                                setOptionDescription: (a: string) => {
                                    _this.setOptionDescription(a)
                                },
                                setOptionChoicesDescription: (a: JSX.Element[]) => {
                                    _this.setOptionChoicesDescription(a)
                                },
                                setState: (tmp: object) => {
                                    _this.setState({
                                        ...tmp
                                    })

                                },
                                getState: (key: string) => {
                                    let tmp: any = this.state
                                    return tmp[key]
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
                                            postSrcFile={_this.props.postSrcFile}
                                        />
                                    </div>
                                </div>
                            </MyContext.Provider >
                            :
                            this.state.viewType == "5" ?//自由编程
                                <MyContext.Provider value={{
                                    showTheDefaultFreeCodingView: () => {

                                    },
                                    setClickTime: () => {
                                        _this.clickTime = new Date().getTime()
                                    },
                                    setOptionDescription: (a: string) => {
                                        _this.setOptionDescription(a)
                                    },
                                    setOptionChoicesDescription: (a: JSX.Element[]) => {
                                        _this.setOptionChoicesDescription(a)
                                    },
                                    setState: (tmp: object) => {
                                        _this.setState({
                                            ...tmp
                                        })

                                    },
                                    getState: (key: string) => {
                                        let tmp: any = this.state
                                        return tmp[key]
                                    },
                                    props: _this.props

                                }}>
                                    {/* <div><h4> {_this.title}<span id='timer' style={{"float":'right'}}></span></h4></div> */}
                                    <FreeCoding
                                        title={this.title}
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
                                        postSrcFile={_this.props.postSrcFile}
                                    />

                                </MyContext.Provider >
                                :
                                this.state.viewType == "8" ?//人工智能

                                    <MyContext.Provider value={{
                                        showTheDefaultFreeCodingView: () => {

                                        },
                                        setClickTime: () => {
                                            _this.clickTime = new Date().getTime()
                                        },
                                        setOptionDescription: (a: string) => {
                                            _this.setOptionDescription(a)
                                        },
                                        setOptionChoicesDescription: (a: JSX.Element[]) => {
                                            _this.setOptionChoicesDescription(a)
                                        },
                                        setState: (tmp: object) => {
                                            _this.setState({
                                                ...tmp
                                            })

                                        },
                                        getState: (key: string) => {
                                            let tmp: any = this.state
                                            return tmp[key]
                                        },
                                        props: _this.props


                                    }}>

                                        <AIView
                                            title={this.title}
                                            config={_this.props.config}
                                            initPidQueueInfo={_this.props.initPidQueueInfo}
                                            section={{ ppid: [_this.ppid], sid: "experiment" }}
                                            outputResult={_this.props.outputResult}
                                            say={_this.props.say}
                                        />

                                    </MyContext.Provider >

                                    :
                                    this.state.viewType == "9" ?
                                        <MyContext.Provider value={{
                                            showTheDefaultFreeCodingView: () => {

                                            },
                                            setClickTime: () => {
                                                _this.clickTime = new Date().getTime()
                                            },
                                            setOptionDescription: (a: string) => {
                                                _this.setOptionDescription(a)
                                            },
                                            setOptionChoicesDescription: (a: JSX.Element[]) => {
                                                _this.setOptionChoicesDescription(a)
                                            },
                                            setState: (tmp: object) => {
                                                _this.setState({
                                                    ...tmp
                                                })

                                            },
                                            getState: (key: string) => {
                                                let tmp: any = this.state
                                                return tmp[key]
                                            },
                                            props: _this.props

                                        }}>
                                            <VirtualSceneView
                                                title={this.title}
                                                config={_this.props.config}
                                                initPidQueueInfo={_this.props.initPidQueueInfo}
                                                section={{ ppid: [_this.ppid], sid: "experiment" }}
                                                outputResult={_this.props.outputResult}
                                                say={_this.props.say}

                                            />

                                        </MyContext.Provider >

                                        :
                                        <div></div>
        )
    }
}
