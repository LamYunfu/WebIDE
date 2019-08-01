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
        submittedOptionStatus: { [key: string]: string }
    }
}
export class OptionItem extends React.Component<OptionItem.Props> {
    componentWillMount() {

    }
    componentDidMount() {
        // let _this=this
        // $(document).ready(
        //     () => {
        //         // $(".optionItem").on('click',
        //         $(document).on('click', ".optionItem." + _this.props.sid,
        //             (e) => {
        //                 console.log("option item click.............................")
        //                 $(".codingInfos." + _this.props.sid).hide()
        //                 $(".optionInfos." + _this.props.sid).show()
        //                 let x = $(e.currentTarget).children("a").attr("id")
        //                 if (x != undefined) {
        //                     $(".optionIssueTitle" + _this.props.sid).text(this.props.optionIssues[x])
        //                     $("form.options" + _this.props.sid).attr("id", x)
        //                     for (let index in this.props.choices[x]) {
        //                         let op = $(`.optionContent${_this.props.sid}:eq(${index})`)
        //                         op.text(this.props.choices[x][index])
        //                     }
        //                     if (this.props.submittedOptionStatus[x] == undefined) {
        //                         $("form.options" + _this.props.sid + ".opinput:radio").attr("checked", "false");
        //                     }
        //                     else {
        //                         $(`#optionRadio${_this.props.sid}${_this.props.submittedOptionStatus[x]}`).prop("checked", true)

        //                     }
        //                 }
        //             }
        //         )

        //     })

    }
    public render(): JSX.Element {
        return (
            <li className={`optionItem ${this.props.sid} list-group-item`} >
                <span className="oi oi-pencil" aria-hidden="true"></span>
                <a id={this.props.akey} >选择题{this.props.akey}</a>&nbsp;
                <span className="oi" aria-hidden="true" style={{ display: "none" }}></span>
                {/* <a className="issue_status">●</a><br /> */}
            </li>

        )
    }
}

export namespace OptionInfo {
    export interface Props {
        sid: string
        answers: { [key: string]: string }
        addOptionStatus: (pid: string, selected: string) => void
        submittedOptionStatus: { [key: string]: string }
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
                        let checked = $(".options" + _this.props.sid + " input:radio:checked").val()
                        if (idv != undefined && _this.props.submittedOptionStatus[idv] != undefined && _this.props.submittedOptionStatus[idv] != checked) {
                            _this.props.say("题目已提交,勿重复操作")
                            return
                        }
                        idv != undefined && checked != undefined && (_this.props.addOptionStatus(idv, checked.toString()))
                        // idv != undefined && alert($("input:radio:checked").val() + "right" + _this.props.answers[idv])

                        if (idv != undefined && $(".options" + _this.props.sid + " input:radio:checked").val() == _this.props.answers[idv]) {
                            //$(`.optionItem a[id=${idv}]`).next().css("color", "green")
                            //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-success")
                            let sp = $(`.optionItem.${_this.props.sid} a[id=${idv}]`).next()
                            sp.attr("class", "oi oi-check")
                            sp.show()

                        }
                        else {
                            //$(`.optionItem a[id=${idv}]`).next().css("color", "red")
                            //$(`.optionItem a[id=${idv}]`).parent().attr("class", "optionItem list-group-item list-group-item-danger")
                            let sp = $(`.optionItem.${_this.props.sid}  a[id=${idv}]`).next()
                            sp.attr("class", "oi oi-x")
                            sp.show()
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