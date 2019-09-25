import { FileMapper } from './../util/filemapper';
import { UdcTerminal } from './../util/udc-terminal';
import * as http from 'http'
import * as fs from 'fs-extra';
import * as ach from 'archiver'
import * as crypto from "crypto"
import * as FormData from "form-data"
import { injectable, inject } from 'inversify';
@injectable()
export class NewAliosCompiler {
    constructor(@inject(UdcTerminal) protected readonly udc: UdcTerminal,
        @inject(FileMapper) protected readonly fm: FileMapper) {

    }
    async   postNameAndType(pid: string) {
        let { dirName, deviceRole } = await this.udc.getPidInfos(pid)
        for (let item of deviceRole!) {
            this.udc.outputResult(`compile:${item}`)
            await this.postSingleSrcFile(dirName, item, pid)
        }
    }
    postSingleSrcFile(projectName: string, role: string, pid: string) {
        let _this = this
        let st = fs.createWriteStream(`/home/project/${projectName}/${role}.zip`) //打包
        let achst = ach.create("zip").directory(`/home/project/${projectName}/${role}`, false)
        let hash = crypto.createHash("sha1")
        let hashVal = ""
        let p = new Promise(resolve => {
            st.on("close", () => {
                console.log('compress file scc')
                resolve("scc")
            }
            )
        }).then((res) => {
            if (res == "scc") {
                hash = crypto.createHash("sha1")
                let buff = new Buffer(fs.readFileSync(`/home/project/${projectName}/${role}.zip`))//初始化
                hashVal = hash.update(buff).digest("hex")
                return new Promise((resolve) => {
                    let configRequest = http.request({//
                        method: "POST",
                        hostname: '47.97.253.23',
                        port: '12305',
                        path: "/config",
                        headers: {
                            'Content-Type': "application/json"
                        }
                    }, (mesg) => {
                        let bf = ""
                        mesg.on("data", (b: Buffer) => {
                            bf += b.toString("utf8")
                        })
                        mesg.on("end", () => {
                            let res: any = JSON.parse(bf)
                            if (res.result) {
                                console.log("Alios Post Config SCC!")
                                resolve("scc")
                            }
                            else {
                                console.log("Alios Post Config Failed!")
                            }
                        })
                    })
                    configRequest.write(JSON.stringify({
                        "examplename": "helloworld",
                        "boardname": "esp32devkitc",
                        "filehash": hashVal
                    }))
                    configRequest.end()

                })
            }
        }).then((res) => {
            if (res == "scc") {
                console.log("start upload zip file")
                let fm = new FormData()
                return new Promise((resolve) => {
                    let uploadRequest = http.request({//传zip
                        method: "POST",
                        hostname: '47.97.253.23',
                        port: '12305',
                        path: "/upload",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
                        },
                    }, (mesg) => {
                        let bf = ""
                        mesg.on("data", (b: Buffer) => {
                            bf += b.toString("utf8")
                        })
                        mesg.on("end", () => {
                            console.log(bf)
                            let res: any = JSON.parse(bf)
                            if (res.result) {
                                console.log("Alios Post Upload SCC!")
                                resolve("scc")
                            }
                            else {
                                console.log("Alios Post Upload Failed!")
                            }
                        })
                    })
                    let blob = fs.readFileSync(`/home/project/${projectName}/${role}.zip`)
                    fm.append("file", blob, "install.zip")
                    fm.pipe(uploadRequest)
                })
            }
        }).then(
            (res) => {
                if (res == "scc") {
                    console.log("start downloading")
                    return new Promise((resolve => {
                        let downloadRequest = http.request({//下载
                            method: "POST",
                            hostname: '47.97.253.23',
                            port: '12305',
                            path: "/download",
                            headers: {
                                'Content-Type': "application/json"
                            }
                        }, (mesg) => {
                            let ws = fs.createWriteStream(`/home/project/${projectName}/hexFiles/${new Buffer(`${role}`).toString("hex")}.hex`, {
                                encoding:"binary"
                            })
                            mesg.on("data", (b: Buffer) => {
                                console.log("downloading")
                                ws.write(b)
                            })
                            mesg.on("end", () => {
                                ws.close()
                                let tmp: any = {}
                                tmp[role] = new Buffer(`${role}`).toString("hex") + ".hex"
                                _this.fm.setFileNameMapper(pid, tmp)
                                resolve("scc")
                                console.log("download scc")

                            })
                        })
                        downloadRequest.write(JSON.stringify({
                            filehash: hashVal
                        }))
                        downloadRequest.end()
                    }))
                }
            }

        )
        achst.pipe(st)
        achst.finalize()
        return p
    }
}

