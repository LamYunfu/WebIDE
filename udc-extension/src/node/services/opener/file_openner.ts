import { OneLinkDataService } from './../data_service/onelink_data_service';
import { OneLinkData } from './../../data_center/one_link_data';
import { DataService } from './../data_service/data_service';
import { ProjectData } from './../../data_center/project_data';
import { MultiProjectData } from './../../data_center/multi_project_data';
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable } from "inversify";
import { OS } from "@theia/core";
import * as path from "path"
import * as fs from "fs-extra"
@injectable()
export class FileOpener {
  constructor(
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(DataService) protected dataService: DataService,
    @inject(OneLinkData) protected oneLinkData: OneLinkData,
    @inject(OneLinkDataService) protected oneLinkDataService: OneLinkDataService
  ) { }
  async openFile(pt: string) {
    if (this.projectData.experimentType == "OneLinkView") {
      await this.oneLinkDataService.parseVirtualConfig(this.projectData.pid)
      pt = path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir, this.oneLinkData.projects![0].projectName!.toString(), `${pt}.cpp`)
      console.log("open file from backend:" + pt)
    }

    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: pt,
      });
    else {
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: `/` + pt,
      });
    }
  }
  openWorkspace(pt: string) {
    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openWorkspace",
        passwd: pt,
      });
    else
      this.ldcShell.executeFrontCmd({
        name: "openWorkspace",
        passwd: `/` + pt,
      });
  }
  openCurrentWorkSpace() {
    console.log("---open workspace:-----")
    let pwd = path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir)
    let experimentType = this.projectData.experimentType
    if (!!experimentType && (experimentType!.trim() == "freecoding" || experimentType!.trim() == "ai" || experimentType!.trim() == "LinkEdge" || experimentType!.trim() == "OneLinkView")) {
      this.openWorkspace(pwd)
    } else {
      this.openWorkspace(this.multiProjectData.rootDir)
    }
  }
  openFiles() {
    console.log("---open files:-----")
    let cpath = path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir);
    for (let item of this.projectData.subProjectArray) {
      let dir = path.join(cpath, item)
      let fileArr = fs.readdirSync(
        dir
      );
      console.log("-----dir:" + dir)
      for (let file of fileArr) {
        let tmp = path.join(cpath, item, file)
        console.log("-----file:" + tmp)
        setTimeout(() => {
          this.openFile(tmp)
        }, 3000);

      }
    }
  }

}
