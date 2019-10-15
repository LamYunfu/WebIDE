import * as path from 'path'
import * as FormData from "form-data"
import * as fs from 'fs-extra';
import { UdcTerminal } from '../util/udc-terminal'
import * as http from 'http'
import { Logger } from '../util/logger'
import { injectable, inject, LazyServiceIdentifer } from 'inversify';
@injectable()
export class UdcCompiler {
    constructor(
        @inject(new LazyServiceIdentifer(() => UdcTerminal)) protected readonly udc: UdcTerminal,
    ) {

    }
    DEBUG: boolean = false
    rootDir: string = "/home/project"

    tinyLinkAPIs: { [key: string]: string } = {
        hostname: "api.tinylink.cn",
        port: "80",
        srcPostPath: "/tinylink/withFile",//post file data return download uri
        downloadHexPath: "/tinylink/downloadHex",
    }
    get cookie() {
        return this.udc.cookie
    }
    set cookie(cookie) {
        this.udc.setCookie(cookie)
    }
    getHexNmame(fn: string) {
        return "B" + new Buffer(fn).toString("hex")
    }
    async postSrcFile(pid: string, roleName?: string): Promise<string> {
        let tmpPath = ""
        let { dirName, deviceRole, model } = this.udc.pidQueueInfo[pid]
        if (roleName != undefined) {
            deviceRole = model.split(";")
        }
        for (let item of deviceRole!) {
            if (roleName != undefined && item != roleName) {
                continue
            }
            let fileDir = path.join(this.rootDir, dirName, item)
            let fn = fs.readdirSync(fileDir)[0].split(".")[0]
            tmpPath = path.join(fileDir, fn + ".cpp")
            Logger.val(`tmpPath:${tmpPath}`)
            let b = fs.readFileSync(tmpPath)
            let fm = new FormData()
            fm.append("file", b, fn + '.cpp')
            let _this = this
            let res = await new Promise((resolve, reject) => {
                _this.submitForm(fm,
                    _this.tinyLinkAPIs["hostname"],
                    _this.tinyLinkAPIs["port"],
                    _this.tinyLinkAPIs["srcPostPath"],
                    "POST").then(res => {
                        if (res == null || res == undefined || res == '') {
                            Logger.info("Compile No Data Back,Mabye your login info expired,try login again")
                            _this.outputResult("there are no Response from Compiler ")
                            reject("failed")
                            return
                        }
                        let tmp = JSON.parse(res)
                        // if (tmp.status != '200') {
                        //     this.outputResult(`${tmp.error}`)
                        //     this.outputResult(`${tmp.message}`)
                        //     return
                        // }
                        Logger.info(`compile data back:${res}`)
                        let data = JSON.parse(tmp.data)
                        Logger.val("compiler return data :" + data)
                        Logger.val("compile result:" + tmp.data)
                        Logger.val("compiler's state:" + data["systemState"])
                        if (data.verbose == 'Cross Compiling Error.') {
                            this.udc.udcClient != undefined && this.outputResult("compile online unsuccess,check your src file please")
                            this.outputResult(data.compileDebug)
                            reject("srcFile Post failed")
                        }
                        else if (data.verbose != '') {
                            reject("online compiler error")
                            this.udc.udcClient != undefined && this.outputResult(`${data.verbose}`)
                            reject("failed")
                            return
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
                                let ws = fs.createWriteStream(path.join(this.rootDir, dirName, fn + 'Install.zip'))
                                let count = 0
                                // let x = new Buffer("")

                                mesg.on("data", (b: Buffer) => {
                                    if (count++ % 60 == 0)
                                        Logger.info("downloading")
                                    // x.write(b.toString("hex"))
                                    ws.write(b)
                                })
                                mesg.on("end", async () => {
                                    // ws.write(x)
                                    ws.close()
                                    _this.outputResult('extracting hex file......')
                                    resolve("scc")
                                    return
                                })
                            })
                            downloadFd.write("")
                            downloadFd.end()
                        }
                    }, err => console.log("err"))

            })
            if (res != "scc")
                return "failed"
        }
        return "scc"

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
        return this.udc.setCookie(cookie)
    }


    outputResult(res: string, types: string = "systemInfo") {
        this.udc.outputResult(res, types)
    }
}