
import { ProjectData } from '../../data_center/project_data';
import { injectable, inject, interfaces } from "inversify";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as FormData from "form-data";
import { OS } from "@theia/core";
import { CallInfoStorer } from "../log/call_info_storer";
import { MultiProjectData } from "../../data_center/multi_project_data";
import { CallSymbol } from '../../../setting/callsymbol';
import { TINY_MOBILE_IP, TINY_MOBILE_PORT } from '../../../setting/backend-config';
import { Logger } from '../tools/logger';
import { LdcShellInterface } from '../ldc_shell/interfaces/ldc_shell_interface';
export function bindOneLinkService(bind: interfaces.Bind) {
  bind(OneLinkService).toSelf().inSingletonScope()
}
@injectable()
export class OneLinkService {
  ready: boolean;
  mobileFile: string = "";
  tokenPath: string = "";
  projectInfo: {
    projectName: string;
    token: string;
  } = { projectName: "", token: "" };
  constructor(
    @inject(CallInfoStorer) readonly cis: CallInfoStorer,
    @inject(MultiProjectData) readonly multiProject: MultiProjectData,
    @inject(ProjectData) readonly projectData: ProjectData,
    @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface
  ) {
    this.ready = false;
  }
  prepare(): void {
    let currentDir = path.join(
      this.multiProject.rootDir,
      this.projectData.projectRootDir
    );
    let mobileDir = path.join(currentDir, "mobile");
    let mobileFile = path.join(mobileDir, "mobile.cpp");
    let tokenPath = path.join(mobileDir, "token");
    !fs.existsSync(currentDir) ? fs.mkdirSync(currentDir) : "";
    !fs.existsSync(mobileDir) ? fs.mkdirSync(mobileDir) : "";
    !fs.existsSync(mobileFile) ? fs.writeFileSync(mobileFile, "") : "";
    this.mobileFile = mobileFile;
    this.tokenPath = tokenPath;
  }
  isReady() {
    return this.ready;
  }
  getProjectInfo(
    tokenPath: string,
    projectName: string
  ): { token: string; projectName: string } | null {
    let config = "";
    if (fs.existsSync(tokenPath)) {
      config = fs.readFileSync(tokenPath).toString();
      try {
        let res = JSON.parse(config);
        if (res.token != "" && res.projectName != "") {
          return res;
        } else {
          throw "error";
        }
      } catch (error) {
        this.outputResult("Token file is corrupted!\nPlease check it or restore it to default!", "err");
        Logger.info("Token file is corrupted!\nPlease check it or restore it to default!", "err");
        return null;
      }
    } else {
      return {
        projectName: projectName,
        token: "",
      };
    }
  }
  async createProject(projectName: string, pid: string): Promise<boolean> {
    this.prepare();
    let projectInfo = this.getProjectInfo(this.tokenPath, projectName);
    if (projectInfo == null) {
      return false;
    } else {
      this.projectInfo = projectInfo;
      this.ready = projectInfo.token == "" ? false : true;
    }
    if (this.isReady()) {
      this.outputResult("Project established!");
      return true;
    } else {
      this.ready = await this.createMobileApp(
        this.mobileFile,
        this.projectInfo.projectName
      );
      return this.ready;
    }
  }
  async compileDevice() {
    if (this.ready) {
      return true;
    } else {
      this.outputResult("Project has not been created yet!\nPlease create a project first!", "err");
      return false;
    }
  }
  async createMobileApp(
    mobileFile: string,
    projectName: string
  ): Promise<boolean> {
    let data = fs.readFileSync(mobileFile).toString();
    let fm = new FormData();
    console.log("data:" + data + ":" + projectName);
    fm.append("file", data, projectName);
    fm.append(`appName`, projectName);
    let backValue: any = {};
    let res = await new Promise<boolean>(async (resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 30000);
      this.cis.storeCallInfoInstantly("start", CallSymbol.CTPJ);
      let uploadRequest = http.request(
        {
          //传zip
          method: "POST",
          hostname: TINY_MOBILE_IP,
          port: TINY_MOBILE_PORT,
          path: "/api/mobile/custom",
          headers: fm.getHeaders(),
        },
        (mesg) => {
          if (mesg == undefined) {
            this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
            Logger.info("error happened when custom mobile");
            resolve(false);
            return;
          }
          let bf = "";
          Logger.info("upload statuscode:" + mesg.statusCode);
          mesg.on("data", (b: Buffer) => {
            Logger.info("data comming");
            bf += b.toString("utf8");
          });
          mesg.on("error", () => {
            Logger.info("error happened when custom mobile");
            this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
            resolve(false);
          });
          mesg.on("end", () => {
            Logger.info("custom back value:" + bf);
            let res: any = JSON.parse(bf);
            backValue = res;
            this.cis.storeCallInfoInstantly("end", CallSymbol.CTPJ);
            resolve(true);
          });
        }
      );
      uploadRequest.on("error", () => {
        this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.CTPJ, 1);
        resolve(false);
      });
      fm.pipe(uploadRequest).end();
    });
    if (res == false) {
      this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
      return false;
    } else {
      if (this.processBackValue(backValue)) {
        this.projectInfo.token = backValue["data"]["token"];
        fs.writeFileSync(this.tokenPath, JSON.stringify(this.projectInfo));
        this.outputResult("Project established!");
        return true;
      } else {
        return false;
      }
    }
  }
  processBackValue(backValue: any) {
    if (backValue["code"] == "11000") {
      this.outputResult("Application name duplicated!\nPlease try another application name.", "err");
      return false;
    } else if (backValue["code"] == "11001") {
      this.outputResult("Compiling mobile app failed!\n", "Please check your mobile app source code.");
      this.outputResult(backValue["message"]);
    } else if (backValue["code"] == "11002") {
      this.outputResult("The tocken is not consistent with the application name!\nPlease check the application name!", "err");
    } else if (backValue["code"] == "200") {
      this.outputResult("Compiling mobile application successful!");
      return true;
    }
    return false;
  }
  async complileMobile() {
    Logger.info("compile Mobile");
    return this.update(
      this.projectInfo.token,
      this.projectInfo.projectName,
      this.mobileFile,
      this.tokenPath
    );
  }
  async update(
    token: string,
    projectName: string,
    mobileFile: string,
    tokenPath: string
  ) {
    Logger.info("update Mobile:" + token + ":" + projectName);
    if (this.isReady()) {
      let data = fs.readFileSync(mobileFile);
      let fm = new FormData();
      fm.append("file", data, projectName);
      fm.append(`appName`, projectName);
      fm.append("token", token);
      let backValue: any = {};
      let res = await new Promise<boolean>(async (resolve) => {
        setTimeout(() => {
          resolve(false);
        }, 30000);
        this.cis.storeCallInfoInstantly("start", CallSymbol.UPTP);
        let uploadRequest = http.request(
          {
            //传zip
            method: "POST",
            hostname: TINY_MOBILE_IP,
            port: TINY_MOBILE_PORT,
            path: "/api/mobile/updateConfig",
            headers: fm.getHeaders(),
          },
          (mesg) => {
            if (mesg == undefined) {
              this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
              Logger.info("error happened when updateConfig mobile");
              resolve(false);
              return;
            }
            let bf = "";
            Logger.info("upload statuscode:" + mesg.statusCode);
            mesg.on("data", (b: Buffer) => {
              Logger.info("data comming");
              bf += b.toString("utf8");
            });
            mesg.on("error", () => {
              Logger.info("error happened when updateConfig mobile");
              this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
              resolve(false);
            });
            mesg.on("end", () => {
              Logger.info("updateConfig back value:" + bf);
              let res: any = JSON.parse(bf);
              backValue = res;
              this.cis.storeCallInfoInstantly("end", CallSymbol.UPTP);
              resolve(true);
            });
          }
        );
        uploadRequest.on("error", () => {
          this.cis.storeCallInfoInstantly("broken", CallSymbol.CTPJ, 1);
          this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
          resolve(false);
        });
        fm.pipe(uploadRequest).end();
      });
      if (res) {
        if (this.processBackValue(backValue)) {
          this.projectInfo.token = backValue["data"]["token"];
          fs.writeFileSync(tokenPath, JSON.stringify(this.projectInfo));
          this.ldcShell.executeFrontCmd({
            name: "redirect",
            passwd: `http://` + backValue["data"]["url"],
          });
          return true;
        } else {
          return false;
        }
      } else {
        this.outputResult("Network error!\nYou can check your network connection and retry.", "err");
        return false;
      }
    } else {
      this.outputResult("Project has not been created yet!\nPlease create a project first!", "err");
      return false;
    }
  }
  async openMobile() {
    if (OS.type() == OS.Type.Linux)
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: this.mobileFile,
      });
    else {
      this.ldcShell.executeFrontCmd({
        name: "openSrcFile",
        passwd: `/` + this.mobileFile,
      });
    }
  }
  async openDevice() { }
  outputResult(res: string, type: string = "systemInfo") {
    this.ldcShell.outputResult(res, type);
  }
}
