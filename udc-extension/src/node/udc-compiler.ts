import * as path from 'path'
import * as unzip from "unzip"
import * as FormData from "form-data"
import * as fs from 'fs-extra';
import { UdcTerminal } from './udc-terminal'
import * as http from 'http'
import { Logger } from './logger'
export class UdcCompiler {
    constructor(udc: UdcTerminal) {
        this.udc = udc
    }
    DEBUG: boolean = false
    udc: UdcTerminal
    rootDir: string = "/home/project"
    cookie: string = ""
    tinyLinkAPIs: { [key: string]: string } = {
        hostname: "api.tinylink.cn",
        port: "80",
        srcPostPath: "/tinylink/withFile",//post file data return download uri
        downloadHexPath: "/tinylink/downloadHex",
    }


    createSrcFile(fnJSON: string) {
        let fn = JSON.parse(fnJSON)
        let rootdir = this.rootDir
        for (let i of fn) {
            let tmpPath = path.join(rootdir, i + ".cpp")
            fs.exists(tmpPath, (res) => {
                if (!res)
                    fs.writeFile(tmpPath, '', {}, (err) => { if (err != null) console.log(err) })
            })
        }
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
    extractHex(fn: string, index: number, useQueue: boolean): Promise<string> {
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
        this.getHexNmame(fn)
        let rootDir = this.rootDir
        let _this = this
        return new Promise((resolve, reject) => {
            fs.createReadStream(path.join(rootDir, fn + 'Install.zip'))
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    var fileName = entry.path;
                    if (fileName == "Install/sketch.ino.hex") {
                        Logger.info("find")
                        let fss = fs.createWriteStream(path.join(rootDir, _this.getHexNmame(fn) + 'sketch.ino.hex'))
                        entry.pipe(fss);
                        fss.on("close", () => {
                            Logger.info("programming")
                            // _this.program_device(path.join(rootDir,fn+'sketch.ino.hex'),'0','0')
                            // let dev_list = _this.udc.get_devlist();
                            // let devstr = "";
                            // for (let k in dev_list) {
                            //     devstr = k;
                            //     break;
                            // }
                            // Logger.log("-----------------devstr is :" + devstr)
                            if (useQueue) {
                                _this.outputResult(`program with queue`)
                                _this.udc.program_device_queue(path.join(rootDir, _this.getHexNmame(fn) + 'sketch.ino.hex'), "0", _this.devs[index]).then(
                                    (res) => {
                                        if (res) {
                                            _this.outputResult("program scc")
                                            resolve("scc")
                                        }
                                        else {
                                            _this.outputResult("program failed")
                                            reject(`failed`)
                                        }
                                    }
                                )
                            }
                            else {
                                _this.outputResult(`program without queue`)
                                _this.udc.program_device(path.join(rootDir, _this.getHexNmame(fn) + 'sketch.ino.hex'), "0", _this.devs[index]).then(
                                    (res) => {
                                        if (res) {
                                            _this.outputResult("program scc")
                                            resolve("scc")
                                        }
                                        else {
                                            _this.outputResult("program failed")
                                            reject(`failed`)
                                        }
                                    }
                                )

                            }
                            if (_this.fns.length == 0)
                                _this.outputResult("all hex files have been programmed!")
                        })
                    } else {
                        entry.autodrain();
                    }
                })
        })
    }


    fns: string[] = []
    postSrcFile(fns: string, setTag: boolean, dev: number): Promise<string> {
        let pid = this.udc.cuurentPid
        let useQueue = false
        if (this.udc.pidQueueInfo[pid].loginType == "queue")
            useQueue = true
        Logger.val("filenames:" + JSON.stringify(fns))
        if (setTag) {
            this.fns = JSON.parse(fns)
            this.devs = []
        }
        let fn = this.fns.shift()
        Logger.val("post file name " + fn)
        if (fn == undefined)
            return new Promise((resolve) => resolve('postfile finish'))
        let rootDir = this.rootDir
        let tmpPath = path.join(rootDir, fn + ".cpp")
        let b = fs.readFileSync(tmpPath)
        let fm = new FormData()
        fm.append("file", b, fn + '.cpp')
        let _this = this
        // add by zjd
        if (this.udc.udcClient) {
            this.outputResult('online compiling......')
        }
        return new Promise((resolve, reject) => {
            _this.submitForm(fm,
                _this.tinyLinkAPIs["hostname"],
                _this.tinyLinkAPIs["port"],
                _this.tinyLinkAPIs["srcPostPath"],
                "POST").then(res => {
                    if (res == null || res == undefined || res == '') {
                        Logger.info("Compile No Data Back")
                        _this.outputResult("There are no Response from Compiler ")
                        return
                    }
                    let tmp = JSON.parse(res)
                    let data = JSON.parse(tmp.data)
                    Logger.val("compiler return data :" + data)
                    Logger.val("compile result:" + tmp.data)
                    Logger.val("compiler's state:" + data["systemState"])
                    if (data.verbose == 'Cross Compiling Error.') {
                        this.udc.udcClient != undefined && this.outputResult("online compile failure,check your src file please")
                        this.outputResult(data.compileDebug)
                        reject("srcFile Post failed")
                    }
                    else if (data.verbose != '') {
                        reject("online compiler error")
                        this.udc.udcClient != undefined && this.outputResult(`the online compiler has some troubles,try later please`)
                    }
                    else {
                        let downloadFd = http.request({
                            method: "GET",
                            hostname: _this.tinyLinkAPIs["hostname"],
                            port: _this.tinyLinkAPIs["port"],
                            path: _this.tinyLinkAPIs["downloadHexPath"],
                            headers: {
                                Cookie: this.cookie
                            }
                        }, (mesg) => {
                            fs.exists(path.join(this.rootDir, fn + 'Install.zip'), (tag) => {
                                // if (tag == true) fs.remove(path.join(this.rootDir, fn + 'Install.zip'))
                                let ws = fs.createWriteStream(path.join(this.rootDir, fn + 'Install.zip'))
                                mesg.on("data", (b: Buffer) => {
                                    Logger.info("downloading")
                                    ws.write(b)
                                })
                                mesg.on("end", () => {
                                    ws.close()
                                    _this.outputResult('download hex.zip completed ,extracting hex file')
                                    Logger.info("download scc")
                                    _this.extractHex(fn!, dev, useQueue).then(() => {
                                        try {
                                            _this.postSrcFile(fns, false, dev + 1)
                                        }
                                        catch (e) {
                                        }
                                        resolve("scc")
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