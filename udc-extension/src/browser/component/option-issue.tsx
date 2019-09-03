import React = require("react");
import * as $ from "jquery"
export namespace OptionItem {
    export interface Props {
        type: string,
        sid: string,
        akey: string
        titles: { [key: string]: string }
        choices: { [key: string]: string[] }
        optionStatus: { [key: string]: string }
        optionIssues: { [key: string]: string }
        // addOptionStatus: (pid: string, selected: string) => void
        submittedOptionAnswers: { [key: string]: { answer: string, isRight: boolean } }
    }
}
export class OptionItem extends React.Component<OptionItem.Props> {
    componentWillMount() {

    }


    componentDidMount() {
        let tmp = this.props.submittedOptionAnswers[this.props.akey]
        if (tmp != undefined) {
            let sp = $(`.optionItem.${this.props.sid}  a[id=${this.props.akey}]`).next()
            if (tmp.isRight) {
                sp.attr("class", "oi oi-check")
                sp.show()
            }
            else {

                sp.attr("class", "oi oi-x")
                sp.show()
            }

        }
    }


    public render(): JSX.Element {
        return (
            <li className={`optionItem ${this.props.sid} list-group-item`} >
                <span className="index" style={{ display: "none" }}>{this.props.akey}</span>
                <span className="oi oi-pencil" aria-hidden="true"></span>
                <a id={this.props.akey} style={{ textAlign: "center" }} >选择题{this.props.akey} </a>&nbsp;
                <span className="oi" aria-hidden="true" style={{ display: "none", float: "right" }}></span>
                {/* <a className="issue_status">●</a><br /> */}
            </li>

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

    }
    export interface States {
        status: string
    }

}


export class OptionInfo extends React.Component<OptionInfo.Props, OptionInfo.States>{
    // componentDidMount() {
    //     let _this = this
    //     $(document).ready(
    //         () => {
    //             $(".optionInfoSubmit" + _this.props.sid).click(
    //                 (e) => {
    //                     e.preventDefault()
    //                     let idv = $(".options" + _this.props.sid).attr("id")
    //                     if (idv == undefined) {
    //                         alert("ERR:NO ISSUE ID ")
    //                         return
    //                     }
    //                     // let checked = $(".options" + _this.props.sid + " input:radio:checked").val()
    //                     if (_this.props.submittedOptionAnswers[idv] != undefined) {
    //                         _this.props.say("题目已提交,勿重复操作" + `,当前答案:${_this.props.submittedOptionAnswers[idv].answer}`)
    //                         return

    //                     }
    //                     // if (idv != undefined && _this.props.submittedOptionStatus[idv] != undefined && _this.props.submittedOptionStatus[idv] != checked) {
    //                     //     _this.props.say("题目已提交,勿重复操作")
    //                     //     return
    //                     // }
    //                     // idv != undefined && checked != undefined && (_this.props.addOptionStatus(idv, checked.toString()))
    //                     let ans = $(".options" + _this.props.sid + " input:radio:checked").val()
    //                     if (ans == undefined) {
    //                         alert("no answer selected ")
    //                         return
    //                     }
    //                     if (ans == _this.props.answers[idv]) {
    //                         //$(`.optionItem a[id=${idv}]`).next().css("color", "green")
    //                         //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-success")
    //                         let sp = $(`.optionItem.${_this.props.sid} a[id=${idv}]`).next()
    //                         sp.attr("class", "oi oi-check")
    //                         sp.show()
    //                         this.props.setSubmittedOptionAnswer(idv, ans.toString(), true)

    //                     }
    //                     else {
    //                         //$(`.optionItem a[id=${idv}]`).next().css("color", "red")
    //                         //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-danger")
    //                         let sp = $(`.optionItem.${_this.props.sid}  a[id=${idv}]`).next()
    //                         sp.attr("class", "oi oi-x")
    //                         sp.show()
    //                         this.props.setSubmittedOptionAnswer(idv, ans.toString(), false)
    //                     }
    //                 }
    //             )
    //         }
    //     )
    // }

    public render() {
        return (

            <ChoiceCollection getLocal={this.props.getLocal} setLocal={this.props.setLocal} types={this.props.types} contentsCollection={this.props.contentsCollection}
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
    }
    export interface States {
        sid: string
        uAnswers: { [key: string]: any }
        contents: string[]
        pid: string
        title: string
        type: string
        submitStyle: string
    }

}
export class ChoiceCollection extends React.Component<ChoiceCollection.Props, ChoiceCollection.States>{
    uAnswers: { [pid: string]: { answer: string[], uRight: boolean } } = {}
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
            submitStyle: "single"
        }
    }

     componentWillMount() {
        this.uAnswers = {
            ... this.props.getLocal(this.props.sid, {})
        }

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

                this.state.pid == "" || this.state.pid != Object.keys(this.props.contentsCollection).length.toString() ?
                    this.state.submitStyle == "single" ?
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
                        <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>
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
            console.log(index + ".............index")
            _this.setState(() => ({
                ..._this.state,
                sid: _this.props.sid,
                pid: index,
                contents: _this.props.contentsCollection[index],
                titles: _this.props.titlesCollection[index],
                // answers: _this.props.answersCollection[index],
                uAnswers: _this.uAnswers,
                type: _this.props.types[index]
            }))

        })
        $(document).on('click', `.optionInfoSubmit${this.props.sid}`, (e) => {
            console.log("click!!!!!!!!!!!!!")
            let answers: string[] = []
            $("input:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })
            // alert(JSON.stringify(answers))
            let pid = _this.state.pid
            // alert("pid:" + pid)
            let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
            // let rightAnswer = _this.state.answers.split(',')
            // console.log("right :uAns" + JSON.stringify(rightAnswer), JSON.stringify(answers))
            // if (rightAnswer.length != answers.length) {
            //     _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
            //     console.log("与正解数量不符" + JSON.stringify(rightAnswer), JSON.stringify(answers))
            //     sp.prop("class", "oi oi-x")
            //     sp.show()
            //     return
            // }
            // for (let uAns of answers) {
            //     // console.log("right answer :" + rightAnswer.indexOf(uAns))
            //     if (rightAnswer.indexOf(uAns) == -1) {
            //         // alert("wrong answer")
            //         console.log("有错误答案")
            //         _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
            //         sp.prop("class", "oi oi-x")
            //         sp.show()
            //         return
            //     }
            // }
            // _this.uAnswers[_this.state.pid] = { answer: answers, uRight: true }
            // sp.prop("class", "oi oi-check")
            // sp.show()
            _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
            sp.prop("class", "oi oi-pin")
            sp.show()
            // alert("right")


        })

        // $(document).on('click', `.section9`, (e) => {
        $(document).on('click', `.optionInfoSubmit${this.props.sid}.all`, (e) => {
            console.log("click!!!!!!!!!!!!!")
            let answers: string[] = []
            $("input:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })
            // alert(JSON.stringify(answers))
            let pid = _this.state.pid
            // alert("pid:" + pid)
            let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
            // let rightAnswer = _this.state.answers.split(',')
            // console.log("right :uAns" + JSON.stringify(rightAnswer), JSON.stringify(answers))
            // if (rightAnswer.length != answers.length) {
            //     _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
            //     console.log("与正解数量不符" + JSON.stringify(rightAnswer), JSON.stringify(answers))
            //     sp.prop("class", "oi oi-x")
            //     sp.show()
            //     return
            // }
            // for (let uAns of answers) {
            //     // console.log("right answer :" + rightAnswer.indexOf(uAns))
            //     if (rightAnswer.indexOf(uAns) == -1) {
            //         // alert("wrong answer")
            //         console.log("有错误答案")
            //         _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
            //         sp.prop("class", "oi oi-x")
            //         sp.show()
            //         return
            //     }
            // }

            // _this.uAnswers[_this.state.pid] = { answer: answers, uRight: true }
            // sp.prop("class", "oi oi-check")
            // sp.show()
            // alert("right")
            _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
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
                        qzid: _this.props.sid,
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
                    }
                }
            )


        })
        $(document).on('click', `.optionInfoSubmitSingle${this.props.sid}`, async (e) => {
            let answers: string[] = []
            $("input:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })
            let pid = _this.state.pid
            _this.uAnswers[_this.state.pid] = { answer: answers, uRight: false }
            let answersForSubmit = []
            for (let index = 0; index < Object.keys(_this.props.contentsCollection).length; index++) {
                answersForSubmit[index] = "X"
            }
            answersForSubmit[parseInt(pid) - 1] = _this.uAnswers[_this.state.pid].answer.join(",")
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
                        qzid: _this.props.sid,
                        answer: answersForSubmit
                    }),
                    success: async function (data) {
                        let correctItem: string[] = data.data.correct
                        let pid = (parseInt(_this.state.pid)).toString()
                        let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
                        if (correctItem[parseInt(_this.state.pid) - 1] == "1") {
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
                    }
                }
            )
        })
    }
}
