import React = require("react");
import URI from "@theia/core/lib/common/uri";
import * as $ from "jquery"
import { find } from "@phosphor/algorithm";
import { VideoItem, } from "./video-view"
import { OptionItem, OptionInfo, } from './option-issue'
import { CodeItem, CodingInfo } from './code-issue'
export namespace SectionUI {
    export interface Props {
        section: { [key: string]: string }
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
        codingItems: JSX.Element[]
        optionItems: JSX.Element[]
    }
}
export class SectionUI extends React.Component<SectionUI.Props, SectionUI.State>{
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
    addOptionStatus = (pid: string, selected: string) => {
        this.submittedOptionIssue[pid] = selected
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
                        _this.optionItems.push(<OptionItem optionIssues={this.optionIssues} sid={_this.props.section.sid} akey={index} key={index} choices={_this.choices}
                            optionStatus={_this.optionStatus} titles={_this.optionIssues} submittedOptionStatus={_this.submittedOptionIssue} />)

                    _this.setState((state) => ({
                        ...state,
                        optionItems: _this.optionItems,
                    }))
                    //_this.props.callUpdate()
                }
            }
        )
        //TODO get codeInfo
        $.ajax(
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
                    for (let item of x) {
                        _this.codingIssues[item.pid] = item.title
                        fns.push(item.title)
                        _this.codingInfos[item.pid] = item.content
                        _this.pids.push(item.pid)
                    }
                    _this.props.createSrcFile(fns)
                    for (let entry in _this.codingIssues)
                        _this.codingItems.push(<CodeItem sid={_this.props.section.sid} akey={entry} key={entry}
                            codingInfos={_this.codingInfos} codingTitles={_this.codingIssues}
                            codingStatus={_this.codingStatus} openSrcFile={_this.props.openSrcFile} />)
                    _this.setState((state) => ({
                        ...state,
                        codingItems: _this.codingItems
                    }))
                    //_this.props.callUpdate()

                }
            }
        )
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
        //_this.props.callUpdate()
    }
    submittedOptionStatus: { [key: string]: string } = {}
    componentDidMount() {
        let _this = this
        $(document).ready(
            () => {
                $(document).on("click", ".section" + _this.props.section.sid, (e) => {
                    console.log("section click...................")
                    $(".contentsAndInfos" + _this.props.section.sid).toggle()
                })
            }
        )
        $(document).ready(
            () => {
                // $(".optionItem").on('click',
                $(document).on('click', ".optionItem." + _this.props.section.sid,
                    (e) => {
                        console.log("click.............................")
                        $(".codingInfos." + _this.props.section.sid).hide()
                        $(".optionInfos." + _this.props.section.sid).show()
                        let x = $(e.currentTarget).children("a").attr("id")
                        if (x != undefined) {
                            $(".optionIssueTitle" + _this.props.section.sid).text(this.optionIssues[x])
                            $("form.options" + _this.props.section.sid).attr("id", x)
                            for (let index in this.choices[x]) {
                                let op = $(`.optionContent${_this.props.section.sid}:eq(${index})`)
                                op.text(this.choices[x][index])
                            }
                            if (this.submittedOptionStatus[x] == undefined) {
                                $("form.options" + _this.props.section.sid + ".opinput:radio").attr("checked", "false");
                            }
                            else {
                                $(`#optionRadio${_this.props.section.sid}${_this.submittedOptionStatus[x]}`).prop("checked", true)

                            }
                        }
                    }
                )

            })

        setInterval(() => {
            $.ajax(
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
                        // alert(JSON.stringify(data))
                        let tmp = data.problem
                        for (let x of tmp) {
                            _this.codingStatus[x.pid] = x.status
                            if (find(_this.submittedCodingIssue, (value, index) => x.pid == value) == undefined) {

                                continue
                            }
                            let status = _this.statusCode[parseInt(x.status)];
                            if (status == 'JUDGING') {
                                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-warning");
                                let sp = $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).next()
                                console.log("judging.....................................")
                                sp.attr("class", "oi oi-ellipses")
                                sp.show()
                                _this.judgeStatus[x.pid] = '1'
                            } else if (status == 'ACCEPT') {
                                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-success");
                                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-check")
                                if (_this.judgeStatus[x.pid] == '1') {
                                    _this.props.outputResult("::ACCEPT")
                                    _this.submittedCodingIssue.splice(_this.submittedCodingIssue.indexOf(x.pid))
                                    _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid))
                                }
                            } else if (status == 'WRONG_ANSWER') {
                                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-danger");
                                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-x")
                                // alert(_this.judgeStatus[x.pid])
                                if (_this.judgeStatus[x.pid] == '1') {

                                    _this.props.outputResult("::WRONG_ANSWER")
                                    _this.submittedCodingIssue.splice(_this.submittedCodingIssue.indexOf(x.pid))
                                    _this.judgeStatus.splice(_this.judgeStatus.indexOf(x.pid))
                                }
                            } else if (status == 'TIMEOUT') {
                                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-info");
                                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-clock")
                            } else {
                                //$(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).parent().attr("class", "codeItem list-group-item list-group-item-dark");
                                $(`.codeItem${_this.props.section.sid} a[title=${x.pid}]`).next().attr("class", "oi oi-question-mark")
                            }
                        }

                    }
                }
            )

        }, 2000)

        $(document).ready(
            () => {
                $("#connectButton" + _this.props.section.sid).click(
                    (e) => {
                        if ($(e.currentTarget).text() == "断开") {
                            _this.props.disconnect()
                            $(e.currentTarget).text("连接")
                        }
                        else {
                            let val = $("#codingInfoArea" + _this.props.section.sid).attr("title")
                            // alert(val)
                            val != undefined && (_this.currentFocusCodingIndex[0] = val)
                            console.log("<<<<<<<<<set current coding index:" + _this.currentFocusCodingIndex[0])
                            val != undefined && _this.props.connect(val)
                            $(e.currentTarget).text("断开")
                        }
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
                $(".videoItem" + _this.props.section.sid).map((xx, ht) => {
                    $(ht).click((e) => {
                        let index = $(e.currentTarget).children('.videoName').attr("title")
                        index != undefined && _this.props.gotoVideo(this.uris[parseInt(index)], this.videoNames[parseInt(index)])
                    })
                })
            }
        )
    }

    render(): React.ReactNode {
        return (
            <div >
                <h5 className={`section${this.props.section.sid}`}> {this.props.section.sid}. {this.props.section.title}</h5>
                <div className={`contentsAndInfos${this.props.section.sid} container`}>
                    <div className="row">
                        <div className="contents col-5">
                            <div className="row">
                                <div className={`coding${this.props.section.sid} col-12`}>
                                    <ul className="list-group">
                                        <VideoItem sid={this.props.section.sid} title='0' videoNames={[this.props.section.video]} uris={[`http://linklab.tinylink.cn/${this.props.section.video}`]} gotoVideo={this.props.gotoVideo}></VideoItem>
                                        {this.state.optionItems.length == 0 ? "loading" : this.optionItems}
                                        {this.state.codingItems.length == 0 ? "loading" : this.codingItems}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={`codingInfos ${this.props.section.sid} col-7`} >
                            <CodingInfo sid={this.props.section.sid} say={this.props.say} currentFocusCodingIndex={this.currentFocusCodingIndex} issueStatusStrs={this.codingStatus} coding_titles={this.codingIssues}
                                postSrcFile={this.props.postSrcFile} addCodingSubmittedIssue={this.addSubmittedCodingIssue} />
                        </div>
                        <div className={`optionInfos ${this.props.section.sid} col-7`} >
                            <OptionInfo sid={this.props.section.sid} say={this.props.say} addOptionStatus={this.addOptionStatus} answers={this.answers} submittedOptionStatus={this.submittedOptionIssue} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}