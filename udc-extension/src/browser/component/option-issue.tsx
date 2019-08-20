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
    }
    export interface States {
        status: string
    }

}


export class OptionInfo extends React.Component<OptionInfo.Props, OptionInfo.States>{
    componentDidMount() {
        let _this = this
        $(document).ready(
            () => {
                $(".optionInfoSubmit" + _this.props.sid).click(
                    (e) => {
                        e.preventDefault()
                        let idv = $(".options" + _this.props.sid).attr("id")
                        if (idv == undefined) {
                            alert("ERR:NO ISSUE ID ")
                            return
                        }
                        // let checked = $(".options" + _this.props.sid + " input:radio:checked").val()
                        if (_this.props.submittedOptionAnswers[idv] != undefined) {
                            _this.props.say("题目已提交,勿重复操作" + `,当前答案:${_this.props.submittedOptionAnswers[idv].answer}`)
                            return

                        }
                        // if (idv != undefined && _this.props.submittedOptionStatus[idv] != undefined && _this.props.submittedOptionStatus[idv] != checked) {
                        //     _this.props.say("题目已提交,勿重复操作")
                        //     return
                        // }
                        // idv != undefined && checked != undefined && (_this.props.addOptionStatus(idv, checked.toString()))
                        let ans = $(".options" + _this.props.sid + " input:radio:checked").val()
                        if (ans == undefined) {
                            alert("no answer selected ")
                            return
                        }
                        if (ans == _this.props.answers[idv]) {
                            //$(`.optionItem a[id=${idv}]`).next().css("color", "green")
                            //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-success")
                            let sp = $(`.optionItem.${_this.props.sid} a[id=${idv}]`).next()
                            sp.attr("class", "oi oi-check")
                            sp.show()
                            this.props.setSubmittedOptionAnswer(idv, ans.toString(), true)

                        }
                        else {
                            //$(`.optionItem a[id=${idv}]`).next().css("color", "red")
                            //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-danger")
                            let sp = $(`.optionItem.${_this.props.sid}  a[id=${idv}]`).next()
                            sp.attr("class", "oi oi-x")
                            sp.show()
                            this.props.setSubmittedOptionAnswer(idv, ans.toString(), false)
                        }
                    }
                )
            }
        )
    }


    // public render() {
    //     return (
    //         <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>
    //             <div className="card-body">
    //                 <p className={"optionIssueTitle" + this.props.sid}>
    //                     请选出以下正确的答案()
    //                 </p>
    //                 <form className={`options${this.props.sid}`} id="1" >
    //                     <div className="custom-control custom-radio">
    //                         <input className="custom-control-input" id={`optionRadio${this.props.sid}1`} type="radio" name="1" value="1" />
    //                         <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}1`} >
    //                             A. <span className={`optionContent${this.props.sid}`}></span><br />
    //                         </label>
    //                     </div>
    //                     <div className="custom-control custom-radio">
    //                         <input className="custom-control-input" id={`optionRadio${this.props.sid}2`} type="radio" name="1" value="2" />
    //                         <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}2`} >
    //                             B. <span className={`optionContent${this.props.sid}`}></span><br />
    //                         </label>
    //                     </div>
    //                     <div className="custom-control custom-radio">
    //                         <input className="custom-control-input" id={`optionRadio${this.props.sid}3`} type="radio" name="1" value="3" />
    //                         <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}3`} >
    //                             C. <span className={`optionContent${this.props.sid}`}></span><br />
    //                         </label>
    //                     </div>
    //                     <div className="custom-control custom-radio">
    //                         <input className="custom-control-input" id={`optionRadio${this.props.sid}4`} type="radio" name="1" value="4" />
    //                         <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}4`} >
    //                             D. <span className={`optionContent${this.props.sid}`}></span><br />
    //                         </label>
    //                     </div>
    //                     {/* <input type="radio" name="1" value="2" />B:<span className="optionContent"></span><br />
    //                     <input type="radio" name="1" value="3" />C:<span className="optionContent"></span><br />
    //                     <input type="radio" name="1" value="4" />D:<span className="optionContent"></span><br /> */}
    //                     <hr />
    //                     <button className={`optionInfoSubmit${this.props.sid} btn btn-primary`} type="button">提交</button>
    //                 </form>
    //             </div>
    //         </div >
    //     )
    // }
    public render() {
        return (
            <div>
                <ChoiceCollection contentsCollection={this.props.contentsCollection} answersCollection={this.props.answersCollection}
                    titlesCollection={this.props.titlesCollection} sid={this.props.sid} ></ChoiceCollection>
            </div>
        )
    }
}
export namespace Choice {
    export interface Props {
        sid: string
        content: string
        choiceNum: string
    }
}
export class Choice extends React.Component<Choice.Props>{
    render(): JSX.Element {
        return (
            <div className="custom-control custom-checkbox">
                <input className="custom-control-input" id={`optionCheck${this.props.sid}${this.props.choiceNum}`} type="checkbox" name="1" value={this.props.choiceNum} />
                <label className="custom-control-label" htmlFor={`optionCheck${this.props.sid}${this.props.choiceNum}`}>
                    <span className={`optionContent${this.props.sid}`}>{this.props.content}</span><br />
                </label>
            </div>
        )
    }
}
export namespace ChoiceCollection {
    export interface Props {
        contentsCollection: { [key: string]: string[] }
        answersCollection: { [key: string]: string }
        titlesCollection: { [key: string]: string }
        sid: string
    }
    export interface States {
        sid: string
        answers: string
        contents: string[]
        pid: string
        title: string
    }

}
export class ChoiceCollection extends React.Component<ChoiceCollection.Props, ChoiceCollection.States>{
    constructor(props: Readonly<ChoiceCollection.Props>) {
        super(props)
        this.state = {
            ... this.state,
            sid: "",
            answers: "",
            contents: [],
            pid: "",
            title: "",
        }


    }
    render(): JSX.Element {
        let carr = []
        // if (this.state.contents == []) {
        //     return (<div>loading</div>)
        // }
        for (let index in this.state.contents) {
            console.log(index)
            carr.push(<Choice sid={this.state.sid} content={this.state.contents[index]} choiceNum={(parseInt(index) + 1).toString()}></ Choice>)
        }
        return (
            this.state.contents == [] || this.state.contents == undefined ? <div>loading</div> :
                <div>
                    <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>
                        <div className="card-body">
                            <p className={"optionIssueTitle" + this.props.sid}>
                                {this.state.title}
                            </p>
                            <form className={`options${this.state.sid}`} id="1" ></form>
                            {carr}
                        </div>
                        <button className={`optionInfoSubmit${this.state.sid} btn btn-primary`} type="button">提交</button>
                    </div>
                </div >
        )
    }
    componentDidMount() {
        let _this = this
        $(document).on('click', ".optionItem." + _this.props.sid, (e) => {
            $("input").map((index, html) => {
                $(html).prop("checked", false)
            })
            let index = $(e.currentTarget).children(".index").text()
            console.log(index + ".............index")
            _this.setState(() => ({
                ..._this.state,
                sid: _this.props.sid,
                pid: index,
                contents: _this.props.contentsCollection[index],
                titles: _this.props.titlesCollection[index],
                answers: _this.props.answersCollection[index],
            }))

        })
        $(document).on('click', `.optionInfoSubmit${this.props.sid}`, (e) => {
            console.log("click!!!!!!!!!!!!!")
            let answers: string[] = []
            $("input:checkbox:checked").map((index, html) => {
                answers.push($(html).prop("value"))
            })
            // alert(JSON.stringify(answers))
            let pid = _this.state.pid
            // alert("pid:" + pid)
            let sp = $(`.optionItem.${_this.props.sid} a[id=${pid}]`).next()
            let rightAnswer = _this.state.answers.split(',')
            if (rightAnswer.length != answers.length) {
                // alert("wrong answer")
                sp.prop("class", "oi oi-x")
                sp.show()
                return
            }
            for (let uAns of answers)
                if (rightAnswer.indexOf(uAns) == undefined) {
                    // alert("wrong answer")
                    sp.prop("class", "oi oi-x")
                    sp.show()
                    return
                }
            sp.prop("class", "oi oi-check")
            sp.show()
            // alert("right")


        })
    }
}
