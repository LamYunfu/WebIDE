import React = require("react");
import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import { find } from "@phosphor/algorithm";
import { VideoItem, } from "./video-view"
import { OptionItem, OptionInfo, } from './option-issue'
import { CodeItem, CodingInfo } from './code-issue'
export namespace SectionUI {
    export interface Props {
        sid: string
        sectionData: { [key: string]: { answer: string, isRight: boolean } }
        setSectionDataPool: (sid: string, data: {}) => void
        section: { [key: string]: string }
        connect: (loginType: string, model: string, pid: string, timeout: string) => void
        disconnect: () => void
        callUpdate: () => void
        openSrcFile: (uri: URI) => void
        postSrcFile: (fn: string) => void
        createSrcFile: (fns: string[]) => void
        gotoVideo: (uri: string, videoName: string) => void
        say: (verbose: string) => void
        outputResult: (res: string) => void
        setQueue: () => void
    }


    export interface State {
        codingItems: JSX.Element[]
        optionItems: JSX.Element[]
    }
}
export class SectionUI extends React.Component<SectionUI.Props, SectionUI.State>{
    // submittedOptionAnswers: { [pid: string]: { answer: string, isRight: boolean } }
    // setSubmittedOptionAnswer: (section: string, pid: string, answer: string, isRight: boolean) => void
    timeout: { [key: string]: string } = {}
    model: { [key: string]: string } = {}
    loginType: { [key: string]: string } = {}
    role: { [key: string]: string[] } = {}
    currentFocusCodingIndex: string[] = ['00000']
    optionIssues: { [key: string]: string } = {}
    optionStatus: { [key: string]: string } = {}
    choices: { [key: string]: string[] } = {}
    answers: { [key: string]: string } = {}
    codingIssues: { [key: string]: string } = {}
    codingInfos: { [key: string]: string } = {}
    codingStatus: { [key: string]: string } = {}
    judgeStatus: string[] = []
    submittedOptionIssue: { [key: string]: string } = {}
    submittedCodingIssue: string[] = []
    statusCode: { [key: number]: string } = {
        0x0000: 'NO_GEN',
        0x0001: 'GEN_FAIL',
        0x0010: 'NO_SUB',
        0x0011: "JUDGING",
        0x0012: 'PROG_ERR',
        0x0020: 'ACCEPT',
        0x0021: 'WRONG_ANSWER',
        0x0022: 'TIMEOUT'
    }
    statusColors: { [key: number]: string } = {
        0x0000: 'white',
        0x0001: 'black',
        0x0010: 'white',
        0x0011: "yellow",
        0x0012: 'black',
        0x0020: 'green',
        0x0021: 'red',
        0x0022: 'grey'
    }
    videoNames: string[] = []
    uris: string[] = []
    pids: string[] = []
    optionItems: JSX.Element[] = []
    codingItems: JSX.Element[] = []
    get submittedOptionAnswers() {
        return this.props.sectionData
    }
    setSubmittedOptionAnswer = (pid: string, answer: string, isRight: boolean) => {
        let tmp: { [key: string]: {} } = this.submittedOptionAnswers
        tmp[pid] = {
            answer: answer,
            isRight: isRight
        }
        this.props.setSectionDataPool(this.props.sid, tmp)

    }
    addSubmittedCodingIssue = (issueIndex: string) => {
        this.submittedCodingIssue.push(issueIndex)
    }


    constructor(props: Readonly<SectionUI.Props>) {
        super(props)
        this.state = {
            codingItems: [],
            optionItems: []
        }
    }


    componentWillMount() {

        let _this = this
        this.videoNames = [this.props.section.video]
        this.uris = [`http://linklab.tinylink.cn/${this.props.section.video}`]
        this.setState((state) => ({
            ...state,
            optionItems: _this.optionItems,
            codingItems: _this.codingItems
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
                url: "http://judge.tinylink.cn/quiz/content",
                dataType: 'json',
                contentType: "text/plain",
                data: JSON.stringify({ qzid: _this.props.section.qzid }),
                success: function (data) {
                    // console.log("options :" + JSON.stringify(data) + "!!!!!!!!!!")
                    let x = data.question
                    for (let item of x) {
                        _this.optionIssues[item.order] = item.description
                        _this.answers[item.order] = item.answer
                        _this.choices[item.order] = item.choices.split("\n")
                    }
                    for (let index in _this.optionIssues)
                        _this.optionItems.push(<OptionItem submittedOptionAnswers={_this.props.sectionData} optionIssues={_this.optionIssues} sid={_this.props.sid} akey={index} key={index} choices={_this.choices}
                            optionStatus={_this.optionStatus} titles={_this.optionIssues} />)

                    _this.setState((state) => ({
                        ...state,
                        optionItems: _this.optionItems,
                    }))
                    //_this.props.callUpdate()
                }
            }
        )

        _this.props.section.ppid != 'null' && $.ajax(
            {
                headers: {
                    "accept": "application/json",
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                method: "POST",
                url: "http://api.tinylink.cn/problem/detail",

                dataType: 'json',
                contentType: "text/plain",
                data: JSON.stringify({ ppid: _this.props.section.ppid }), // serializes the form's elements.
                success: function (data) {
                    // alert(JSON.stringify(data))
                    console.log(JSON.stringify(data))
                    let x = data.data; // show response from the php script.
                    let fns = []
                    // for (let item of x) {

                    //     _this.codingIssues[item.pid] = item.title
                    //     fns.push(item.title)
                    //     _this.codingInfos[item.pid] = item.content
                    //     _this.pids.push(item.pid)
                    // }
                    for (let item of x) {
                        if (item.deviceRole[0] == 'null') {
                            _this.loginType[`${item.pid}`] = 'adhoc'
                            _this.model[`${item.pid}`] = 'any'
                        }
                        else if (item.deviceRole.length == 1) {
                            // _this.loginType[`${item.pid}`] = 'fixed'
                            _this.model[`${item.pid}`] = item.deviceType
                            _this.loginType[`${item.pid}`] = 'adhoc'
                            // _this.model[`${item.pid}`] = 'any'
                        }
                        else if (item.deviceRole.length > 1) {
                            _this.loginType[`${item.pid}`] = 'group'
                            _this.model[`${item.pid}`] = item.deviceType
                            _this.role[`${item.pid}`] = item.deviceRole
                        }
                        alert(item.timeout)
                        _this.timeout[item.pid] = item.timeout
                        _this.codingIssues[item.pid] = item.title
                        if (_this.role[`${item.pid}`] == undefined)
                            fns.push(item.title)
                        else {
                            for (let r of _this.role[`${item.pid}`]) {
                                fns.push(item.title + r)
                                console.log(`fileName is............................${item.title + r}`)
                            }
                        }
                        _this.codingInfos[item.pid] = item.content
                        _this.pids.push(item.pid)
                    }
                    // _this.props.createSrcFile(fns)
                    // for (let entry in _this.codingIssues)
                    //     _this.codingItems.push(<CodeItem sid={_this.props.sid} akey={entry} key={entry}
                    //         codingInfos={_this.codingInfos} codingTitles={_this.codingIssues}
                    //         codingStatus={_this.codingStatus} openSrcFile={_this.props.openSrcFile} />)
                    // _this.setState((state) => ({
                    //     ...state,
                    //     codingItems: _this.codingItems
                    // }))
                    _this.props.createSrcFile(fns)
                    for (let entry in _this.codingIssues)
                        _this.codingItems.push(<CodeItem loginType={_this.loginType[entry]} model={_this.model[entry]}
                            role={_this.role[entry]} sid={_this.props.sid} akey={entry} key={entry}
                            codingInfos={_this.codingInfos} codingTitles={_this.codingIssues}
                            codingStatus={_this.codingStatus} openSrcFile={_this.props.openSrcFile} />)
                    _this.setState((state) => ({
                        ...state,
                        codingItems: _this.codingItems
                    }))
                }
            }
        )
    }


    submittedOptionStatus: { [key: string]: string } = {}
    componentDidMount() {
        let _this = this
        $(document).ready(
            () => {
                $(document).on("click", ".section" + _this.props.sid, (e) => {
                    console.log("section click...................")
                    $(".contentsAndInfos" + _this.props.sid).toggle()
                })
            }
        )
        $(document).ready(
            () => {
                // $(".optionItem").on('click',
                $(document).on('click', ".optionItem." + _this.props.sid,
                    (e) => {
                        console.log("click.............................")
                        $(".codingInfos." + _this.props.sid).hide()
                        $(".optionInfos." + _this.props.sid).show()
                        let x = $(e.currentTarget).children("a").attr("id")
                        if (x != undefined) {
                            $(".optionIssueTitle" + _this.props.sid).text(this.optionIssues[x])
                            $("form.options" + _this.props.sid).attr("id", x)
                            for (let index in this.choices[x]) {
                                let op = $(`.optionContent${_this.props.sid}:eq(${index})`)
                                op.text(this.choices[x][index])
                            }
                            if (_this.submittedOptionAnswers[x] != undefined) {
                                $(`#optionRadio${_this.props.sid}${_this.submittedOptionAnswers[x].answer}`).prop("checked", true)
                            }
                        }
                    }
                )

            })

        setInterval(() => {
            _this.pids.length != 0 && $.ajax(
                {
                    headers: {
                        "accept": "application/json",
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    method: "POST",
                    url: "http://judge.tinylink.cn/problem/status",
                    dataType: 'json',
                    // contentType: "text/plain",
                    data: JSON.stringify({ pid: _this.pids }),
                    success: function (data) {
                        for (let x of _this.pids) {
                            console.log("pid:" + x + "!")
                        }
                        let tmp = data.problem
                        for (let x of tmp) {
                            _this.codingStatus[x.pid] = x.status
                            if (find(_this.submittedCodingIssue, (value, index) => x.pid == value) == undefined) {

                                continue
                            }
                            let status = _this.statusCode[parseInt(x.status)];
                            if (status == 'JUDGING') {
                                //$(`.codeItem${_this.props.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-warning");
                                let sp = $(`.codeItem${_this.props.sid} a[title=${x.pid}]`).next()
                                // console.log("judging.....................................")
                                sp.attr("class", "oi oi-ellipses")
                                sp.show()
                                _this.judgeStatus[x.pid] = '1'
                            } else if (status == 'ACCEPT') {
                                //$(`.codeItem${_this.props.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-success");
                                $(`.codeItem${_this.props.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-check")
                                if (_this.judgeStatus[x.pid] == '1') {
                                    _this.props.outputResult("::ACCEPT")
                                    _this.submittedCodingIssue.splice(_this.submittedCodingIssue.indexOf(x.pid))
                                    _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid))
                                }
                            } else if (status == 'WRONG_ANSWER') {
                                //$(`.codeItem${_this.props.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-danger");
                                $(`.codeItem${_this.props.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-x")
                                // alert(_this.judgeStatus[x.pid])
                                if (_this.judgeStatus[x.pid] == '1') {

                                    _this.props.outputResult("::WRONG_ANSWER")
                                    _this.submittedCodingIssue.splice(_this.submittedCodingIssue.indexOf(x.pid))
                                    _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid))
                                }
                            } else if (status == 'TIMEOUT') {
                                //$(`.codeItem${_this.props.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-info");
                                $(`.codeItem${_this.props.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-clock")
                            } else {
                                //$(`.codeItem${_this.props.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-dark");
                                $(`.codeItem${_this.props.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-question-mark")
                            }
                        }

                    }
                }
            )

        }, 5000)

        $(document).ready(
            () => {
                $("#connectButton" + _this.props.sid).click(
                    (e) => {
                        if ($(e.currentTarget).text() == "断开") {
                            _this.props.disconnect()
                            $(e.currentTarget).text("连接")
                            $("#setQueue" + this.props.sid).show()

                        }
                        else {
                            let val = $("#codingInfoArea" + _this.props.sid).attr("title")
                            // alert(val)
                            val != undefined && (_this.currentFocusCodingIndex[0] = val)
                            console.log("<<<<<<<<<set current coding indexs:" + _this.currentFocusCodingIndex[0])
                            console.log("<<<<<<<<funny:")
                            console.log("something " + this.loginType[val!] + ":" + _this.model[val!])
                            val != undefined && _this.props.connect(_this.loginType[val], _this.model[val], val, _this.timeout[val])

                            $(e.currentTarget).text("断开")
                        }
                    }
                )
                $("#setQueue" + this.props.sid).click(
                    () => {
                        console.log("click queue")
                        let index = $("#codingInfoArea" + this.props.sid).attr("title")
                        if (_this.currentFocusCodingIndex[0] != index) {
                            _this.props.say("所连设备与当前题目所需不一致,请重新连接设备")
                            return
                        }
                        _this.props.setQueue()
                        _this.props.say("已设为排队模式")
                        $("#setQueue" + this.props.sid).hide()
                    }
                )
                $(document).on("click", ".list-group-item", (e) => {
                    $(".list-group-item").each((i, _this) => {
                        $(_this).removeClass("list-group-item-primary")
                    })
                    $(e.currentTarget).addClass("list-group-item-primary")
                })
            }
        )
        $(document).ready(
            () => {

                $(document).on("click", ".videoItem" + _this.props.sid, (e) => {
                    let index = $(e.currentTarget).children('.videoName').attr("title")
                    console.log("video uri ..........." + index)
                    index != undefined && _this.props.gotoVideo(_this.uris[parseInt(index)], this.videoNames[parseInt(index)])
                })
            }
        )
    }

    render(): React.ReactNode {
        // if(this.submittedOptionAnswers[this.props.sid]
        return (
            <div >
                <h5 className={`section${this.props.sid}`}> {this.props.sid}. {this.props.section.title}</h5>
                <div className={`contentsAndInfos${this.props.sid} container`}>
                    <div className="row">
                        <div className="contents col-5" style={{ "padding": "0px" }}>

                            {/* <div className={`coding${this.props.sid} col-12`} > */}
                            <ul className="list-group">
                                <VideoItem sid={this.props.sid} title='0' videoNames={[this.props.section.video]} uris={this.uris} gotoVideo={this.props.gotoVideo}></VideoItem>
                                {this.state.optionItems.length == 0 ? "" : this.optionItems}
                                {this.state.codingItems.length == 0 ? "" : this.codingItems}
                            </ul>
                            {/* </div> */}

                        </div>
                        <div className={`codingInfos ${this.props.sid} col-7`} >
                            <CodingInfo roles={this.role} sid={this.props.sid} say={this.props.say} currentFocusCodingIndex={this.currentFocusCodingIndex} issueStatusStrs={this.codingStatus} coding_titles={this.codingIssues}
                                postSrcFile={this.props.postSrcFile} addCodingSubmittedIssue={this.addSubmittedCodingIssue} />
                        </div>
                        <div className={`optionInfos ${this.props.sid} col-7`} >
                            <OptionInfo submittedOptionAnswers={this.submittedOptionAnswers} setSubmittedOptionAnswer={this.setSubmittedOptionAnswer}
                                sid={this.props.sid} say={this.props.say} answers={this.answers} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}