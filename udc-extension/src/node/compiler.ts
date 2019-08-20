import { UdcTerminal } from './udc-terminal';
import { UdcCompiler } from './compilers/udc-compiler';
import { AliosCompiler } from './compilers/alios-compiler';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
@injectable()
/*
编译烧写
*/
export class Compiler {
    constructor(@inject(UdcCompiler) protected readonly udcCompiler: UdcCompiler,
        @inject(AliosCompiler) protected readonly aliosCompiler: AliosCompiler,
        @inject(new LazyServiceIdentifer(() => UdcTerminal)) protected readonly udcTerminal: UdcTerminal
    ) {
    }
    compile(pid: string) {
        // let { loginType, timeout, model, waitID, fns, dirName } = this.udcTerminal.getPidInfos(pid)
        let { fns, dirName, model } = this.udcTerminal.getPidInfos(pid)
        if (model.startsWith("alios")) {
            this.aliosCompiler.postNameAndType(pid)
        }
        if (model.startsWith("tinylink")) {
            this.udcCompiler.postSrcFile(fns!, true, 0, dirName)
        }
    }
}