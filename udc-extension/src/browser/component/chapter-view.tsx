import React = require("react");
import URI from "@theia/core/lib/common/uri";
import { SectionUI } from "./section-view"
import { MyContext } from "./context";


export namespace Chapter {
    export interface Props {
        viewType: string
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
        outputResult: (res: string,types?:string) => void
        setChapterData: (vid: string, data: {}) => void
        setQueue: () => void
        initPidQueueInfo(infos: string): Promise<string>
        closeTables: () => void
        openShell: () => void
        setLocal: (key: string, obj: object) => void
        getLocal: (key: string, obj: object) => object
        programSingleFile: (pidAndFn: string) => void
    }
}
export class Chapter extends React.Component<Chapter.Props>{
    sidArray: string[] = []
    get sectionsDataPool() {
        return this.props.chapterData
    }
    setSectionsDataPool = (sid: string, sectionData: {}) => {
        let tmp: { [key: string]: {} } = this.sectionsDataPool
        tmp[sid] = sectionData
        this.props.setChapterData(this.props.vid, tmp)
    }

    componentDidMount() {
        let _this = this
        _this.context.props.setSize(9999)
        // alert("sidarry:" + _this.sidArray.join(";"))
      
    }
    render(): JSX.Element {
        let uiArray = []
        for (let x of this.props.sections) {
            this.sidArray.push(x.sid)
            this.sectionsDataPool[x.sid] == undefined && this.setSectionsDataPool(x.sid, {})
            uiArray.push(<SectionUI
                viewType={this.props.viewType}
                vid={this.props.vid}
                programSingleFile={this.props.programSingleFile}
                getLocal={this.props.getLocal}
                setLocal={this.props.setLocal}
                seq={uiArray.length + 1}
                key={uiArray.length + 1}
                config={this.props.config}
                openShell={this.props.openShell}
                closeTables={this.props.closeTables}
                initPidQueueInfo={this.props.initPidQueueInfo}
                setQueue={this.props.setQueue}
                setSectionDataPool={this.setSectionsDataPool}
                sectionData={this.sectionsDataPool[x.sid]}
                sid={x.sid}
                // sid={this.props.vid}
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
            <div className="sections col-12">
                {uiArray}
            </div>

        )
    }
}
Chapter.contextType = MyContext