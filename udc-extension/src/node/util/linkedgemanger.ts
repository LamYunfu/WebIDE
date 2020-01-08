import { UdcTerminal } from './udc-terminal';
import { injectable, inject, } from 'inversify';
// import * as path from 'path'
// import * as fs from 'fs-extra';
// import { Logger } from './logger'
import { Programer } from './programmer';
import * as path from 'path'
import * as fs from 'fs';
import { Logger } from './logger';
@injectable()
export class LinkEdgeManager {
    constructor(@inject(UdcTerminal) protected readonly ut: UdcTerminal,
        @inject(Programer) protected readonly pm: Programer,
    ) {

    }
    async programGateWay(pid: string, threeTuple: any) {
        let { dirName } = this.ut.pidQueueInfo[pid]
        this.ut.parseLinkEdgeConfig(pid, threeTuple)
        let filehash = await this.pm.fileUpload(path.join(this.ut.rootDir, dirName, "hexFiles", "command.hex"))
        if (filehash == 'err')
            return "err"
        let burnOption = this.ut.LinkEdgeConfig['burningGateway']
        burnOption = {
            ...burnOption
            , pid: pid,
            "groupId": (Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) + Math.pow(10, 15)).toString(),
        }
        burnOption['program'][0] = {
            ...burnOption['program'][0],
            "filehash": filehash,
            "waitingId": (Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1))
                + Math.pow(10, 15)).toString()
        }
        this.ut.connect("", "", pid, "30")
        for (let i = 4; ; i--) {//等待四秒分配设备
            let devInfo = this.ut.get_devlist()
            if (devInfo != undefined && devInfo != null) {
                break
            }
            if (i == 0) {
                this.ut.outputResult("LDC doesn't allocate device to you.please disconnect and retry.")
                return "fail"
            }
            Logger.info("waiting for allocate device")
            await new Promise(res => {
                setTimeout(() => {
                    res()
                }, 1000)
            })
        }
        return await this.ut.program_device(pid, JSON.stringify(burnOption))
    }
    async processLinkEdgeConnect(pid: string, threeTuple: any) {
        this.programGateWay(pid, threeTuple)
    }
    async addProjectToLinkEdge(pid: string, deviceInfo: any) {
        this.ut.parseLinkEdgeConfig(pid)
        let index = parseInt(deviceInfo.index)
        this.ut.LinkEdgeConfig['projects'][index] == undefined ?
        this.ut.LinkEdgeConfig['projects'].push(
                {
                    "projectName": deviceInfo.deviceName,
                    "deviceName": deviceInfo.deviceName,
                    "deviceType": deviceInfo.deviceType
                }
            )
            : this.ut.LinkEdgeConfig['projects'][index] = {
                "projectName": deviceInfo.deviceName,
                "deviceName": deviceInfo.deviceName,
                "deviceType": deviceInfo.deviceType
            }
        this.ut.flushLinkEdgeConfig(pid)
    }
    async removeProjectInLinkEdge(pid: string, indexStr: string) {
        let index = parseInt(indexStr)
        let { dirName } = this.ut.pidQueueInfo[pid]
        let project = this.ut.LinkEdgeConfig['projects'][index]
        let subDirName = project.projectName
        let subDirPath = path.join(this.ut.rootDir, dirName, subDirName)
        this.ut.LinkEdgeConfig['projects'].splice(index, 1)


        fs.readdirSync(subDirPath).forEach((value) => {
            fs.unlinkSync(path.join(subDirPath, value))
        }

        )
        fs.rmdirSync(subDirPath)
        this.ut.flushLinkEdgeConfig(pid)

        return true
    }
    async developLinkEdgeProject(pid: string, indexStr: string) {
        let index = parseInt(indexStr)
        let project = this.ut.LinkEdgeConfig['projects'][index]
        let { deviceType, projectName } = project
        if (deviceType == undefined || projectName == undefined) {
            this.ut.outputResult("invaild deviceType or device name ")
            return;
        }
        this.ut.requestFixedTemplate(pid, deviceType, projectName);
        return true;
    }

}
