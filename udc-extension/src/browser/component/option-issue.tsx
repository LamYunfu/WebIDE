import React = require("react");
import * as $ from "jquery"
import { Logger } from "../../node/util/logger";
export namespace OptionItem {
    export interface Props {
        type: string,
        sid: string,
        akey: string
        titles: { [key: string]: string }
        choices: { [key: string]: string[] }
        optionStatus: { [key: string]: string }
        optionIssues: { [key: string]: string }
        qzid: string
        scid: string
        uRight: boolean | undefined
        saved: boolean | undefined
    }
}
export class OptionItem extends React.Component<OptionItem.Props> {
    componentWillMount() {

    }


    componentDidMount() {
    }


    public render(): JSX.Element {
        return (
            <li className={`optionItem ${this.props.sid} list-group-item`} >
                <span className={`scid ${this.props.sid}`} style={{ display: "none" }} >{this.props.scid}</span>
                <span className={`qzid ${this.props.sid}`} style={{ display: "none" }}>{this.props.qzid}</span>
                <span className="index" style={{ display: "none" }}>{this.props.akey}</span>
                <span className="oi oi-pencil" aria-hidden="true"></span>
                <a id={this.props.akey} style={{ textAlign: "center" }} >选择题{this.props.akey} </a>&nbsp;
                <span className={this.props.uRight == undefined ? this.props.saved ? "oi oi-pin" :
                    "oi"
                    :
                    this.props.uRight ? "oi oi-check"
                        : "oi oi-x"
                } aria-hidden="true" style={this.props.uRight == undefined && this.props.saved != true ? { display: "none", float: "right" } : { display: "inline", float: "right" }}></span>
                {/* <a className="issue_status">●</a><br /> */}
            </li >

        )
    }
}


export namespace OptionInfo {
    export interface Props {
        contentsCollection: { [key: string]: string[] }
        answersCollection: { [key: string]: string }
        titlesCollection: { [key: string]: string }
        sid: string
        answers: { [key: string]: string }
        submittedOptionAnswers: { [pid: string]: { answer: string, isRight: boolean } }
        setSubmittedOptionAnswer: (pid: string, answer: string, isRight: boolean) => void
        say: (thing: string) => void
        types: { [key: string]: string }
        setLocal: (key: string, obj: object) => void
        getLocal: (key: string, obj: object) => object
        submitStyle: string

    }
    export interface States {
        status: string
    }

}


export class OptionInfo extends React.Component<OptionInfo.Props, OptionInfo.States>{
    public render() {
        return (

            <ChoiceCollection submitStyle={this.props.submitStyle} getLocal={this.props.getLocal} setLocal={this.props.setLocal} types={this.props.types} contentsCollection={this.props.contentsCollection}
                titlesCollection={this.props.titlesCollection} sid={this.props.sid} ></ChoiceCollection>

        )
    }
}
export namespace Choice {
    export interface Props {
        sid: string
        content: string
        choiceNum: string
        type: string
        pid: string
        checked: boolean
    }
    export interface States {
        checked: boolean
    }
}
export class Choice extends React.Component<Choice.Props, Choice.States>{
    constructor(props: Readonly<Choice.Props>) {
        super(props)
        this.state = {
            checked: this.props.checked
        }
    }

    render(): JSX.Element {
        return (
            this.props.type == "MC" ?
                <div className="custom-control custom-checkbox">
                    <input className="custom-control-input" id={`optionCheck${this.props.sid}${this.props.choiceNum}`} type="checkbox" name={this.props.pid} value={this.props.choiceNum} />
                    <label className="custom-control-label" htmlFor={`optionCheck${this.props.sid}${this.props.choiceNum}`}>
                        <span className={`optionContent${this.props.sid}`}>{this.props.content}</span><br />
                    </label>
                </div>
                :
                <div className="custom-control custom-radio">
                    <input className="custom-control-input" id={`optionRadio${this.props.sid}${this.props.choiceNum}`} type="radio" defaultChecked={this.props.checked} name={this.props.pid} value={this.props.choiceNum} />
                    <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}${this.props.choiceNum}`}>
                        <span className={`optionContent${this.props.sid}`}>{this.props.content}</span><br />
                    </label>
                </div>
        )
    }

    componentDidMount() {
        if (this.props.checked) {
            $(`input[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", true)

        }
        else {
            $(`input[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", false)
        }
    }
    componentWillMount() {
        if (this.props.checked) {
            $(`input:visible[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", true)

        }
        else {
            $(`input:visible[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", false)
        }
    }
    componentWillUpdate() {
        if (this.props.checked) {
            $(`input:visible[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", true)

        }
        else {
            $(`input:visible[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", false)
        }
    }
    componentDidUpdate() {
        if (this.props.checked) {
            $(`input:visible[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", true)

        }
        else {
            $(`input:visible[name=${this.props.pid}][value=${this.props.choiceNum}]`).prop("checked", false)
        }
    }

}
export namespace ChoiceCollection {
    export interface Props {
        contentsCollection: { [key: string]: string[] }
        // answersCollection: { [key: string]: string }
        titlesCollection: { [key: string]: string }
        sid: string
        types: { [key: string]: string }
        setLocal: (key: string, obj: any) => void
        getLocal: (key: string, obj: any) => any
        submitStyle: string
    }
    export interface States {
        sid: string
        uAnswers: { [key: string]: any }
        contents: string[]
        pid: string
        title: string
        type: string
        submitStyle: string
        qzid: string
        scid: string
    }

}
export class ChoiceCollection extends React.Component<ChoiceCollection.Props, ChoiceCollection.States>{
    uAnswers: { [pid: string]: { answer: string[], uRight: boolean | undefined } } = {}
    isSubmitted: boolean = false
    constructor(props: Readonly<ChoiceCollection.Props>) {
        super(props)
        this.state = {
            ... this.state,
            sid: "",
            uAnswers: {},
            contents: [],
            pid: "",
            title: "",
            type: "",
            submitStyle: "single",
            qzid: "",
            scid: ""
        }
    }

    async componentWillMount() {
        this.isSubmitted = await this.props.getLocal(this.props.sid + "isSubmitted", {})
        Logger.info(this.isSubmitted, "isSubmitted:")
        this.uAnswers = {
            ... await this.props.getLocal(this.props.sid, {})
        }
        Logger.info(JSON.stringify(this.uAnswers), "storage:")
        this.setState({
            uAnswers: this.uAnswers
        })
    }

    render(): JSX.Element {
        let carr = []
        for (let index in this.state.contents) {
            console.log(index)
            // alert(`tmp:${tmp}`)
            carr.push(<Choice type={this.state.type} pid={this.state.pid} sid={this.state.sid} content={this.state.contents[index]}
                choiceNum={(parseInt(index) + 1).toString()} checked={this.state.uAnswers[this.state.pid] == undefined ? false : this.state.uAnswers[this.state.pid].answer.indexOf((parseInt(index) + 1).toString()) != -1}>
            </ Choice >)
        }
        return (//一次性提交、单次提交
            this.state.contents == [] || this.state.contents == undefined || this.state.uAnswers == {} ? <div>loading</div> :


                this.props.submitStyle == "single" ?
                    <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>

                        <div className="card-body">
                            <p className={"optionIssueTitle" + this.props.sid}>
                                {this.state.title}
                            </p>
                            <form className={`options${this.state.sid}`} id={this.state.pid}  >
                                {carr}
                            </form>

                        </div>
                        <button className={`optionInfoSubmitSingle${this.state.sid} btn btn-primary`} type="button">提交</button>
                    </div>
                    :
                    this.state.pid != Object.keys(this.props.contentsCollection).length.toString() ?
                        <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>
                            <span className={`qzid ${this.props.sid}`} style={{ display: "none" }}></span>
                            <div className="card-body">
                                <p className={"optionIssueTitle" + this.props.sid}>
                                    {this.state.title}
                                </p>
                                <form className={`options${this.state.sid}`} id={this.state.pid}  >
                                    {carr}
                                </form>

                            </div>
                            <button className={`optionInfoSubmit${this.state.sid} btn btn-primary`} type="button">保存</button>
                        </div>
                        :
                        <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>
                            <div className="card-body">
                                <p className={"optionIssueTitle" + this.props.sid}>
                                    {this.state.title}
                                </p>
                                <form className={`options${this.state.sid}`} id={this.state.pid}  >
                                    {carr}
                                </form>

                            </div>
                            <button className={`optionInfoSubmit${this.state.sid} all btn btn-primary`} type="button">提交全部</button>
                        </div>


        )
    }

    async componentDidMount() {
        let _this = this
        // let uAnswers = await _this.props.getLocal(_this.props.sid, {})
        // alert(JSON.stringify(uAnswers))
        $(document).on('click', ".optionItem." + _this.props.sid, (e) => {
            let index = $(e.currentTarget).children(".index").text()
            let qzid = $(e.currentTarget).children(".qzid").text()
            let scid = $(e.currentTarget).children(".scid").text()
            console.log(index + ".............index")
            console.log("types:::::::::"+ _this.props.types[index])
            _this.setState(() => ({
                ..._this.state,
                sid: _this.props.sid,
                pid: index,
                contents: _this.props.contentsCollection[index],
                titles: _this.props.titlesCollection[index],
                // answers: _this.props.answersCollection[index],
                uAnswers: _this.uAnswers,
                type: _this.props.types[index],
                qzid: qzid,
                scid: scid
            }))
            

        })
        $(document).on('click', `.optionInfoSubmit${this.props.sid}`, (e) => {
            console.log("click!!!!!!!!!!!!!")
            if (_this.isSubmitted) {
                alert("无法保存！")
                return
            }
            let answers: string[] = []
            $("input:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })
            // alert(JSON.stringify(answers))
            let pid = _this.state.pid
            // alert("pid:" + pid)
            let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
            _this.uAnswers[_this.state.pid] = { answer: answers, uRight: undefined }
            sp.prop("class", "oi oi-pin")
            sp.show()
            _this.props.setLocal(_this.props.sid, _this.uAnswers)
            // alert("right")


        })

        // $(document).on('click', `.section9`, (e) => {
        $(document).on('click', `.optionInfoSubmit${this.props.sid}.all`, (e) => {
            console.log("click!!!!!!!!!!!!!")
            if (_this.isSubmitted) {
                alert("无法提交！")
                return
            }
            let answers: string[] = []

            $("input:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })
            // alert(JSON.stringify(answers))
            let pid = _this.state.pid
            // alert("pid:" + pid)
            let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
            _this.uAnswers[_this.state.pid] = { answer: answers, uRight: undefined }
            sp.prop("class", "oi oi-pin")
            sp.show()
            let answersForSubmit = []
            for (let index = 0; index < Object.keys(_this.props.contentsCollection).length; index++) {
                let indexstr = (index + 1).toString()
                if (_this.uAnswers[indexstr] == undefined || _this.uAnswers[indexstr].answer == [])
                    answersForSubmit[index] = "X"
                else
                    answersForSubmit[index] = _this.uAnswers[indexstr].answer.join(",")
            }
            let tmp = "提交的答案为："
            for (let index in answersForSubmit) {
                tmp += "  " + (parseInt(index) + 1).toString() + ": " + answersForSubmit[index]
            }
            alert(JSON.stringify(tmp))
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
                        answer: answersForSubmit
                    }),
                    success: async function (data) {
                        let correctItem: string[] = data.data.correct
                        for (let item in correctItem) {
                            let pid = (parseInt(item) + 1).toString()
                            let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
                            if (correctItem[item] == "1") {
                                _this.uAnswers[_this.state.pid].uRight = true
                                sp.prop("class", "oi oi-check")
                                sp.show()
                            }
                            else {
                                _this.uAnswers[_this.state.pid].uRight = false
                                sp.prop("class", "oi oi-x")
                                sp.show()
                            }
                        }
                        _this.isSubmitted = true
                        _this.props.setLocal(_this.props.sid + "isSubmitted", _this.isSubmitted)
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
        $(document).on('click', `.optionInfoSubmitSingle${this.props.sid}`, async (e) => {
            let answers: string[] = []
            $("input:visible:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })

            _this.uAnswers[_this.state.pid] = { answer: answers, uRight: undefined }

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
                        let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
                        if (correctItem == "1") {
                            _this.uAnswers[_this.state.pid].uRight = true
                            sp.prop("class", "oi oi-check")
                            sp.show()
                        }
                        else {
                            sp.prop("class", "oi oi-x")
                            sp.show()
                            _this.uAnswers[_this.state.pid].uRight = false
                        }
                        _this.props.setLocal(_this.props.sid, _this.uAnswers)
                        // _this.uAnswers[_this.state.pid] = { answer: [], uRight: false }
                    }
                }
            )
        })

    }
}
