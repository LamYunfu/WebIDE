//file is deprecated
import { injectable, inject } from "inversify";
import { UdcTerminal } from "./udc-terminal";
import * as fs from "fs";
import * as path from "path";
import {
  TINY_MOBILE_IP,
  TINY_MOBILE_PORT,
  RootDirPath,
} from "../../setting/backend-config";
import * as http from "http";
import * as FormData from "form-data";
import { Logger } from "./logger";
import { OS } from "@theia/core";
import { CallInfoStorer } from "./callinfostorer";
import { CallSymbol } from "../../setting/callsymbol";
@injectable()
export class OnelinkService {
  ready: boolean;
  mobileFile: string = "";
  tokenPath: string = "";
  projectInfo: {
    projectName: string;
    token: string;
  } = { projectName: "", token: "" };
  constructor(
    @inject(UdcTerminal) protected readonly ut: UdcTerminal,
    @inject(RootDirPath) public rootDir: RootDirPath,
    @inject(CallInfoStorer) readonly cis: CallInfoStorer
  ) {
    this.ready = false;
  }
  prepare(pid: string): void {
    let currenDir = path.join(
      this.rootDir.val,
      this.ut.pidQueueInfo[pid].dirName
    );
    let mobileDir = path.join(currenDir, "mobile");
    let mobileFile = path.join(mobileDir, "mobile.cpp");
    let tokenPath = path.join(mobileDir, "token");
    !fs.existsSync(currenDir) ? fs.mkdirSync(currenDir) : "";
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
        this.ut.outputResult("Token file is corrupted!\nPlease check it or restore it to default!","err");
        Logger.info("Token file is corrupted!\nPlease check it or restore it to default!","err");
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
    this.prepare(pid);
    let projectInfo = this.getProjectInfo(this.tokenPath, projectName);
    if (projectInfo == null) {
      return false;
    } else {
      this.projectInfo = projectInfo;
      this.ready = projectInfo.token == "" ? false : true;
    }
    if (this.isReady()) {
      this.ut.outputResult("Project established!");
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
      this.ut.outputResult("Project has not been created yet!\nPlease create a project first!","err");
      return false;
    }
  }
  async createMobileApp(
    mobileFile: string,
    projectName: string
  ): Promise<boolean> {
    Logger.info("createMobileApp");
    let _this = this;
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
            _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
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
            _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
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
        this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.CTPJ, 1);
        resolve(false);
      });
      fm.pipe(uploadRequest).end();
    });
    if (res == false) {
      this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
      return false;
    } else {
      if (this.processBackValue(backValue)) {
        this.projectInfo.token = backValue["data"]["token"];
        fs.writeFileSync(this.tokenPath, JSON.stringify(this.projectInfo));
        this.ut.outputResult("Project established!");
        return true;
      } else {
        return false;
      }
    }
  }
  processBackValue(backValue: any) {
    if (backValue["code"] == "11000") {
      this.ut.outputResult("Application name duplicated!\nPlease try another application name.","err");
      return false;
    } else if (backValue["code"] == "11001") {
      this.ut.outputResult("Compiling mobile app failed!\n","Please check your mobile app source code.");
      this.ut.outputResult(backValue["message"]);
    } else if (backValue["code"] == "11002") {
      this.ut.outputResult("The tocken is not consistent with the application name!\nPlease check the application name!","err");
    } else if (backValue["code"] == "200") {
      this.ut.outputResult("Compiling mobile application successful!");
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
    let _this = this;
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
              _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
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
              _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
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
          this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
          resolve(false);
        });
        fm.pipe(uploadRequest).end();
      });
      if (res) {
        if (this.processBackValue(backValue)) {
          this.projectInfo.token = backValue["data"]["token"];
          fs.writeFileSync(tokenPath, JSON.stringify(this.projectInfo));
          this.ut.udcClient!.onConfigLog({
            name: "redirect",
            passwd: `http://` + backValue["data"]["url"],
          });
          return true;
        } else {
          return false;
        }
      } else {
        this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
        return false;
      }
    } else {
      this.ut.outputResult("Project has not been created yet!\nPlease create a project first!","err");
      return false;
    }
  }
  async openMobile() {
    if (OS.type() == OS.Type.Linux)
      this.ut.udcClient!.onConfigLog({
        name: "openSrcFile",
        passwd: this.mobileFile,
      });
    else {
      this.ut.udcClient!.onConfigLog({
        name: "openSrcFile",
        passwd: `/` + this.mobileFile,
      });
    }
  }
  async openDevice() {}
}
