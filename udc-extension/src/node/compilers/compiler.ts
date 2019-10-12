import { NewAliosCompiler } from './new-alios-compiler';
import { Logger } from '../util/logger';
import { UdcTerminal } from '../util/udc-terminal';
import { UdcCompiler } from './udc-compiler';
// import { AliosCompiler } from './alios-compiler';
import { inject, injectable } from 'inversify';
import { getCompilerType } from '../globalconst';

@injectable()
/*
编译
*/
export class Compiler {
    constructor(
        @inject(UdcCompiler) protected readonly udcCompiler: UdcCompiler,
        // @inject(AliosCompiler) protected readonly aliosCompiler: AliosCompiler,
        @inject(NewAliosCompiler) protected readonly newAliosCompiler: NewAliosCompiler,
        @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal
    ) {
    }
    async compile(pid: string) {
        let { model } = this.udcTerminal.getPidInfos(pid)
        Logger.info("start compiling")
        Logger.info("MODEL is:" + model)
        this.udcTerminal.outputResult("compiling......")
        if (getCompilerType(model) == "alios") {
            // this.udcCompiler.outputResult("use alios compiler")
            Logger.info("use alios compiler")
            // await this.aliosCompiler.postNameAndType(pid)
            await this.newAliosCompiler.postNameAndType(pid)
        }
        if (getCompilerType(model) == "tinylink") {
            // this.udcCompiler.outputResult("use tinylink compiler")
            Logger.info("use tinylink compiler")
            let bv = await this.udcCompiler.postSrcFile(pid)
            if (bv != 'scc')
                return "fail"
        }
        return "scc"
    }
    async compileSingleFile(pid: string, fn: string) {
        let bv = await this.udcCompiler.postSrcFile(pid)
        if (bv != 'scc')
            return "fail"
        return "scc"
    }
}