/* eslint-disable jsx-a11y/anchor-is-valid */
import React = require("react");
export interface State {
    showAll: boolean
}

interface Props {
    ps: string[]
    openWorkspace: (name: string) => void
}
export class RecentWorkspace extends React.Component<Props, State> {
    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = { showAll: false };
    }
    async componentDidMount() {
    }

    unfold = () => {
        this.setState({
            ...this.state,
            showAll: true
        })
    }
    fold = () => {
        this.setState({
            ...this.state,
            showAll: false
        })
       document.getElementById("go_link")!.click()
    }

    renderAll(): React.ReactFragment {
        let a = []
        let ps = this.props.ps
        for (let i = 0; i < ps.length; i++) {
            a.push(<div className="workspace-item" onClick={this.openWorkspace}>{ps[i]}</div>)
        }
        return <div>
            {a}
            <div className=" fold-tool fold" onClick={this.fold} >折叠</div>
        </div>

    }
    openWorkspace = (e: any) => {
        e.preventDefault()
        this.props.openWorkspace(e.target.innerText)
    }
    foldAll(): React.ReactFragment {
        let a = []
        let ps = this.props.ps
        for (let i = 0; i < 6&&i<ps.length; i++) {
            a.push(<div className="workspace-item" onClick={this.openWorkspace} >{ps[i]}</div>)
        }
        return <div>
            {a}
            <div id=" fold-tool unfold" onClick={this.unfold} >展开</div>
        
        </div>

    }
    render() {
        return (
            <div> <a href="#workspace-anchor"  id ="go_link"/>
                { this.state.showAll ? this.renderAll() : this.foldAll()} 
            </div>
           
        );

    }

}
export default RecentWorkspace