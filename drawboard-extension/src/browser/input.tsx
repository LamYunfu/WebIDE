import React = require("react");

export namespace Input {
    export interface Props {
        onChange?: (e: any) => void
        disabled?: boolean
        label: string,
        hint: string,
        copy?: boolean
    }
}
export class Input extends React.Component<Input.Props> {
    index: number = 0
    str: string = ""
    onChange = (e: any) => {
        this.props.onChange!(e)
        // alert(e.target.value)
        this.str = e.target.value
    }
    render() {
        return <div className="row cols-1">
            <div className="col-3" style={{
                display: "flex", alignItems: 'center',
                justifyItems: "center", fontStyle: "oblique"
                , fontFamily: "fantasy"
            }}>{this.props.label}</div>
            <input type="text" className="form-control  col-8" id="name" disabled={this.props.disabled}
                placeholder={this.props.hint} onChange={this.onChange} />
            {this.props.copy ? <a className="col-1" style={{
                padding: 0, display: "flex", justifyContent: "center", alignItems: 'center', color: 'blue',
                cursor: ' pointer',
                textDecoration: 'underline'
            }} onClick={this.copy}> 复制</a> : ""}
        </div>
    }
    copy = () => {
        let item = document.createElement('textarea')
        item.innerHTML = this.str
        document.body.append(item)
        item.select()
        document.execCommand("copy")
        item.remove()
    }
}
export namespace InstructionActionCollection {
    export interface Props {
        instructionActionMappings:any
    }
    
}
export class InstructionActionCollection extends React.Component<InstructionActionCollection.Props> {
    render() {
        if(this.props.instructionActionMappings==undefined)
        return <div></div>
        let array = Object.keys(this.props.instructionActionMappings).map((str,index)=>{
            return     <InstructionActionMapping instruction={str} action={this.props.instructionActionMappings[str]}></InstructionActionMapping>
        })
        return (
        <div>
            <InstructionActionMapping instruction="**指令**" action="**动作**" ></InstructionActionMapping>
            {/* <InstructionActionMapping instruction="打开灯" action="light on" ></InstructionActionMapping>
            <InstructionActionMapping instruction="亮灯" action="light on" ></InstructionActionMapping>
            <InstructionActionMapping instruction="开灯" action="light on" ></InstructionActionMapping>
            <InstructionActionMapping instruction="关灯" action="light off" ></InstructionActionMapping>
            <InstructionActionMapping instruction="熄灯" action="light off" ></InstructionActionMapping>
            <InstructionActionMapping instruction="关闭灯" action="light off" ></InstructionActionMapping> */}
            {        array}
        </div>

        
        )
    }
}
export namespace InstructionActionMapping {
    export interface props {
        instruction: string,
        action: string
    }
}
export class InstructionActionMapping extends React.Component<InstructionActionMapping.props> {
    render() {
        return (<div className="row" style={{ fontSize: "20px" }}>
            <div className="col-5">{this.props.instruction}</div> <div className="col-2" style={{ color: "blue" }}>-></div><div className="col-5">{this.props.action}</div>
        </div>)
    }
}