import { Logger } from './logger';
import { Extractor } from './extractor';
import { FileMapper } from './filemapper';
import { UdcTerminal } from './udc-terminal';
import { injectable, inject } from 'inversify';
import { rootDir, hexFileDir, getCompilerType } from "../globalconst"
import * as path from 'path';
@injectable()
export class Programer {
    constructor(@inject(UdcTerminal) protected readonly ut: UdcTerminal,
        @inject(FileMapper) protected readonly fm: FileMapper,
        @inject(Extractor) protected readonly et: Extractor) {

    }
    async program(pid: string) {
        let { loginType, fns, dirName, model, deviceRole } = this.ut.getPidInfos(pid)
        let devArr = []
        let fnArr = JSON.parse(fns)
        if (getCompilerType(model)=="alios")
            fnArr = deviceRole
        let devInfo: { [devid: string]: number } | undefined
        for (let i = 4; ; i--) {
            devInfo = this.ut.get_devlist()
            if (devInfo != undefined) {
                break
            }
            if (i == 0) {
                return "fail"
            }
            Logger.info("waitting for allocate device")
            await new Promise(res => {
                setTimeout(() => {
                    res()
                }, 1000)
            })

        }
        for (let item in this.ut.get_devlist()) {
            devArr.push(item)
        }
        let hex = this.fm.getFileNameMapper(pid)
        if (typeof (hex) == "string") {
            Logger.info("error file name map")
            return "fail"
        }
        this.ut.outputResult("sending file to LDC......")
        switch (loginType) {
            case "queue": {
                for (let item of fnArr) {
                  
                    let hexFile = hex[item.split(".")[0]]
                    return this.ut.program_device_queue(path.join(rootDir, dirName, hexFileDir, hexFile), "0x10000", devArr[0], pid)
                    // break
                }
                break
            }
            case "adhoc": {
                for (let item of fnArr) {
                    console.log("fnArr:"+fnArr.join(";"))
                    let hexFile = hex[item.split(".")[0]]
                    console.log(item + ":hexFile:" + JSON.stringify(hex))
                    console.log("path:" + [rootDir, dirName, hexFileDir, hexFile].join(";"))
                    return this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), "0x10000", devArr[0], pid)
                }
                break
            }
            case "group": {
                for (let index in devArr) {
                    let hexFile = hex[fnArr[index].split(".")[0]]

                    let bv = await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), "0x10000", devArr[index], pid)
                    if (bv == false) {
                        return false
                    }
                }
                break
            }
        }
    }
    async programSingleFile(pid: string, fn: string) {
        let { dirName } = this.ut.getPidInfos(pid)
        // let { fns, dirName } = this.ut.getPidInfos(pid)
        let devArr = []
        // let fnArr: string[] = JSON.parse(fns)
        let devInfo: { [devid: string]: number } | undefined
        for (let i = 4; ; i--) {
            devInfo = this.ut.get_devlist()
            if (devInfo != undefined) {
                break
            }
            if (i == 0) {
                return "fail"
            }
            Logger.info("waitting for allocate device")
            await new Promise(res => {
                setTimeout(() => {
                    res()
                }, 1000)
            })

        }
        for (let item in this.ut.get_devlist()) {
            devArr.push(item)
        }
        let hex = this.fm.getFileNameMapper(pid)
        if (typeof (hex) == "string") {
            Logger.info("error file name map")
            return "fail"
        }
        let hexFile = hex[fn.split(".")[0]]
        // let index = fnArr.findIndex((val) => {
        //     if (val.match(`${fn}|${fn}.cpp`))
        //         return true
        // })
        // let bv = await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), "0x10000", devArr[index], pid)
        let bv = await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), "0x10000", devArr[0], pid)
        if (bv == false) {
            return false
        }

    }


}