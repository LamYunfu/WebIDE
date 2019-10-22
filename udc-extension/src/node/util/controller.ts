import { ConfigSetter } from './configsetter';
import { Extractor } from './extractor';
import { UdcTerminal } from './udc-terminal';
import { injectable, inject, } from 'inversify';
// import * as path from 'path'
// import * as fs from 'fs-extra';
// import { Logger } from './logger'
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
    ) {
    }
    rootDir: string = "/home/project"
    async processIssue(pid: string) {
        console.log("entering pi")
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
                        if (devType == "alios")
                            return "scc";
                        let eres = await _this.et.extract(pid)
                        Logger.info("eres:" + eres)
                        if (eres == 'scc') {
                            _this.ut.outputResult("extract file scc")
                            Logger.info("extract file scc")
                        } else {
                            _this.ut.outputResult("extract file err")
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