import { Logger } from '../util/logger';
import { UdcTerminal } from '../util/udc-terminal';
import { UdcCompiler } from './udc-compiler';
import { AliosCompiler } from './alios-compiler';
import { inject, injectable } from 'inversify';
@injectable()
/*
编译
*/
export class Compiler {
    constructor(
        @inject(UdcCompiler) protected readonly udcCompiler: UdcCompiler,
        @inject(AliosCompiler) protected readonly aliosCompiler: AliosCompiler,
        @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal
    ) {
    }
    async compile(pid: string) {
        let { model, fns, dirName } = this.udcTerminal.getPidInfos(pid)
        let fnsArr = JSON.parse(fns)
        Logger.info("start compiling")
        Logger.info("MODEL is:" + model)
        if (this.getCompilerType(model) == "alios") {
            this.udcCompiler.outputResult("use alios compiler")
            Logger.info("use alios compiler")
            await this.aliosCompiler.postNameAndType(pid)
        }
        for (let fn of fnsArr) {
            if (this.getCompilerType(model) == "tinylink") {
                this.udcCompiler.outputResult("use tinylink compiler")
                Logger.info("use tinylink compiler")
                let bv = await this.udcCompiler.postSrcFile(fn, dirName)
                if (bv != 'scc')
                    return "fail"
            }
        }
        return "scc"
    }
    async compileSingleFile(pid: string, fn: string) {
        let { dirName } = this.udcTerminal.getPidInfos(pid)
        let bv = await this.udcCompiler.postSrcFile(fn, dirName)
        if (bv != 'scc')
            return "fail"
        return "scc"
    }
    getCompilerType(model: string): string {
        const AliosType = ["", "", "",]
        const TinylinkType = ["lora_p2p", "", "",]
        if (model.startsWith("alios") || AliosType.indexOf(model) != -1) {
            return "alios"
        }
        if (model.startsWith("tinylink") || TinylinkType.indexOf(model) != -1) {
            return "tinylink"
        }
        Logger.info("get compiler type failed")
        return "No this type"
    }
}