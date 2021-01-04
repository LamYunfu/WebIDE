import * as React from "react";
import { Input, Selection } from "./component/linkedge";
export namespace ProjectCreator {
  export interface pro {
    initPidQueueInfo(infos: string): Promise<string>;
    setPPid(pid: string | undefined): void;
    showDefault: () => void;
    delProject: (ppid: string) => Promise<boolean>;
  }
  export interface st {
    buildTag: boolean;
    projectName: string | undefined;
    projectType: string | undefined;
    ppid: string | undefined;
  }
}
type ProjectInfo = {
  ppid: string | undefined;
  buildTag: boolean;
  projectName: string | undefined;
  projectType: string | undefined;
};

//{"19":{"dirName":"TinyLink自由
// 实验","ppid":"19","type":"freecoding"}}
export class ProjectCreator extends React.Component<
  ProjectCreator.pro,
  ProjectCreator.st
> {
  constructor(p: any) {
    super(p);
    this.state = {
      buildTag: false,
      ppid: undefined,
      projectName: undefined,
      projectType: undefined,
    };
  }
  componentDidMount() {
    if (this.state.ppid) {
      setTimeout(async () => {
        this.props.showDefault();
      }, 2000);
    }
  }
  async componentWillMount() {
    let infoRaw = this.getProjectInfo();
    if (infoRaw == null) {
      return;
    }
    try {
      let info: ProjectInfo = JSON.parse(infoRaw);
      if (!info.projectName || !info.projectType) {
        return;
      }
      if (info.ppid) {
        this.props.setPPid(info.ppid);
        this.setState({ ...info });
        let x: any = {};
        x[info.ppid] = {
          dirName: info.projectName,
          ppid: info.ppid,
          type: "freecoding",
        };
        await this.props.initPidQueueInfo(JSON.stringify(x));
      }
    } catch (error) {
      return;
    }
  }
  projectName: string = "";
  projectType: string = "";
  tpMapping: { [key: string]: string } = {
    raspeberry_pi: "33",
    tinylink_platform_1: "19",
    alios_esp32: "20",
    contiki_telosb: "21",
    tinylink_lora: "22",
  };
  buttonState = false;
  matchProjectType(projectType: string): string[] | undefined {
    for (let item of Object.keys(this.tpMapping)) {
      let x = item.match(`.*${projectType}.*`);
      if (x != null) return [x[0], this.tpMapping[x[0]]];
    }
    alert("there is no this type");
    return undefined;
  }

  createProject = () => {
    // alert("create project");
    if (!this.projectName||this.projectName.match("^.[a-z0-9A-Z]*$" )) {
      alert(
        "The project name is empty, or there are characters that are not letters, numbers, or underscores!"
      );
    } else if (
      !this.projectName ||
      !this.projectType.match("^.[a-z_0-9A-Z]*$")
    ) {
      alert(
        "The project type is empty, or there are characters that are not letters, numbers, or underscores!"
      );
    } else {
      let ppid = "";
      let mr = this.matchProjectType(this.projectType);
      if (mr == undefined) {
        return;
      } else {
        ppid = mr[1];
        this.projectType = mr[0];
      }

      let pidInfo = {
        ppid: {
          dirName: this.projectName,
          ppid: ppid,
          type: "freecoding",
        },
      };

      this.setState(
        {
          ...this.state,
          ppid: ppid,
          buildTag: true,
          projectName: this.projectName,
          projectType: this.projectType,
        },
        async () => {
          this.storageProjectInfo(this.state);
          await this.props.initPidQueueInfo(JSON.stringify(pidInfo));
          window.location.reload();
          // this.props.showDefault();
        }
      );
    }
  };
  resetProject = async () => {
    // alert("resetProject");
    this.props.setPPid(undefined);
    if (this.state.ppid) await this.props.delProject(this.state.ppid);
    this.setState(
      {
        ppid: undefined,
        buildTag: false,
        projectName: undefined,
        projectType: "",
      },
      () => {
        this.storageProjectInfo(this.state);
      }
    );
  };
  avoidRepeat() {
    if (this.buttonState) {
      return;
    }
    this.buttonState = !this.buttonState;
    setTimeout(() => {
      this.buttonState = !this.buttonState;
    });
  }
  renderInput(): React.ReactNode {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <Input
          label="project name:"
          hint="please input project name"
          onChange={(e: any) => {
            this.projectName = e.target.value;
          }}
        ></Input>
        {/* tpMapping: { [key: string]: string } = {
    raspeberry_pi: "33",
    tinylink_platform_1: "19",
    alios_esp32: "20",
    contiki_telosb: "21",
    tinylink_lora: "22"
  }; */}

        {/* <Input
          label="project type:"
          hint="please input project type"
          onChange={(e: any) => {
            this.projectType = e.target.value;
          }}
        ></Input> */}
        <Selection
          label="project type:"
          hint={this.state.projectType!}
          onChange={(e: any) => {
            this.projectType = e.target.value;
          }}
        ></Selection>
        <button
          className=" btn btn-primary"
          onClick={() => {
            this.avoidRepeat();
            this.createProject();
          }}
        >
          create
        </button>
      </div>
    );
  }
  renderShow(): React.ReactNode {
    return (
      <div>
        <Input
          label="project name:"
          hint={this.state.projectName!}
          disabled={true}
        ></Input>
        {/* <Input
          label="project type:"
          hint={this.state.projectType!}
          disabled={true}
        ></Input> */}
        <Selection
          label="project type:"
          hint={this.state.projectType!}
          disabled={true}
          onChange={(e: any) => {
            this.projectType = e.target.value;
          }}
        ></Selection>
        <button
          className="btn btn-primary"
          onClick={() => {
            this.avoidRepeat();
            this.resetProject();
          }}
        >
          reset
        </button>
      </div>
    );
  }
  render(): React.ReactNode {
    return (
      <div>
        {this.state.buildTag == false ? this.renderInput() : this.renderShow()}
      </div>
    );
  }
  storageProjectInfo(info: ProjectInfo) {
    window.localStorage.setItem("freecodingProjectInfo", JSON.stringify(info));
  }
  getProjectInfo(): string | null {
    return window.localStorage.getItem("freecodingProjectInfo");
  }
}
