import { UdcTerminal } from './udc-terminal';
import { FileMapper } from './filemapper';
import { Logger } from './logger';
import { injectable, inject } from 'inversify';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as unzip from "unzip";

@injectable()
export class Extractor {
    constructor(@inject(FileMapper) protected readonly fm: FileMapper,
        @inject(UdcTerminal) protected readonly ut: UdcTerminal) {
    }

    rootDir: string = "/home/project"
    projectDir: string = ""
    hexFileDir: string = ""
    async mkdir(projectName: string, dirName: string) {
        this.hexFileDir = path.join(this.rootDir, projectName, dirName)
        this.projectDir = path.join(this.rootDir, projectName)
        let _this = this
        await fs.exists(_this.hexFileDir, async (res) => {
            if (res == false) {
                await fs.mkdir(_this.hexFileDir)
            }
        })
    }
    get hexFileDirectory() {
        return this.hexFileDir
    }
    getHexName(fn: string) {
        let x = 'B'
        return x + new Buffer(fn).toString("hex")
    }
    async extract(pid: string) {//提取成功返回“scc”
        let _this = this
        let { dirName, fns } = this.ut.getPidInfos(pid)
        this.mkdir(dirName, "hexFiles")
        let fnArr: string[] = JSON.parse(fns)
        let filePath = ""

        for (let item of fnArr) {
            item = item.split('.')[0]
            filePath = path.join(this.projectDir, item + "Install.zip")
            await new Promise((res, reject) => fs.createReadStream(filePath)
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    let fileName: string = entry.path;
                    let suffix = fileName.split(".").pop()
                    let hexName = fileName.split('/').pop()
                    if (suffix == 'hex' || suffix == 'bin') {
                        Logger.info("find hex : " + hexName)
                        let fss = fs.createWriteStream(path.join(_this.hexFileDir, _this.getHexName(item) + 'sketch.ino.hex'))
                        entry.pipe(fss);
                        fss.on("close", () => {
                            fss.close()
                            let tmp: { [rawname: string]: string } = {}
                            //tslint
                            tmp[item] = _this.getHexName(item) + 'sketch.ino.hex'
                            Logger.info(`extract a hex file(raw:${item} transform:${tmp[item]})`)
                            _this.fm.setFileNameMapper(pid, tmp)
                            res("scc")
                        }
                        )
                    } else {
                        entry.autodrain();
                    }
                })
            )

        }
        let etArr = this.fm.getFileNameMapper(pid)
        if (typeof (etArr) == 'string')
            return "failed"
        for (let item of fnArr) {
            item = item.split(".")[0]
            console.log(item)
            if (etArr == undefined)
                return "failed"
        }
        return "scc"
    }
    async extractSingleFile(pid: string, fn: string) {//提取成功返回“scc”
        let _this = this
        let { dirName } = this.ut.getPidInfos(pid)
        this.mkdir(dirName, "hexFiles")
        let filePath = ""
        let item = fn.split('.')[0]
        filePath = path.join(this.projectDir, item + "Install.zip")
        await new Promise((res, reject) => fs.createReadStream(filePath)
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                let fileName: string = entry.path;
                let suffix = fileName.split(".").pop()
                let hexName = fileName.split('/').pop()
                if (suffix == 'hex' || suffix == 'bin') {
                    Logger.info("find hex : " + hexName)
                    let fss = fs.createWriteStream(path.join(_this.hexFileDir, _this.getHexName(item) + 'sketch.ino.hex'))
                    entry.pipe(fss);
                    fss.on("close", () => {
                        fss.close()
                        let tmp: { [rawname: string]: string } = {}
                        //tslint
                        tmp[item] = _this.getHexName(item) + 'sketch.ino.hex'
                        Logger.info(`extract a hex file(raw:${item} transform:${tmp[item]})`)
                        _this.fm.setFileNameMapper(pid, tmp)
                        res("scc")
                    }
                    )
                } else {
                    entry.autodrain();
                }
            })
        )
        let etArr = this.fm.getFileNameMapper(pid)
        if (typeof (etArr) == 'string' || etArr == undefined)
            return "failed"
        return "scc"
    }
    outputResult(arg0: string) {
        throw new Error("Method not implemented.");
    }
}