import { ConfigSetter } from "./configsetter";
import { Extractor } from "./extractor";
import { UdcTerminal } from "./udc-terminal";
import { injectable, inject } from "inversify";
import * as path from "path";
import * as fs from "fs-extra";
// import { Logger } from './logger'
import * as events from "events";
import { Compiler } from "../compilers/compiler";
import { Programer } from "./programmer";
import { Logger } from "./logger";
import { getCompilerType } from "../globalconst";
import { LINKLAB_WORKSPACE } from "../../setting/backend-config";
import { FuzzySearch } from "@theia/core/lib/browser/tree/fuzzy-search";
// import { Path } from '@theia/core';

@injectable()
/*
文件操作
*/
export class Controller {
  constructor(
    @inject(UdcTerminal) protected readonly ut: UdcTerminal,
    @inject(Compiler) protected readonly cm: Compiler,
    @inject(Extractor) protected readonly et: Extractor,
    @inject(Programer) protected readonly pm: Programer,
    @inject(ConfigSetter) protected readonly cs: ConfigSetter // @inject(Event) protected readonly evt: Event
  ) {}
  rootDir: string = `${LINKLAB_WORKSPACE}`;
  events = new events.EventEmitter();
  async processFreeCoding(pid: string) {
    Logger.info("start process issue");
    this.ut.refreshConfiguration(pid);
    this.ut.parseFreeConfig(pid);
    for (let i = 4; ; i--) {
      //等待四秒分配设备
      let devInfo = this.ut.get_devlist();
      if (devInfo != undefined && devInfo != null) {
        break;
      }
      if (i == 0) {
        this.ut.outputResult(
          "LDC doesn't give the information of devices.please disconnect and retry."
        );
        return "fail";
      }
      Logger.info("waiting for allocate device");
      await new Promise(res => {
        setTimeout(() => {
          res();
        }, 1000);
      });
    }
    this.processIssue(pid);
  }

  async processIssue(pid: string) {
    let { loginType, model, dirName } = this.ut.getPidInfos(pid);
    let devType = getCompilerType(model);
    try {
      let _this = this;
      Logger.info("compiling");
      switch (loginType) {
        case "adhoc":
        case "queue":
        case "group":
          return await _this.cm
            .compile(pid)
            .then(async res => {
              if (res == "scc") {
                Logger.info("compile scc");
                if (devType == "alios" || devType == "contiki")
                  //alios 不需要解压
                  return "scc";
                let eres = await _this.et.extract(pid); //文件提取结果
                Logger.info("eres:" + eres);
                if (eres == "scc") {
                  // _this.ut.outputResult("extract file scc")
                  Logger.info("extract file scc");
                } else {
                  // _this.ut.outputResult("extract file err")
                  Logger.info("extract file err");
                }
                return eres;
                // return
              } else {
                _this.ut.outputResult("error happend while compiling");
                throw "error happened";
              }
            })
            .then(async res => {
              if (res == "scc") {
                // if (devType == "alios")
                //     return true;
                _this.ut.getIdleDeviceCount(pid); //查询空闲设备
                let res = "";
                res = await new Promise<string>(resolve => {
                  setTimeout(() => {
                    resolve("get idle device count timeout");
                    _this.ut.events.removeAllListeners("goSim");
                    _this.ut.events.removeAllListeners("goDevice");
                  }, 3000);
                  _this.ut.events.once("goSim", () => {
                    // terminal 收包时触发该事件
                    if (getCompilerType(model) == "alios") {
                      //如果是Alios继续执行
                      resolve("fw");
                      return;
                    }
                    _this.ut.udcClient &&
                      _this.ut.udcClient.onConfigLog({
                        name: "executeSelectPanel",
                        passwd: ""
                      }); //进入tinysim选择界面
                    _this.ut.events.removeAllListeners("goSim");
                    _this.ut.events.removeAllListeners("goDevice");
                    resolve("no idle device,what about tiny sim?");
                  });
                  _this.ut.events.once("goDevice", () => {
                    // 继续执行
                    _this.ut.events.removeAllListeners("goSim");
                    _this.ut.events.removeAllListeners("goDevice");
                    resolve("fw");
                  });
                });

                if (res != "fw") {
                  //判断查询后的结果
                  this.ut.outputResult(res);
                  res = await new Promise<string>(resolve => {
                    setTimeout(() => {
                      resolve("get idle device count timeout");
                      _this.events.removeAllListeners("dev_fw");
                      _this.events.removeAllListeners("sim_rt");
                    }, 20000);
                    _this.events.once("simrt", () => {
                      Logger.info("fw", "rt");
                      _this.events.removeAllListeners("dev_fw");
                      _this.events.removeAllListeners("sim_rt");
                      resolve("rt");
                    });
                    _this.events.once("devfw", () => {
                      Logger.info("fw", "fw");
                      _this.events.removeAllListeners("devfw");
                      _this.events.removeAllListeners("sim_rt");
                      resolve("fw");
                    });
                  });
                }

                if (res != "fw") {
                  Logger.info("fail:" + res);
                  this.ut.udcClient &&
                    this.ut.udcClient.onConfigLog({
                      name: "submitEnable",
                      passwd: "true"
                    }); //解除提交连接按钮禁用状态
                  return "fail";
                }
                Logger.info("programming");

                // this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnableWithJudge", passwd: "true" })
                if (this.ut.freeCodingConfig != "") {
                  return await _this.pm.freeCodingProgram(pid);
                }
                let result = await _this.pm.program(pid);
                if (result != true) {
                  Logger.info("program error");
                  // this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnable", passwd: "true" })
                } else {
                  Logger.info("program scc");
                  // this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnableWithJudge", passwd: "true" })
                }
              } else {
                Logger.info("compile error");
                // this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnable", passwd: "true" })
              }
            });
      }
    } catch (e) {
      Logger.err(e);
      this.ut.outputResult(
        "something error happened when backend process the submit"
      );
      this.ut.udcClient &&
        this.ut.udcClient.onConfigLog({ name: "submitEnable", passwd: "true" });
    } finally {
      let dir = path.join(this.rootDir, dirName);
      fs.readdirSync(dir).forEach(name => {
        let suffix = name.split(".").pop();
        if (suffix == "zip") {
          fs.unlinkSync(path.join(dir, name));
        }
      });
    }
  }
  async processSingleFile(pid: string) {
    //pid&filename//10.9 comments
    Logger.info(pid, "pid:");
    let _this = this;
    let tmp = pid.split("&");
    pid = tmp[0];
    let fn = tmp[1];
    return await _this.cm
      .compileSingleFile(pid, fn)
      .then(async res => {
        //pid==pidAndFn
        if (res == "scc") {
          return _this.et.extractSingleFile(pid, fn);
        }
      })
      .then(async res => {
        if (res == "scc") {
          return _this.pm.programSingleFile(pid, fn);
        }
      });
  }
}
