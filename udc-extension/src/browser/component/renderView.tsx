import React = require("react");
import { Experiment } from "./experiment-view"
import { Chapter } from './chapter-view'
import { Scene } from './scene-view'
import * as $ from "jquery"
import { MyContext } from './context'
// import { CodingInfo } from "./code-issue";
export namespace View {
    export interface Props {
        getData: (type: string) => Promise<string>
        storeData: (data: string) => void
        connect: (loginType: string, model: string, pid: string, timeout: string) => void
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
        defaultOptionViewToogle: boolean
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
            defaultOptionViewToogle: false
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
    submitedAnswers: { [sid: string]: { [index: string]: { "uAnswer": string[] | undefined, "uRight": boolean | undefined, saved: boolean | undefined } } } = {}
    notForAll: boolean = true;
    clickTime: number = new Date().getTime()
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
                url: "http://api.tinylink.cn/view/active/detail",
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
                    }
                    _this.setState((state) => ({
                        ajaxNotFinish: false
                        ,
                        viewType: _this.type,
                        sidArray: sidArray
                    }))
                }
            })

        console.log("rendering......................................")

        this.setState((state) => ({
            ...state,
            ajaxNotFinish: true
        }))

    }
    async componentDidUpdate() {

        if (this.submitedAnswers[this.state.sid] == undefined) {
            this.submitedAnswers[this.state.sid] = await this.props.getLocal(this.state.sid, {})
            //alert("getLocal:" + JSON.stringify(this.submitedAnswers[this.state.sid]))
        }
        let sidData: any = this.submitedAnswers[this.state.sid]
        ////alert(JSON.stringify(sidData))
        if (sidData != undefined && sidData[this.state.pid] != undefined) {
            // alert(`updata:${this.state.pid}`)
            for (let item of sidData[this.state.pid].uAnswer) {
                $(`.oneOptionDescription[title=${item}]`).addClass("skyblueItem")
            }
            switch (sidData[this.state.pid].uRight) {
                case true: $(".resultBoard").text("答案正确"); $(".resultBoard").css("color", "green"); break
                case false: $(".resultBoard").text("答案错误"); $(".resultBoard").css("color", "red"); break
                case undefined: {
                    if (sidData[this.state.pid].saved) {
                        $(".resultBoard").text("已保存"); $(".resultBoard").css("color", "black");
                    }
                    else
                        $(".resultBoard").text("")
                    break
                }
            }
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
        setInterval(() => $("#timer").text(new Date().toLocaleString()), 1)
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
            $(document).one("optionSubmitFail", '.newSubmitButton', (el) => {
                $(document).off("optionSubmitScc", '.newSubmitButton')

            })
            $(document).one("optionSubmitScc", '.newSubmitButton', (el) => {
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
                $(document).off("optionSubmitFail", '.newSubmitButton')
            })
            $(".newSubmitButton").trigger("click")
        })
        $(document).on("click", ".last", () => {
            let csid = _this.state.sid
            let pid = _this.state.pid
            let newIsLast = _this.state.isLast
            let index = _this.state.sidIndex
            $(document).one("optionSubmitScc", '.newSubmitButton', () => {
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
        })



        $(document).on("click", ".expander", async () => {
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
        $(document).on("click", ".optionItem", async () => {
            _this.clickTime = -3000
            await new Promise((res) => {
                setTimeout(() => {
                    res()
                }, 3000);
            })
            let gap = (new Date().getTime() - _this.clickTime)

            if (gap >=1000 && $(".selectPanel").css("display") != "none") {
                let sp = $(".expander>span")
                sp.addClass("oi-chevron-right")
                sp.removeClass("oi-chevron-left")
                $(".stateProfile").show()
                $(".selectPanel").hide()

            }
        })
        $(document).on("mouseenter", ".selectPanel", () => { _this.clickTime =-3000 })
        $(document).on("mouseout", ".selectPanel", () => { _this.clickTime = new Date().getTime() })
        $(document).on("click", ".newSubmitAll", async () => {
            if (_this.submitedAnswers[_this.state.sid] == undefined) {
                _this.submitedAnswers[_this.state.sid] = await _this.props.getLocal(_this.state.sid, {})
                //alert("getLocal:" + JSON.stringify(_this.submitedAnswers[_this.state.sid]))
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
            _this.submitedAnswers[_this.state.sid][_this.state.pid] = uAnswers[_this.state.pid]
            let pid = _this.state.pid
            let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
            sp.prop("class", "oi oi-pin")
            sp.show()
            $(".resultBoard").text("已保存")
            $(".resultBoard").css("color", "black")
            _this.props.setLocal(_this.state.sid, _this.submitedAnswers[_this.state.sid])
            //alert("setLocal:" + JSON.stringify(_this.submitedAnswers[_this.state.sid]))
            for (let index = 0; index < Object.keys(_this.questionPool[_this.state.sid].descriptions).length; index++) {
                let indexStr = (index + 1).toString()
                if (_this.submitedAnswers[_this.state.sid][indexStr] == undefined ||
                    _this.submitedAnswers[_this.state.sid][indexStr].uAnswer == undefined ||
                    _this.submitedAnswers[_this.state.sid][indexStr].uAnswer!.length == 0) {
                    let toGo = _this.notForAll && confirm(`第${index + 1}题，答案为空，确认继续提交？`)
                    if (toGo == true) {
                        answers[index] = "X"
                        _this.submitedAnswers[_this.state.sid][indexStr] = { uAnswer: [], uRight: false, saved: true }
                        _this.notForAll && confirm(`提交全部不再提醒？`) ? _this.notForAll = false : _this.notForAll = true
                    }
                    else {
                        if (_this.notForAll == false) {
                            answers[index] = "X"
                            _this.submitedAnswers[_this.state.sid][indexStr] = { uAnswer: [], uRight: false, saved: true }
                        }
                        else {
                            return
                        }

                    }
                }
                else
                    answers[index] = _this.submitedAnswers[_this.state.sid][indexStr].uAnswer!.join(",")

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
                    url: "http://api.tinylink.cn/problem/quiz/judge",
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
                                _this.submitedAnswers[_this.state.sid][pid].uRight = true
                                sp.prop("class", "oi oi-check")
                                sp.show()
                            }
                            else {
                                _this.submitedAnswers[_this.state.sid][pid].uRight = false
                                sp.prop("class", "oi oi-x")
                                sp.show()
                            }
                        }

                        await _this.props.setLocal(_this.state.sid, _this.submitedAnswers[_this.state.sid])
                        //alert("setLocal:" + JSON.stringify(_this.submitedAnswers[_this.state.sid]))
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
            if (_this.submitedAnswers[_this.state.sid] == undefined) {
                _this.submitedAnswers[_this.state.sid] = await _this.props.getLocal(_this.state.sid, {})
                //alert("getLocal:" + JSON.stringify(_this.submitedAnswers[_this.state.sid]))
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
            uAnswers[_this.state.pid] = { uAnswer: answers, uRight: undefined, saved: true }
            _this.submitedAnswers[_this.state.sid][_this.state.pid] = uAnswers[_this.state.pid]
            let pid = _this.state.pid
            let sp = $(`.optionItem.${_this.state.sid} a[id=${pid}]`).next()
            sp.prop("class", "oi oi-pin")
            sp.show()
            $(".resultBoard").text("已保存")
            $(".resultBoard").css("color", "black")
            await _this.props.setLocal(_this.state.sid, _this.submitedAnswers[_this.state.sid])
            //alert("setLocal:" + JSON.stringify(_this.submitedAnswers[_this.state.sid]))
        })


        $(document).on("click", ".newSubmitButton", async () => {
            if (_this.submitedAnswers[_this.state.sid] == undefined) {
                _this.submitedAnswers[_this.state.sid] = await _this.props.getLocal(_this.state.sid, {})
                //alert("getLocal:" + JSON.stringify(_this.submitedAnswers[_this.state.sid]))
            }
            let answers: string[] = []
            $(".oneOptionDescription.skyblueItem").map((index, html) => {
                answers.push($(html).prop("title"))
                ////alert("aaa")
            })
            if (answers.length == 0) {
                if (confirm("提交的结果为空，确认继续？") == false) {
                    $('.newSubmitButton').trigger("optionSubmitFail")
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
                    url: "http://judge.tinylink.cn/quiz/choices/judge",
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
                            _this.submitedAnswers[_this.state.sid][pid] = uAnswers[_this.state.pid]
                            sp.prop("class", "oi oi-check")
                            $(".resultBoard").text("答案正确")
                            $(".resultBoard").css("color", "green")
                            sp.show()
                        }
                        else {
                            uAnswers[_this.state.pid]["uRight"] = false
                            _this.submitedAnswers[_this.state.sid][pid] = uAnswers[_this.state.pid]
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
                        $('.newSubmitButton').trigger("optionSubmitScc")
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
                <div style={{ height: "100%", zIndex: 0 }}>
                    <div className="title_timer col-12"><h4> {_this.title}</h4><span id='timer'></span></div>
                    <MyContext.Provider value={{
                        setTypeData: (sid: string, types: any) => {
                            _this.typeData[sid] = types
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
                            paddingLeft: '0px'
                        }}>
                            <div className="col-12" style={{
                                height: "98%", overflow: "scroll",
                                boxShadow: '5px 5px 5px black', backgroundColor: "#262527", zIndex: 1,
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
                            {(_this.state.sidIndex + 1) > 0 ? `${$(`.section${_this.state.sidIndex + 1}`).text()} 选择题${_this.state.pid}` : `error`}
                        </div>

                        <div className="row col-12" style={{
                            height: "90%", zIndex: 0, margin: 0,
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
                                {this.state.viewType == "1" ? <button className="newSubmitButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</button>
                                    :
                                    this.state.isLast ? <button className="newSubmitAll btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>提交</button>//考试模式
                                        :
                                        <button className="newSaveButton btn btn-primary" style={{ right: '5px', bottom: '10px', position: "absolute" }}>保存</button>
                                }
                            </div>

                        </div>
                    </MyContext.Provider >
                </div >

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
                        <div></div>
        )
    }
}
