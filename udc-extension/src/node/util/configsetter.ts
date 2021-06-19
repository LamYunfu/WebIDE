//file is deprecated
import { UdcTerminal } from './udc-terminal';
import { injectable, inject } from "inversify";
import * as EventEmitor from 'events'


@injectable()
export class ConfigSetter {
    constructor(@inject(UdcTerminal) protected readonly ut: UdcTerminal
    ) {
        this.em = new EventEmitor()
    }
    em: EventEmitor
    async on() {
        return new Promise((res) => this.em.on("setok", () => {
            res("scc")
        }))

    }
    fireOk() {
        this.em.emit("setok")
    }


}