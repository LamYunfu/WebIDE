import { DataService } from './../data_service/data_service';
import { ProjectData } from './../../data_center/project_data';
import { MultiProjectData } from './../../data_center/multi_project_data';
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { inject, injectable } from "inversify";
import { OS } from "@theia/core";
import * as path from "path"
import * as fs from "fs-extra"
import { OneLinkData } from '../../data_center/one_link_data';
@injectable()
export class FileOpener {
  constructor(
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(DataService) protected dataService: DataService,
    @inject(OneLinkData) protected oneLinkData: OneLinkData
  ) { }
 
  openFile(pt: string) {
    //组装路径
    let  rootPath:string  = "";
    rootPath = path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir, this.oneLinkData.projects![0].projectName!.toString())
    //根据文件路径读取文件，返回文件列表
    pt = this.getFilePath(rootPath, pt);
    console.log(pt);
    console.log("open file from backend:" + pt)
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

  getFilePath(rootPath:string, pt: string):string{
    let _this = this;
    fs.readdir(rootPath,function(err,files){
      if(err){
          console.warn(err)
      }else{
          //遍历读取到的文件列表
          files.forEach(function(filename){
              //获取当前文件的绝对路径
              var filedir = path.join(rootPath,filename);
              //根据文件路径获取文件信息，返回一个fs.Stats对象
              fs.stat(filedir,function(eror,stats){
                  if(eror){
                      console.warn('获取文件stats失败');
                  }else{
                      var isFile = stats.isFile();//是文件
                      var isDir = stats.isDirectory();//是文件夹
                      if(isFile){
                          if(filename.includes(pt)){
                            return filedir;
                          }
                      }
                      if(isDir){
                         _this.getFilePath(filedir, pt);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                      }
                  }
              })
          });
      }
  });
  return "";
  }

}

