import { injectable, LazyServiceIdentifer, inject } from 'inversify';
import * as path from 'path'
import * as unzip from "unzip"
import * as FormData from "form-data"
import * as fs from 'fs-extra';
import { UdcTerminal } from '../util/udc-terminal'
import * as http from 'http'
import { Logger } from '../util/logger'
import { LINKLAB_WORKSPACE } from '../../setting/backend-config';

@injectable()
export class AliosCompiler {
    constructor(@inject(new LazyServiceIdentifer(() => UdcTerminal)) protected readonly udc: UdcTerminal) {

    }
    DEBUG: boolean = false
    rootDir: string = `${LINKLAB_WORKSPACE}`
    cookie: string = ""
    AliosAPIs: { [key: string]: string } = {
        hostname: "47.97.253.23",
        port: "8081",
        srcPostPath: "/uploadMultipleFiles",//post file data return download uri
        projectNameAndBoardPath: "/ProjectName",
        beginCompilePath: "/BeginCompile",
        downloadHexPath: "",
    }
    setDownloadHexPathName(projectName: string, boardType: string) {
        this.AliosAPIs.downloadHexPath = `/downloadFile/${projectName}@${boardType}.zip`
    }


    getHexNmame(fn: string) {
        return "B" + new Buffer(fn).toString("hex")
    }
    //fn{fn:1}


    devs: string[] = []
    extractHex(index: number, useQueue: boolean, dirName: string, pid: string): Promise<string | undefined> {
        this.outputResult(`dev index:${index}`)
        if (index == 0) {
            for (let k in this.udc.get_devlist()) {
                this.devs.push(k)
            }
        }
        if (this.devs[index] == undefined) {
            this.outputResult("no dev remaining " + JSON.stringify(this.devs))
            return (new Promise((res, err) => {
                err("no dev remaining")
            }))
        }
        let rootDir = this.rootDir
        let _this = this
        fs.createReadStream(path.join(rootDir, dirName, 'Install.zip'))
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                let x: string[] = entry.path.split(".")
                if (x.pop() == "bin") {
                    Logger.info("find", 'find')
                    // let fss = fs.createWriteStream(path.join(rootDir, dirName, 'helloworld@esp32devkitc.bin'))
                    let fss = fs.createWriteStream(path.join(rootDir, dirName, 'sketch.ino.hex'))
                    entry.pipe(fss);
                    fss.on("close", () => {
                        Logger.info("programming")
                        if (useQueue) {
                            _this.outputResult(`program with queue`)
                            _this.udc.program_device_queue(path.join(rootDir, dirName, 'sketch.ino.hex'), "0x10000", _this.devs[index], pid).then(
                                (res) => {
                                    if (res) {
                                        _this.outputResult("program scc")
                                        return new Promise((resolve) => {
                                            resolve('scc')
                                            Logger.info("process sucess")
                                        })
                                    }
                                    else {
                                        _this.outputResult("program failed")
                                        return new Promise((resolve) => {
                                            resolve("scc")
                                            Logger.info("process faild")
                                        })
                                    }
                                }
                            )
                        }
                        else {
                            _this.outputResult(`program without queue`)
                            // _this.udc.program_device(path.join(rootDir, dirName, 'sketch.ino.hex'), "0x10000", _this.devs[index], pid).then(
                            //     (res) => {
                            //         if (res) {
                            //             _this.outputResult("program scc")
                            //             return new Promise((resolve) => {
                            //                 resolve('scc')
                            //                 Logger.info("process sucess")
                            //             })
                            //         }
                            //         else {
                            //             _this.outputResult("program failed")
                            //             return new Promise((resolve) => {
                            //                 resolve("faild")
                            //                 Logger.info("process faild")
                            //             })
                            //         }
                            //     }
                            // )

                        }

                    })
                }
                else {
                    entry.autodrain();
                }
            })
        return new Promise((resolve) => {
            resolve("scc")
            Logger.info("ok")
        })

    }
    async postNameAndType(pid: string) {
        let { projectName, boardType, dirName, deviceRole } = await this.udc.getPidInfos(pid)
        for (let item of deviceRole!) {
            this.outputResult(`compile:${item}`)
            let fm = new FormData()
            fm.append("Pname", projectName)
            fm.append("Board", boardType)
            this.setDownloadHexPathName(projectName!, boardType!)
            await this.submitForm(fm,
                this.AliosAPIs["hostname"],
                this.AliosAPIs["port"],
                this.AliosAPIs["projectNameAndBoardPath"],
                "POST").then(res => {
                    return Logger.info(`postNameAndType back:${res}`)
                }).then(async () => {
                    // let x = ["helloworld"]
                    await this.postRoleSrcFile(dirName, item)
                })
                .then(() => {
                    Logger.info('alios program finish')
                })
        }
    }
    async postRoleSrcFile(dirName: string, srcFileDirName: string) {
        let absPath = path.join(this.rootDir, dirName, srcFileDirName)
        let farr = fs.readdirSync(absPath)
        let fileList: string[] = []
        farr.forEach(function (item) {
            let suffix = item.split(".").pop()
            if (fs.statSync(path.join(absPath, item)).isFile() && suffix != "hex" && suffix != "zip") {
                fileList.push(item);
            }
        });
        let fm = new FormData()
        for (let ct of fileList) {
            let tmpPath = path.join(absPath, ct)
            let tmps = fs.readFileSync(tmpPath)
            fm.append("files", tmps, ct)
        }
        let _this = this
        return new Promise<string>((resolve) => {
            _this.submitForm(fm,
                _this.AliosAPIs["hostname"],
                _this.AliosAPIs["port"],
                _this.AliosAPIs["srcPostPath"],
                "POST")
                .then(res => {
                    Logger.info(`post src scc ,begin compiling res :${res}`)
                    return _this.postData(
                        _this.AliosAPIs["hostname"],
                        _this.AliosAPIs["port"],
                        _this.AliosAPIs["beginCompilePath"],
                        "")
                })
                .then(res => {
                    if (res == null || res == undefined) {
                        Logger.info("Compile No Data Back")
                        _this.outputResult("There are no Response from Compiler ")
                        return
                    }
                    let data = JSON.parse(res)
                    Logger.val("compiler return data :" + res)
                    Logger.val("compile result:" + data.compileInfo)
                    Logger.val("compiler's state:" + data.exitVal)
                    if (data.exitVal != "0") {
                        this.outputResult(data.compileInfo)
                        return
                    }
                    else {
                        Logger.info(`post src scc ,start dowloading hex file res:${res}`)
                        let downloadFd = http.request({
                            method: "GET",
                            hostname: _this.AliosAPIs["hostname"],
                            port: _this.AliosAPIs["port"],
                            path: _this.AliosAPIs["downloadHexPath"],
                            headers: {
                                Cookie: this.cookie
                            }
                        }, (mesg) => {
                            let ws = fs.createWriteStream(path.join(absPath, 'Install.zip'))
                            mesg.on("data", (b: Buffer) => {
                                Logger.info("downloading")
                                ws.write(b)
                            })
                            mesg.on("end", () => {
                                ws.close()
                                resolve("scc")
                                _this.outputResult('download hex.zip completed ,extracting hex file')
                                Logger.info("download scc")
                            })
                        })
                        downloadFd.write("")
                        downloadFd.end()
                    }
                }, err => console.log("err"))
        })



    }


    async postData(host: string, port: string, path: string, data: any): Promise<string> {
        return new Promise((resolve, rejects) => {
            let datastr = JSON.stringify(data)
            let respData = ''
            Logger.val("the cookie in postData:" + this.cookie)
            let req = http.request({ method: "POST", host: host, port: port, path: path, headers: { Cookie: this.cookie } }, (res) => {
                res.on('data', (b: Buffer) => {
                    respData += b.toString("UTF-8")
                })
                res.on("end", () => {
                    resolve(respData)
                })
                res.on('error', err => console.log(err))
            })
            if (req != null) {
                req.write(datastr)
                req.end()
            }
        })
    }


    submitForm(fm: FormData, hostname: string, port: string, path: string, method: string): Promise<string> {
        let _this = this
        return new Promise((resolve, reject) => {
            fm.submit({
                method: method,
                hostname: hostname,
                port: port,
                path: path,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
                    "Cookie": _this.cookie
                },
            }, (err, res) => {
                if (res == undefined) {
                    _this.outputResult("post form failed!")
                }
                Logger.val(res.statusCode, "stateCode:")
                let content = ''
                res.on('data', (b: Buffer) => {
                    if (this.DEBUG)
                        Logger.val(b.toString("UTF-8"))
                    if (res.headers['set-cookie']) {
                        this.cookie = res.headers['set-cookie'].toString()
                        Logger.val(res.headers['set-cookie'].toString())
                    }
                    if (this.DEBUG)
                        Logger.val("response header:" + res.headers)
                    content += b.toString("UTF-8")
                }
                )
                res.on('end', () => {
                    resolve(content)
                }
                )
            })
        })
    }


    setCookie(cookie: string): boolean {
        if (cookie != null && cookie != undefined && cookie != "") {
            this.cookie = cookie
            Logger.val('cookie is :' + this.cookie)
            return false
        }
        Logger.info(" null cookie")
        return true
    }


    outputResult(res: string,types?:string) {
        this.udc.outputResult("::" + res,types)
    }
}