import React = require("react");
import URI from "@theia/core/lib/common/uri";
import { SectionUI } from "./section-view"


export namespace Chapter {
    export interface Props {
        vid: string
        chapterData: { [key: string]: {} }
        sections: [{ [key: string]: string }]
        connect: (loginType: string, model: string, pid: string, timeout: string) => void
        disconnect: () => void
        callUpdate: () => void
        openSrcFile: (uri: URI) => void
        postSrcFile: (fn: string) => void
        config: () => void
        gotoVideo: (uri: string, videoName: string) => void
        say: (verbose: string) => void
        outputResult: (res: string) => void
        setChapterData: (vid: string, data: {}) => void
        setQueue: () => void
        initPidQueueInfo(infos: string): Promise<string>
        closeTables: () => void
        openShell: () => void
    }
}
export class Chapter extends React.Component<Chapter.Props>{
    get sectionsDataPool() {
        return this.props.chapterData
    }
    setSectionsDataPool = (sid: string, sectionData: {}) => {
        let tmp: { [key: string]: {} } = this.sectionsDataPool
        tmp[sid] = sectionData
        this.props.setChapterData(this.props.vid, tmp)
    }
    render(): JSX.Element {
        let uiArray = []
        for (let x of this.props.sections) {
            this.sectionsDataPool[x.sid] == undefined && this.setSectionsDataPool(x.sid, {})
            uiArray.push(<SectionUI
                config={this.props.config}
                openShell={this.props.openShell}
                closeTables={this.props.closeTables}
                initPidQueueInfo={this.props.initPidQueueInfo}
                setQueue={this.props.setQueue}
                setSectionDataPool={this.setSectionsDataPool}
                sectionData={this.sectionsDataPool[x.sid]}
                sid={x.sid}
                section={x}
                outputResult={this.props.outputResult}
                say={this.props.say}
                gotoVideo={this.props.gotoVideo}
                disconnect={this.props.disconnect}
                connect={this.props.connect}
                callUpdate={this.props.callUpdate}

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