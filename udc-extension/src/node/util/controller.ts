import { ConfigSetter } from './configsetter';
import { Extractor } from './extractor';
import { UdcTerminal } from './udc-terminal';
import { injectable, inject, } from 'inversify';
// import * as path from 'path'
// import * as fs from 'fs-extra';
// import { Logger } from './logger'
import *  as events from 'events'
import { Compiler } from '../compilers/compiler';
import { Programer } from './programmer';
import { Logger } from './logger';
import { getCompilerType } from '../globalconst';
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
        @inject(ConfigSetter) protected readonly cs: ConfigSetter,
        // @inject(Event) protected readonly evt: Event
    ) {
    }
    rootDir: string = "/home/project"
    events = new events.EventEmitter()
    async processFreeCoding(pid: string) {
        Logger.info("start process issue")
        this.ut.refreshConfiguration(pid);
        for (let i = 4; ; i--) {
            let devInfo = this.ut.get_devlist()
            if (devInfo != undefined && devInfo != null) {
                break
            }
            if (i == 0) {
                return "fail"
            }
            Logger.info("waiting for allocate device")
            await new Promise(res => {
                setTimeout(() => {
                    res()
                }, 1000)
            })
        }
        this.processIssue(pid);
    }
    async processIssue(pid: string) {
        let { loginType,
            model
        } = this.ut.getPidInfos(pid)
        let devType = getCompilerType(model)
        let _this = this
        Logger.info("compiling")
        switch (loginType) {
            case "adhoc":
            case "queue":
            case "group":
                return await _this.cm.compile(pid).then(async res => {
                    if (res == "scc") {
                        Logger.info("compile scc")
                        // _this.ut.config({ name: "Markyuan1996", passwd: "Markyuan1996" })
                        // _this.ut.config(_this.ut.tinyLinkInfo)
                        if (devType == "alios" || devType == "contiki")
                            return "scc";
                        let eres = await _this.et.extract(pid)
                        Logger.info("eres:" + eres)
                        if (eres == 'scc') {
                            // _this.ut.outputResult("extract file scc")
                            Logger.info("extract file scc")
                        } else {
                            // _this.ut.outputResult("extract file err")
                            Logger.info("extract file err")
                        }
                        return eres
                        // return
                    }
                    else
                        return "err"
                }).then(
                    async res => {
                        if (res == "scc") {
                            // if (devType == "alios")
                            //     return true;
                            _this.ut.getIdleDeviceCount(pid)
                            let res = ""
                            res = await new Promise<string>((resolve) => {
                                setTimeout(() => {
                                    resolve("get idle device count timeout")
                                    _this.ut.events.removeAllListeners("goSim")
                                    _this.ut.events.removeAllListeners("goDevice")
                                }, 3000)
                                _this.ut.events.once("goSim", () => {
                                    if (getCompilerType(model) == 'alios') {
                                        resolve("fw")
                                        return
                                    }
                                    _this.ut.udcClient && _this.ut.udcClient.onConfigLog({ name: 'executeSelectPanel', passwd: "" })
                                    _this.ut.events.removeAllListeners("goSim")
                                    _this.ut.events.removeAllListeners("goDevice")
                                    resolve("no idle device,what about tiny sim?")

                                })
                                _this.ut.events.once("goDevice", () => {
                                    _this.ut.events.removeAllListeners("goSim")
                                    _this.ut.events.removeAllListeners("goDevice")
                                    resolve("fw")
                                })
                            })

                            if (res != "fw") {
                                this.ut.outputResult(res)
                                res = await new Promise<string>((resolve) => {
                                    setTimeout(() => {
                                        resolve("get idle device count timeout")
                                        _this.events.removeAllListeners("dev_fw")
                                        _this.events.removeAllListeners("sim_rt")
                                    }, 20000)
                                    _this.events.once("simrt", () => {
                                        Logger.info("fw", "rt")
                                        _this.events.removeAllListeners("dev_fw")
                                        _this.events.removeAllListeners("sim_rt")
                                        resolve("rt")

                                    })
                                    _this.events.once("devfw", () => {
                                        Logger.info("fw", "fw")
                                        _this.events.removeAllListeners("devfw")
                                        _this.events.removeAllListeners("sim_rt")
                                        resolve("fw")
                                    })
                                })

                            }

                            if (res != "fw") {
                                Logger.info("fail:" + res)
                                return "fail"
                            }
                            Logger.info("programming")
                            let result = await _this.pm.program(pid)
                            if (result != true) {
                                Logger.info("program error")
                                this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnable", passwd: "true" })
                            } else {
                                Logger.info("program scc")
                                this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnableWithJudge", passwd: "true" })
                            }
                        }
                        else {
                            Logger.info("compile error")
                            this.ut.udcClient && this.ut.udcClient.onConfigLog({ name: "submitEnable", passwd: "true" })
                        }
                    }
                )
        }

    }
    async processSingleFile(pid: string) {//pid&filename//10.9 comments
        Logger.info(pid, "pid:")
        let _this = this
        let tmp = pid.split("&")
        pid = tmp[0]
        let fn = tmp[1]
        return await _this.cm.compileSingleFile(pid, fn).then(async res => {//pid==pidAndFn
            if (res == "scc") {
                return _this.et.extractSingleFile(pid, fn)
            }
        }).then(
            async res => {
                if (res == "scc") {
                    return _this.pm.programSingleFile(pid, fn)
                }
            }
        )
    }
}