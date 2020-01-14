import React = require("react");
// import URI from "@theia/core/lib/common/uri";
import { MyContext } from "./context";

export namespace LinkEdge {
    export interface Props {
        linkEdgeDisconnect: () => void
        linkEdgeConnect: (pid: string, threeTuple: any) => Promise<boolean>
        initPidQueueInfo(infos: string): Promise<string>
        setSize(size: number): void
        remove: (pid: string, index: string) => Promise<boolean>
        develop(pid: string, indexStr: string): Promise<boolean>
        add(pid: string, info: any): Promise<boolean>
        getDevicesInfo(pid: string): Promise<any>
    }
    export interface State {
        connectionStatus: boolean
        ,
        executeStatus: boolean,
        connectionLoading: boolean,
        executeLoading: boolean,
        ra: any[]

    }
}
export class LinkEdgeView extends React.Component<LinkEdge.Props, LinkEdge.State>{
    pid: string = "29"
    threeTuple: any = {}
    constructor(props: LinkEdge.Props) {
        super(props)
        console.log("init")
        this.state = {
            connectionLoading: false,
            executeLoading: false,
            connectionStatus: false,
            executeStatus: true,
            ra: []
        }

    }
    componentDidMount() {
        this.props.setSize(850)
    }
    async  componentWillMount() {
        console.log("mountI")
        let pidQueueInfo: any = {}
        pidQueueInfo["29"] = { dirName: "LinkEdge", ppid: "29", type: "LinkEdge" }
        await this.props.initPidQueueInfo(JSON.stringify(pidQueueInfo))
        let ra = await this.props.getDevicesInfo(this.pid)
        this.setState({ ra: ra })

    }

    toggleConnectionStatus = async () => {
        this.setState({ connectionLoading: true })
        if (this.state.connectionStatus) {
            this.threeTuple["action"] = "stop"
            await this.props.linkEdgeConnect("29", this.threeTuple)
            this.props.linkEdgeDisconnect()
            this.setState({
                connectionStatus: !this.state.connectionStatus
                , executeStatus: true
            })

        }
        else {
            this.threeTuple["action"] = "connect"
            if (await this.props.linkEdgeConnect("29", this.threeTuple)) {
                this.setState({
                    connectionStatus: !this.state.connectionStatus
                })
            }
            else {
                alert("err:" + JSON.stringify(this.threeTuple))
            }
        }

    }
    toggleExecuteStatus = async () => {
        this.threeTuple["action"] = this.state.executeStatus ? "stop" : "start"
        this.setState({ executeLoading: true })
        if (await this.props.linkEdgeConnect("29", this.threeTuple)) {
            this.setState({
                executeStatus: !this.state.executeStatus
            })
        }
        else {
            alert("err:" + JSON.stringify(this.threeTuple))
        }
    }
    changeDeviceName = (e: any) => {
        this.threeTuple["$DeviceName"] = e.target.value
    }
    changeDeviceSecret = (e: any) => {
        this.threeTuple["$DeviceSecret"] = e.target.value
    }
    changeProductKey = (e: any) => {
        this.threeTuple["$ProductKey"] = e.target.value
    }
    add = (deviceInfo: any) => {
        return this.props.add(this.pid, deviceInfo)
    }
    develop = (index: string) => {
        return this.props.develop(this.pid, index)
    }
    getRa = async () => {
        return await this.props.getDevicesInfo(this.pid)
    }
    setRa = (ra: any) => {
        alert(JSON.stringify(ra))
        this.setState({
            ra: ra
        })

    }
    remove = (index: string) => {
        return this.props.remove(this.pid, index)
    }

    render(): JSX.Element {

        return (
            <div>
                <h5 style={{ padding: '3%', height: '10%', textAlign: "center" }}>LinkEdge</h5>
                <div className="col-12" style={{ height: '90%' }}>
                    <div className="col-11 ">
                        <div className="col-12">
                            <Input label="*ProductKey   : " hint="Please Input ProductKey " onChange={this.changeProductKey} disabled={this.state.connectionStatus} copy={true}>  </Input>
                            <Input label="*DeviceName   : " hint="Please Input DeviceName " onChange={this.changeDeviceName} disabled={this.state.connectionStatus} copy={true}></Input>
                            <Input label="*DeviceSecret : " hint="Please Input Please Input DeviceSecret " onChange={this.changeDeviceSecret} disabled={this.state.connectionStatus} copy={true}></Input>
                            <div> <ButtonGroup
                                connectionLoading={this.state.connectionLoading}
                                executeLoading={this.state.executeLoading}
                                toggleConnectionStatus={this.toggleConnectionStatus}
                                toggleExecuteStatus={this.toggleExecuteStatus}
                                connectionStatus={this.state.connectionStatus}
                                executeStatus={this.state.executeStatus}></ButtonGroup></div>
                        </div>
                    </div>

                    <Form remove={this.remove} getRa={this.getRa} setRa={this.setRa} develop={this.develop} add={this.add} ra={this.state.ra}></Form>

                </div>
            </div>
        )


    }
}
namespace Input {
    export interface Props {
        onChange?: (e: any) => void
        disabled?: boolean
        label: string,
        hint: string,
        copy?: boolean
    }
}
class Input extends React.Component<Input.Props> {
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
namespace ButtonGroup {
    export interface Props {
        toggleConnectionStatus: () => void
        toggleExecuteStatus: () => void,
        connectionLoading: boolean,
        executeLoading: boolean,
        connectionStatus: boolean
        ,
        executeStatus: boolean
    }
    export interface Status {

    }
}
class ButtonGroup extends React.Component<ButtonGroup.Props, ButtonGroup.Status> {
    constructor(p: ButtonGroup.Props) {
        super(p)
    }
    render() {
        return <div>
            {this.props.connectionStatus ? <Button onClick={this.props.toggleConnectionStatus} value='释放' loading={this.props.connectionLoading} ></Button> :
                <Button disabled={this.props.connectionStatus} value='连接' onClick={this.props.toggleConnectionStatus} loading={this.props.connectionLoading}></Button>}
            {!this.props.executeStatus && this.props.connectionStatus ?
                <Button disabled={!this.props.connectionStatus} value='启动' onClick={this.props.toggleExecuteStatus} loading={this.props.executeLoading}></Button>
                :
                <Button disabled={!this.props.connectionStatus} value='停止' onClick={this.props.toggleExecuteStatus} loading={this.props.executeLoading}></Button>}

        </div>
    }
}
namespace Button {
    export interface Props {
        onClick?: () => void
        disabled?: boolean
        value: string
        loading?: boolean
    }

}
class Button extends React.Component<Button.Props> {
    render() {
        return this.props.loading ?
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
            :
            this.props.disabled ?
                <button className="btn btn-warning" disabled={true} value={this.props.value} onClick={this.props.onClick}>{this.props.value}</button>
                :
                <button className="btn btn-primary" disabled={false} value={this.props.value} onClick={this.props.onClick}> {this.props.value}</button>
    }
}
namespace Form {
    export interface Props {
        getRa: any
        ra: any[]
        setRa: (ra: any) => void
        add: (deviceInfo: any) => Promise<boolean>
        develop: (index: string) => Promise<boolean>
        remove: (index: string) => Promise<boolean>
    }
    export interface Status {
        ra: any[]
    }
}
class Form extends React.Component<Form.Props, Form.Status> {
    constructor(props: Form.Props) {
        super(props)
        this.remove = this.remove.bind(this)

        // this.state = {
        //     ra: [{
        //         deviceName: "default",
        //         deviceType: "default"
        //     }]
        // }

        this.state = {
            ra: this.props.ra
        }
    }
    add = async (item: any) => {
        let indexArr = this.props.ra
        indexArr.push(item)
        if (!await this.props.add(item)) {
            alert("添加失败")
            return
        }
        this.setState({
            ra: indexArr
        })
    }
    async remove(index: number) {
        let ra = this.state.ra
        ra.splice(index, 1)
        if (!await this.props.remove(index.toString())) {
            alert("删除失败")
            return
        }
        this.setState({
            ra: ra
        })
    }
    release = (index: number) => {

    }
    burning = (index: number) => {

    }
    updateStatus = () => {

    }
    develop = (index: string) => {
        return this.props.develop(index)
    }
    async componentWillMount() {
        let ra = await this.props.getRa()
        await new Promise((res) => {
            this.setState({ ra: ra }, () => {
                res()
            })
        })
        console.log(JSON.stringify(this.state))
    }

    render() {
        return <div >

            <div className="row clos-1" style={{ backgroundColor: "gray" }}>
                <div className="col-1 " style={{ border: "solid", borderWidth: "1px" }}>
                    序号
                </div>
                <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }} >
                    设备名
                </div>
                <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }} >
                    设备类型
                </div>
                <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }} >
                    状态
                </div>
                <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }}  >
                    IP
                </div>
                <div className="col-3" style={{ border: "solid", borderWidth: "1px" }} >
                    操作
                </div>
            </div>
            {this.state.ra.map((value, i) => {
                return < FormData develop={this.develop} data={value} add={this.add} key={i} index={i} remove={this.remove} ></FormData>
            })
            }
            <IndexAdder add={this.add}></IndexAdder>
        </div >
    }

}
namespace FormData {
    export interface Props {
        develop: (index: string) => Promise<boolean>
        data: any
        index: number
        remove: (index: number) => void
        add: (item: any) => void

    }

}
class FormData extends React.Component<FormData.Props> {
    constructor(props: FormData.Props) {
        super(props)
        this.remove = this.remove.bind(this)
    }
    remove() {
        console.log(this.props.index)
        this.props.remove(this.props.index)
    }
    develop = () => {
        this.props.develop(this.props.index.toString())
    }
    render() {
        return <div className="row clos-1">
            <div className="col-1 " style={{ border: "solid", borderWidth: "1px" }}>
                {this.props.index + 1}
            </div>
            <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }} >
                {this.props.data["deviceName"] == undefined ? "default" : this.props.data["deviceName"]}
            </div>
            <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }} >
                {this.props.data["deviceType"] == undefined ? "default" : this.props.data["deviceType"]}
            </div>
            <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }} >
                {this.props.data["status"] == undefined ? "default" : this.props.data["status"]}
            </div>
            <div className="col-2 " style={{ border: "solid", borderWidth: "1px" }}  >
                {this.props.data["ip"] == undefined ? "default" : this.props.data["ip"]}
            </div>
            {/* <input className="col-3"></input> */}
            <div style={{
                border: "solid", borderWidth: "1px"
            }} className="col-3">
                {/* <a >开发</a>|<a>释放</a>|<a onClick={this.remove}>删除</a>|<a>烧写</a> */}
                <a onClick={this.develop} >开发|</a><a>提交|</a><a>关闭日志|</a><a onClick={this.remove}>|删除</a>
            </div>
        </div >

    }
}
namespace IndexAdder {
    export interface Props {
        add: (item: any) => void

    }
    export interface status {
        expand: boolean
    }

}
class IndexAdder extends React.Component<IndexAdder.Props, IndexAdder.status> {
    constructor(props: IndexAdder.Props) {
        super(props)
        this.state = { expand: false }
        this.newIndex = this.newIndex.bind(this)
        this.submitIndex = this.submitIndex.bind(this)
    }
    deviceName: string = ""
    deviceType: string = ""
    setDeviceName = (e: any) => {
        this.deviceName = e.target.value
    }
    setDeviceType = (e: any) => {

        this.deviceType = e.target.value
    }
    newIndex() {

        this.setState({
            expand: !this.state.expand
        })
    }
    submitIndex() {
        this.props.add({
            projectName: this.deviceName,
            deviceName: this.deviceName,
            deviceType: this.deviceType,
        })
        this.reset()
        this.setState({
            expand: !this.state.expand
        })
    }
    reset = () => {
        this.deviceName = ""
        this.deviceType = ""
    }
    render() {
        return <div>
            {!this.state.expand ? <div className="offset-10">< Button disabled={false} value={'添加'} onClick={this.newIndex} ></Button></div>
                :
                <div>
                    <Input label="设备名:" hint="" onChange={this.setDeviceName}></Input>
                    <Input label="设备类型   :" hint="" onChange={this.setDeviceType}></Input>
                    <div className="offset-10">
                        <Button disabled={false} value="确定" onClick={this.submitIndex}></Button>
                    </div>

                </div>
            }
        </div >
    }
}
LinkEdgeView.contextType = MyContext