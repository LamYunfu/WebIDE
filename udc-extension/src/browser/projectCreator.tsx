import * as React from "react";
import { Input } from "./component/linkedge";
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
      projectType: undefined
    };
  }
  componentDidMount() {
    if (this.state.ppid) {
      setTimeout(() => {
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
          type: "freecoding"
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
    tinylink_lora: "22"
  };
  buttonState = false;
  matchProjectType(projectType: string): string[] | undefined {
    for (let item of Object.keys(this.tpMapping)) {
      let x = item.match(`.*${projectType}.*`);
      if (x != null) return [x[0], this.tpMapping[x[0]]];
    }
    alert("没有这样的设备类型");
    return undefined;
  }

  createProject = () => {
    // alert("create project");
    if (!this.projectName.match("^.[a-z0-9A-Z]*$" || !this.projectName)) {
      alert("项目名为空，或者存在不为字母、数字、下划线的字符！");
    } else if (
      !this.projectName ||
      !this.projectType.match("^.[a-z_0-9A-Z]*$")
    ) {
      alert("项目类型为空，或者存在不为字母、数字、下划线的字符！");
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
          type: "freecoding"
        }
      };

      this.setState(
        {
          ...this.state,
          ppid: ppid,
          buildTag: true,
          projectName: this.projectName,
          projectType: this.projectType
        },
        async () => {
          this.storageProjectInfo(this.state);
          await this.props.initPidQueueInfo(JSON.stringify(pidInfo));
          window.location.reload()
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
        projectType: undefined
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
          position: "relative"
        }}
      >
        <Input
          label="项目名："
          hint="请输入项目名"
          onChange={(e: any) => {
            this.projectName = e.target.value;
          }}
        ></Input>
        <Input
          label="项目类型："
          hint="请输入项目类型"
          onChange={(e: any) => {
            this.projectType = e.target.value;
          }}
        ></Input>
        <button
          className=" btn btn-primary"
          onClick={() => {
            this.avoidRepeat();
            this.createProject();
          }}
        >
          创建
        </button>
      </div>
    );
  }
  renderShow(): React.ReactNode {
    return (
      <div>
        <Input
          label="项目名："
          hint={this.state.projectName!}
          disabled={true}
        ></Input>
        <Input
          label="项目类型："
          hint={this.state.projectType!}
          disabled={true}
        ></Input>
        <button
          className="btn btn-primary"
          onClick={() => {
            this.avoidRepeat();
            this.resetProject();
          }}
        >
          重置
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
