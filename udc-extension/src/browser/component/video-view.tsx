import React = require("react");
export namespace VideoItem {
    export interface Props {
        sid: string
        title: string
        videoNames: string[]
        uris: string[]
        gotoVideo: (uri: string, videoName: string) => void
    }
}
export class VideoItem extends React.Component<VideoItem.Props>{
    componentDidMount() {
        console.log("video names is :"+JSON.stringify(this .props.videoNames))

    }


    render(): JSX.Element {
        return (
            <li className={`videoItem${this.props.sid} list-group-item`}>
                <span className="oi oi-video" aria-hidden="true"></span>
                <a className={"videoName"} title={this.props.title}>{this.props.videoNames[parseInt(this.props.title)]}</a>
            </li>
        )

    }
}