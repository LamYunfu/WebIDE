import React = require("react");
import URI from "@theia/core/lib/common/uri";
import { SectionUI } from "./sectionui-view"

export namespace Chapter {
    export interface Props {
        sections: [{ [key: string]: string }]
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
}
export class Chapter extends React.Component<Chapter.Props>{
    componentDidMount() {

    }
    render(): JSX.Element {
        let uiArray = []
        for (let x of this.props.sections) {
            uiArray.push(<SectionUI
                section={x}
                outputResult={this.props.outputResult}
                say={this.props.say}
                gotoVideo={this.props.gotoVideo}
                setCookie={this.props.setCookie}
                disconnect={this.props.disconnect}
                connect={this.props.connect}
                callUpdate={this.props.callUpdate}
                createSrcFile={this.props.createSrcFile}
                openSrcFile={this.props.openSrcFile}
                postSrcFile={this.props.postSrcFile} />)
        }

        return (
            <div>
                {uiArray}
            </div>

        )
    }
}