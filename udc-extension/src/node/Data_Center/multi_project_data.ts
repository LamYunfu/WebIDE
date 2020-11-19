import { ROOTPATH } from '../../setting/backend-config';
import { ProjectData } from "./project_data";
import { injectable } from "inversify";
@injectable()
export class MultiProjectData {
  projectID: string | null = null;
  //rootDir: string = `D:\\all`;
  rootDir: string =ROOTPATH
  projectType: string = "experiment";
  dataMap: { [pid: string]: ProjectData } = {}; //所有项目的信息
}
