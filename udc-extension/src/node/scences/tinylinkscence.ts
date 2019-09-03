import { Compiler } from '../compilers/compiler';
import { UdcTerminal } from '../util/udc-terminal';
import { inject, injectable } from 'inversify';
import { TinyLinkSettingEditor } from './settingeditor';
@injectable()
export class TinyLinkScence {
    constructor(
        @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal,
        @inject(Compiler) protected readonly compiler: Compiler,
        @inject(TinyLinkSettingEditor) protected readonly tse: TinyLinkSettingEditor,
    ) {

    }
    compile(): boolean {
        return false
    }
    editTinyLinkSettings(): boolean {
        return false
    }
    program(): boolean {
        return false
    }
}