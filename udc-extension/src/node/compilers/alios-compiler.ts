import { injectable, LazyServiceIdentifer, inject } from 'inversify';
import * as path from 'path'
import * as unzip from "unzip"
import * as FormData from "form-data"
import * as fs from 'fs-extra';
import { UdcTerminal } from '../udc-terminal'
import * as http from 'http'
import { Logger } from '../logger'

@injectable()
export class AliosCompiler {
    constructor(@inject(new LazyServiceIdentifer(() => UdcTerminal)) protected readonly udc: UdcTerminal) {

    }
    DEBUG: boolean = false
    rootDir: string = "/home/project"
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


    downloadZip(): Promise<string> {
        return new Promise((resolve, reject) => {
            resolve('scc')
        })
    }


    getHexNmame(fn: string) {
        let x = 'B'
        for (let i = 0; i < fn.length; i++) {
            x += fn.charCodeAt(i).toString(16)
        }
        Logger.val("16>>>>>>>>>>>>>>>>>>" + x)
        return x

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
                            _this.udc.program_device_queue(path.join(rootDir, dirName, 'sketch.ino.hex'), "1", _this.devs[index]).then(
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
                            _this.udc.program_device(path.join(rootDir, dirName, 'sketch.ino.hex'), "1", _this.devs[index], pid).then(
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
                                            resolve("faild")
                                            Logger.info("process faild")
                                        })
                                    }
                                }
                            )

                        }
                        if (_this.fns.length == 0)
                            _this.outputResult("all hex files have been programmed!")
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
    // async postNameAndType(projectName: string, boardType: string, fns: string) {

    async postNameAndType(pid: string) {
        const BoardType: { [key: string]: string } = {
            esp32: "esp32devkitc"
        }
        let { model, fns, dirName } = await this.udc.getPidInfos(pid)
        let projectName = "helloworld"
        let boardType = BoardType[model.split('-')[1]]
        Logger.info("start post Name and type" + fns)
        let fm = new FormData()
        fm.append("Pname", projectName)
        fm.append("Board", boardType)
        this.setDownloadHexPathName(projectName!, boardType)
        await this.submitForm(fm,
            this.AliosAPIs["hostname"],
            this.AliosAPIs["port"],
            this.AliosAPIs["srcPostPath"],
            "POST").then(res => {
                return Logger.info(`postNameAndType back:${res}`)
            }).then(async () => {
                // let x = ["helloworld"]
                await this.postSrcFile(fns!, true, 0, dirName)
            })
            .then(() => {
                Logger.info('alios program finish')
            })
    }

    fns: string[] = []
    async postSrcFile(fns: string, setTag: boolean, dev: number, dirName: string) {
        let pid = this.udc.cuurentPid
        let useQueue = false
        if (this.udc.pidQueueInfo[pid].loginType == "queue")
            useQueue = true
        Logger.val("filenames:" + JSON.stringify(fns))
        if (setTag) {
            this.fns = JSON.parse(fns)
            this.devs = []
        }
        let rootDir = this.rootDir
        let fm = new FormData()
        let cppPath = path.join(rootDir, dirName, "helloworld.cpp")
        let mkPath = path.join(rootDir, dirName, "helloworld.mk")
        let pyPath = path.join(rootDir, dirName, "ucube.py")
        let rdPath = path.join(rootDir, dirName, "README.md")
        let cs = fs.readFileSync(cppPath)
        let ms = fs.readFileSync(mkPath)
        let ps = fs.readFileSync(pyPath)
        let rs = fs.readFileSync(rdPath)
        fm.append("files", cs, "helloworld" + ".cpp")
        fm.append("files", ms, "helloworld" + ".mk")
        fm.append("files", ps, "ucube.py")
        fm.append("files", rs, "README.md")
        let _this = this
        await _this.submitForm(fm,
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
                Logger.info(`post src scc ,start program res:${res}`)
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
                    let downloadFd = http.request({
                        method: "GET",
                        hostname: _this.AliosAPIs["hostname"],
                        port: _this.AliosAPIs["port"],
                        path: _this.AliosAPIs["downloadHexPath"],
                        headers: {
                            Cookie: this.cookie
                        }
                    }, (mesg) => {
                        fs.exists(path.join(_this.rootDir, dirName, 'Install.zip'), (tag) => {
                            // if (tag == true) fs.remove(path.join(this.rootDir, fn + 'Install.zip'))
                            let ws = fs.createWriteStream(path.join(this.rootDir, dirName, 'Install.zip'))
                            mesg.on("data", (b: Buffer) => {
                                Logger.info("downloading")
                                ws.write(b)
                            })
                            mesg.on("end", () => {
                                ws.close()
                                _this.outputResult('download hex.zip completed ,extracting hex file')
                                Logger.info("download scc")
                                _this.extractHex(dev, useQueue, dirName, pid).then((result) => {
                                    Logger.info(`extract ${result}`)
                                }, () => {
                                    _this.outputResult('extract failure')
                                })
                            })
                        })
                    })
                    downloadFd.write("")
                    downloadFd.end()
                }
            }, err => console.log("err"))


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
                if (this.DEBUG)
                    Logger.val(res.statusCode)
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


    outputResult(res: string) {
        this.udc.udcClient && this.udc.udcClient.OnDeviceLog("::" + res)
    }
}