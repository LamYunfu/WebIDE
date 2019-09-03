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
        let { loginType } = this.ut.getPidInfos(pid)
        let _this = this
        switch (loginType) {
            case "adhoc":
            case "queue":
            case "group":
                return await _this.cm.compile(pid).then(async res => {
                    if (res == "scc") {
                        // _this.ut.config({ name: "Markyuan1996", passwd: "Markyuan1996" })
                        // _this.ut.config(_this.ut.tinyLinkInfo)
                        return _this.et.extract(pid)
                    }
                }).then(
                    async res => {
                        if (res == "scc") {
                            return _this.pm.program(pid)
                        }
                    }
                )
        }

    }
    async processSingleFile(pid: string) {
        Logger.info(pid,"pid:")
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