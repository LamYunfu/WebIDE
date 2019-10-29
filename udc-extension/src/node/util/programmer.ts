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
        let address = model == "developer_kit" ? '0x08000000' : '0x10000'
        let devArr = []
        let fnArr = JSON.parse(fns)
        if (getCompilerType(model) == "alios")
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
        // this.ut.outputResult("sending file to LDC......")
        switch (loginType) {
            case "queue": {
                for (let item of deviceRole!) {
                    let hexFile = hex[item.split(".")[0]]
                    console.log("path:" + [rootDir, dirName, hexFileDir, hexFile].join(";"))
                    return await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), address, devArr[0], pid)
                    // break
                }
                break
            }
            case "adhoc": {
                for (let item of deviceRole!) {
                    console.log("fnArr:" + fnArr.join(";"))
                    let hexFile = hex[item.split(".")[0]]
                    console.log(item + ":hexFile:" + JSON.stringify(hex))
                    console.log("path:" + [rootDir, dirName, hexFileDir, hexFile].join(";"))
                    return await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), address, devArr[0], pid)
                }
                break
            }
            case "group": {
                let fnArr: string[] = []
                if (deviceRole == undefined)
                    return false
                else fnArr = deviceRole
                // let devIndex: any = -1
                let devStr=""
                let lastStr = ""
                for (let index in fnArr) {

                    for (let seq in devArr) {
                        if (devArr[seq].split("lora").length > 1 && devArr[seq].split(",")[1].split("|")[0] != lastStr) {
                            // devIndex = seq
                            lastStr = devArr[seq].split(",")[1].split("|")[0]
                            this.ut.outputResult(lastStr)
                            devStr=devArr[seq]
                            break;
                        }

                    }
                    let hexFile = hex[fnArr[index].split(".")[0]]
                    console.log("path:" + [rootDir, dirName, hexFileDir, hexFile].join(";"))
                    // let bv = await this.ut.program_device_group(path.join(rootDir, dirName, hexFileDir, hexFile), address, devArr[index], pid)
                    let bv = await this.ut.program_device_group(path.join(rootDir, dirName, hexFileDir, hexFile), address,devStr, pid)
                    if (bv == false) {
                        return false
                    }
                }
                break
            }
        }
        return true
    }
    async programSingleFile(pid: string, fn: string) {
        let { dirName, model } = this.ut.getPidInfos(pid)

        let address = model == "developer_kit" ? '0x08000000' : '0x10000'
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
        // let bv = await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), address, devArr[index], pid)
        let bv = await this.ut.program_device(path.join(rootDir, dirName, hexFileDir, hexFile), address, devArr[0], pid)
        if (bv == false) {
            return false
        }

    }


}