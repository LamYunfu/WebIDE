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
    @inject(ProjectData) protected projectData: ProjectData
  ) { }
  openFile(path: string) {
    console.log("open file from backend:" + path)
    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: path,
      });
    else {
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: `/` + path,
      });
    }
  }
  openWorkspace(path: string) {
    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openWorkspace",
        passwd: path,
      });
    else
      this.ldcShell.executeFrontCmd({
        name: "openWorkspace",
        passwd: `/` + path,
      });
  }
  openCurrentWorkSpace() {
    console.log("---open workspace:-----")
    let pwd = path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir)
    if (!!this.projectData.experimentType && (this.projectData.experimentType!.trim() == "freecoding" || this.projectData.experimentType!.trim() == "ai")) {
      this.openWorkspace(pwd)
    } else {
      this.openWorkspace(this.multiProjectData.rootDir)
    }
  }
  openFiles() {
    console.log("---open files:-----")
    let cpath = path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir);
    for (let item of this.projectData.subProjectArray) {
      let fileArr = fs.readdirSync(
        path.join(cpath, item)
      );
      for (let file of fileArr) {
        let tmp=path.join(cpath, item, file)
        console.log("-----file:" + tmp)
        setTimeout(() => {
          this.openFile(tmp)
        }, 3000);

      }
    }
  }

}
