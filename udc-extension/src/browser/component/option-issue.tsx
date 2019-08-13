import React = require("react");
import * as $ from "jquery"
export namespace OptionItem {
    export interface Props {
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
        sid: string
        answers: { [key: string]: string }
        submittedOptionAnswers: { [pid: string]: { answer: string, isRight: boolean } }
        setSubmittedOptionAnswer: (pid: string, answer: string, isRight: boolean) => void
        say: (thing: string) => void
    }
}


export class OptionInfo extends React.Component<OptionInfo.Props>{
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


    public render() {
        return (
            <div className={`optionInfos ${this.props.sid} card text-white bg-secondary`}>
                <div className="card-body">
                    <p className={"optionIssueTitle" + this.props.sid}>
                        请选出以下正确的答案()
                    </p>
                    <form className={`options${this.props.sid}`} id="1" >
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id={`optionRadio${this.props.sid}1`} type="radio" name="1" value="1" />
                            <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}1`} >
                                A. <span className={`optionContent${this.props.sid}`}></span><br />
                            </label>
                        </div>
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id={`optionRadio${this.props.sid}2`} type="radio" name="1" value="2" />
                            <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}2`} >
                                B. <span className={`optionContent${this.props.sid}`}></span><br />
                            </label>
                        </div>
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id={`optionRadio${this.props.sid}3`} type="radio" name="1" value="3" />
                            <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}3`} >
                                C. <span className={`optionContent${this.props.sid}`}></span><br />
                            </label>
                        </div>
                        <div className="custom-control custom-radio">
                            <input className="custom-control-input" id={`optionRadio${this.props.sid}4`} type="radio" name="1" value="4" />
                            <label className="custom-control-label" htmlFor={`optionRadio${this.props.sid}4`} >
                                D. <span className={`optionContent${this.props.sid}`}></span><br />
                            </label>
                        </div>
                        {/* <input type="radio" name="1" value="2" />B:<span className="optionContent"></span><br />
                        <input type="radio" name="1" value="3" />C:<span className="optionContent"></span><br />
                        <input type="radio" name="1" value="4" />D:<span className="optionContent"></span><br /> */}
                        <hr />
                        <button className={`optionInfoSubmit${this.props.sid} btn btn-primary`} type="button">提交</button>
                    </form>
                </div>
            </div >
        )
    }
}