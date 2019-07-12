// import { certificate } from './../common/udc-config';
import { UdcClient } from '../common/udc-watcher';
import { injectable, inject } from "inversify";
// import * as tls from 'tls';
import * as net from 'net'
import * as fs from 'fs-extra';
import { Packet } from "./packet";
import * as events from "events";
import * as http from 'http'
import { networkInterfaces } from 'os';
import { LOGINTYPE } from '../common/udc-service';
import * as path from 'path'
import * as unzip from "unzip"
import * as FormData from "form-data"
@injectable()
export class UdcTerminal {
    DEBUG: boolean = false
    udcserver: any;
    DEFAULT_SERVER: string = "118.31.76.36";
    DEFAULT_PORT: number = 2000;
    udcControlerClient: any = null;
    model: string = "esp8266";
    login_type: LOGINTYPE = LOGINTYPE.ADHOC
    dev_list?: { [key: string]: number }
    cmd_excute_state = "idle"
    cmd_excute_return: any = ""
    udcServerClient: any = null
    udcClient?: UdcClient
    events = new events.EventEmitter();
    event: any
    ldcHost: string = "192.168.0.1"
    ldcPort: string = "8000"
    judgeHost: string = "192.168.190.38"
    judgePort: string = "6000"
    rootDir: string = "/home/project"
    quizTitle: { [key: string]: string } = {}
    quizInfo: { [key: string]: string } = {}
    cookie: string = ""
    linkLabAPIs: { [key: string]: string } = {
        hostname: "api.tinylink.cn",
        port: "80",
        // hostname: "192.168.190.38",
        // port: "8080",
        // hostname: "192.168.1.150",
        // port: "8080",
        quizRequestPath: "/problem/query",
        loginPath: "/user/login"
        // cookie: "",
    }
    tinyLinkAPIs: { [key: string]: string } = {
        hostname: "api.tinylink.cn",
        port: "80",
        // hostname: "192.168.1.150",
        // port: "8080",
        srcPostPath: "/tinylink/withFile",//post file data return download uri
        downloadHexPath: "/tinylink/downloadHex",
    }
    quizSysAPIs: { [key: string]: string } = {
        hostname: "judge.tinylink.cn",
        port: "80",
        // hostname: "192.168.1.150",
        // port: "12300",
        issueStatusPath: "/problem/status",
        judgeRequestPath: "/problem/judge",
        issueInfoPath: "/problem/description"
        // cookie: "",
    }
    constructor(
        @inject(Packet) protected readonly pkt: Packet,
    ) {
        this.event = new events.EventEmitter();
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!" + process.cwd())
        fs.createFile("abc.ts")
    }

    setClient(client: UdcClient) {
        this.udcClient = client;
    }

    get uuid(): string {
        let uuid: string = '';
        let interfaces = networkInterfaces();
        for (let intf in interfaces) {
            for (let i in interfaces[intf]) {
                if (interfaces[intf][i].family === 'IPv6') { continue; }
                if (interfaces[intf][i].address === '127.0.0.1') { break; }
                uuid = interfaces[intf][i].mac.replace(/:/g, '') + '0000'
                break;
            }
        }
        return uuid;
    }
    login_and_get_server(login_type: LOGINTYPE, model: string): Promise<Array<any>> {
        // let options = {
        //     ca: certificate,
        //     rejectUnauthorized: false,
        //     // requestCert: true,
        // }
        let uuid = this.uuid
        return new Promise(function (resolve, reject) {
            // let server_ip = "118.31.76.36"
            // let server_port = 2000
            let server_ip = "47.97.253.23"
            let server_port = 5000
            // let server_ip = "192.168.1.233"
            // let server_port = 2000
            // let ctrFd = tls.connect(server_port, server_ip, options, () => {
            let ctrFd = net.connect(server_port, server_ip, () => {
                console.log("connect scc")
            })
            ctrFd.on('error', () => {
                reject('error')
            });
            ctrFd.on('close', () => {
                console.log('Connection to Udc Server Closed!');
            });
            ctrFd.on("data", (data: Buffer) => {
                let d = data.toString('ascii').substr(1, data.length).split(',')
                console.log(d.slice(2, d.length))
                resolve(d.slice(2, d.length))
            });
            // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
            // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
            let cm = '{ALGI,00035,terminal,' + uuid + ',adhoc,any}'
            ctrFd.write(cm)
            ctrFd.setTimeout(1000);
            console.log("finish")
        })
    }

    async postData(host: string, port: string, path: string, data: any): Promise<string> {
        return new Promise((resolve, rejects) => {
            let datastr = JSON.stringify(data)
            let respData = ''
            console.log(">>>>>>>>>>:" + this.cookie)
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

    async connect_to_server(server_ip: string, server_port: number, certificate: string, pid: string): Promise<string> {
        // let options = {
        //     ca: certificate,
        //     rejectUnauthorized: false,
        //     requestCert: false,
        // }
        console.log("serverPort: " + server_port)
        let _this = this;
        return new Promise(function (resolve, reject) {
            // _this.udcServerClient = tls.connect(server_port, server_ip, options, () => {
            _this.udcServerClient = net.connect(server_port, server_ip, () => {

                resolve('success')
            })
            _this.udcServerClient.on('error', () => {
                reject('fail')
            });
            _this.udcServerClient.on('close', () => {
                console.log('Connection to Udc Server Closed!');
            });
            console.log("server:pid<<<<<<<<<<<<<<<<<<<" + pid)
            _this.udcServerClient.on('data', (data: Buffer) => _this.onUdcServerData(data, pid));

            _this.udcServerClient.setTimeout(10000);
            _this.udcServerClient.on('timeout', () => {
                _this.send_packet(Packet.HEARTBEAT, '');
            })
        })
    }

    onUdcServerData = (data: Buffer, pid: string) => {
        // let [type, length, value, msg] = this.pkt.parse(data.toString('ascii'));
        let [type, , value] = this.pkt.parse(data.toString('ascii'));
        // console.log(`Received: type=${type} length=${length} value= ${value} msg=${msg}`);

        if (type === Packet.ALL_DEV) {
            let new_dev_list: { [key: string]: number } = {}
            let clients = value.split(':');
            for (let c of clients) {
                if (c === '') { continue; }
                let info = c.split(',');
                let uuid = info[0];
                let devs = info.slice(1);
                for (let d of devs) {
                    if (d === '') { continue; }
                    let [dev, using] = d.split('|')
                    new_dev_list[uuid + ',' + dev] = using
                }
            }
            this.dev_list = new_dev_list;

            if (this.udcClient) {
                this.udcClient.onDeviceList(new_dev_list)
            }

        } else if (type === Packet.DEVICE_STATUS) {
        } else if (type === Packet.TERMINAL_LOGIN) {
            if (value === 'success') {
                console.log('server login success');
            } else {
                console.log('login failed retrying ...');
                this.connect(this.login_type, this.model, pid)
            }
        } else if (type === Packet.CMD_DONE || type === Packet.CMD_ERROR) {
            console.log(data.toString('ascii'));
            this.cmd_excute_return = value;
            this.cmd_excute_state = (type === Packet.CMD_DONE ? 'done' : 'error');
            this.events.emit('cmd-response');
        } else if (type == Packet.DEVICE_LOG) {
            if (this.udcClient) {
                this.udcClient.OnDeviceLog(value)
            }
        }
        this.udcServerClient.write(this.pkt.construct(Packet.HEARTBEAT, ""));
    }

    async list_models(): Promise<Array<string>> {
        let default_devices = ['aiotkit',
            'developerkit',
            'esp32',
            'esp8266',
            'mk3060',
            'stm32l432kc',
            'tinylink_platform_1',
            'tinylink_lora',
            'tinylink_raspi'];
        return new Promise((resolve, reject) => resolve(default_devices))
    }

    get is_connected(): Boolean {
        return (this.udcServerClient != null);
    }
    async connect(login_type: LOGINTYPE, model: string, pid: string): Promise<Boolean | string> {
        console.log(">>>>>>>>>pid" + pid)
        let rets = await this.login_and_get_server(login_type, model);
        if (rets === []) { return false; }
        let [re, server_ip, server_port, token, certificate] = rets;
        if (re != 'success') { return false; }

        // add by zjd
        if (this.udcClient) {
            this.udcClient.OnDeviceLog('::connect to controller success, server ip is ' + server_ip)
        }

        let result = await this.connect_to_server(server_ip, server_port, certificate, pid);
        console.log("result-----------------------------" + result)
        if (result !== 'success') return false;
        // await this.udcServerClient.write(this.pkt.construct(Packet.packet_type.TERMINAL_LOGIN, "life"));

        // add by zjd
        if (this.udcClient) {
            this.udcClient.OnDeviceLog('::connect to server success')
        }

        if (pid != "null")
            await this.send_packet(Packet.packet_type.TERMINAL_LOGIN, `${this.login_type === LOGINTYPE.FIXED ? this.model : this.uuid},${token},${pid}`)//modifiy,timeout/
        else
            await this.send_packet(Packet.packet_type.TERMINAL_LOGIN, `${this.login_type === LOGINTYPE.FIXED ? this.model : this.uuid},${token},${pid}`)//modifiy,timeout/
        // await this.send_packet(Packet.packet_type.TERMINAL_LOGIN, `${this.login_type === LOGINTYPE.FIXED ? this.model : this.uuid},${token}`)
        return true;
    }

    async disconnect(): Promise<Boolean> {
        if (this.udcServerClient === null) {
            return true;
        }
        this.udcServerClient.destroy();
        this.udcServerClient = null;
        this.dev_list = undefined
        return true;
    }

    async erase_device(dev_str: string) {
        this.send_packet(Packet.DEVICE_ERASE, dev_str);
        await this.wait_cmd_excute_done(120000);
        return (this.cmd_excute_state === 'done' ? true : false);
    }

    async program_device(filepath: string, address: string, devstr: string): Promise<Boolean> {

        // add by zjd
        if (this.udcClient) {
            this.udcClient.OnDeviceLog('::sending hex file to LDC......')
        }

        let send_result = await this.send_file_to_client(filepath, devstr);
        if (send_result === false) {
            return false;
        }

        // add by zjd
        if (this.udcClient) {
            this.udcClient.OnDeviceLog('::send hex file to LDC success')
        }

        let content = `${devstr},${address},${await this.pkt.hash_of_file(filepath)}`
        this.send_packet(Packet.DEVICE_PROGRAM, content);
        await this.wait_cmd_excute_done(270000);

        // add by zjd
        if (this.udcClient) {
            if (this.cmd_excute_state === 'done') {
                this.udcClient.OnDeviceLog('::program success')
            }
            else {
                this.udcClient.OnDeviceLog('::program fail')
            }
        }

        return (this.cmd_excute_state === 'done' ? true : false);
    }
    async run_command(devstr: string, args: string) {
        let content = `${devstr}:${args.replace(' ', '|')}`
        this.send_packet(Packet.DEVICE_CMD, content);
        await this.wait_cmd_excute_done(1500);
        return (this.cmd_excute_state === 'done' ? true : false);
    }

    async control_device(devstr: string, operation: string): Promise<Boolean> {
        let operations: { [key: string]: string } = {
            'start': Packet.DEVICE_START,
            'stop': Packet.DEVICE_STOP,
            'reset': Packet.DEVICE_RESET,
        }
        if (operations.hasOwnProperty(operation) === false) {
            return false;
        }
        this.send_packet(operations[operation], devstr);
        await this.wait_cmd_excute_done(10000);
        return (this.cmd_excute_state === 'done' ? true : false);
    }

    async send_file_to_client(filepath: string, devstr: string): Promise<Boolean> {
        let filehash = await this.pkt.hash_of_file(filepath);
        let fullpath = filepath.split('/');
        let filename = fullpath[fullpath.length - 1]
        let content = devstr + ":" + filehash + ":" + filename;
        let retry = 4;
        while (retry > 0) {
            this.send_packet(Packet.FILE_BEGIN, content);
            await this.wait_cmd_excute_done(200);
            if (this.cmd_excute_state === "timeout") {
                console.log("timeout<<<<<<<<<<<<<<<<<<<<,,,,,")
                retry--;
                continue;
            }
            if (this.cmd_excute_return === "busy") {
                console.log("send file server busy");
                console.log("busy<<<<<<<<<<<<<<<<<<<<,,,,,")
                await new Promise(res => setTimeout(res, 5000))
                continue;
            }
            if (this.cmd_excute_return === 'ok' || this.cmd_excute_return === 'exist') {
                break;
            }
        }

        if (retry === 0) {
            return false;
        }

        if (this.cmd_excute_return === "exist") {
            return true;
        }

        let fileBuffer = await fs.readFileSync(filepath)
        let seq = 0;
        while (seq * 8192 < fileBuffer.length) {
            let header = `${devstr}:${filehash}:${seq}:`;
            let end = (seq + 1) * 8192;
            if (end > fileBuffer.length) {
                end = fileBuffer.length;
            }
            retry = 4;
            while (retry > 0) {
                console.log("sending data");
                this.send_packet(Packet.FILE_DATA, header + fileBuffer.slice(seq * 8192, end).toString('ascii'));
                await this.wait_cmd_excute_done(2000);
                if (this.cmd_excute_return === null) {
                    console.log("retuen null<<<<<<<<<<<<<<<<<<<<<<<<<<<");

                    retry--;
                    continue;
                } else if (this.cmd_excute_return != 'ok') {
                    console.log("not ok<<<<<<<<<<<<<<<<<<,,,,,<<<<");
                    return false;
                }
                break;
            }
            if (retry === 0) {
                return false;
            }
            seq++;
        }

        //send file end
        content = `${devstr}:${filehash}:${filename}`;
        retry = 4;
        while (retry > 0) {
            this.send_packet(Packet.FILE_END, content);
            await this.wait_cmd_excute_done(2000);
            if (this.cmd_excute_return === null) {
                retry--;
                console.log("return null <<<<<<<<<<<<<<<<");
                continue;
            } else if (this.cmd_excute_return != 'ok') {
                console.log("not ok <<<<<<<<<<<<<<<<<,");

                return false;
            }
            break;
        }
        if (retry === 0) {
            return false
        }
        return true;
    }

    send_packet(type: string, content: string) {
        // this.udcServerClient.write(this.pkt.construct(Packet.HEARTBEAT, ""));

        // if (type == Packet.TERMINAL_LOGIN)
        //     console.log(this.udcServerClient)
        // console.log("---------------------type right: "+type+content)

        this.udcServerClient.write(this.pkt.construct(type, content));
    }

    async wait_cmd_excute_done(timeout: number) {
        this.cmd_excute_state = 'wait_response';
        this.cmd_excute_return = null;
        return new Promise((resolve, reject) => {
            let cmd_timeout = setTimeout(() => {
                this.cmd_excute_state = 'timeout';
                this.events.removeAllListeners('cmd-response');
                resolve();
            }, timeout);
            this.events.once('cmd-response', () => {
                clearTimeout(cmd_timeout);
                this.events.removeAllListeners('cmd-response');
                resolve();
            });
        });
    }

    get_devlist() {
        return this.dev_list;
    }
    // createSrcFile(fn: string[]) {
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
        console.log("16>>>>>>>>>>>>>>>>>>" + x)
        return x

    }
    extractHex(fn: string): Promise<string> {
        this.getHexNmame(fn)
        let rootDir = this.rootDir
        let _this = this
        return new Promise((resolve, reject) => {
            fs.createReadStream(path.join(rootDir, fn + 'Install.zip'))
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    var fileName = entry.path;
                    if (fileName == "Install/sketch.ino.hex") {
                        let fss = fs.createWriteStream(path.join(rootDir, _this.getHexNmame(fn) + 'sketch.ino.hex'))
                        entry.pipe(fss);
                        fss.on("close", () => {
                            console.log("programming------------------------")
                            // _this.program_device(path.join(rootDir,fn+'sketch.ino.hex'),'0','0')
                            let dev_list = _this.get_devlist();
                            let devstr = "";
                            for (let k in dev_list) {
                                devstr = k;
                                break;
                            }
                            console.log("-----------------devstr is :" + devstr)
                            _this.program_device(path.join(rootDir, _this.getHexNmame(fn) + 'sketch.ino.hex'), '0', devstr)
                            console.log("find")
                            resolve("scc")
                        })
                    } else {
                        entry.autodrain();
                    }
                })
        })
    }
    postSrcFile(fn: string): Promise<string> {
        let rootDir = this.rootDir
        let tmpPath = path.join(rootDir, fn + ".cpp")
        let b = fs.readFileSync(tmpPath)
        let fm = new FormData()
        fm.append("file", b, fn + '.cpp')
        let _this = this
        // add by zjd
        if (this.udcClient) {
            this.udcClient.OnDeviceLog('::online compiling......')
        }
        return new Promise((resolve, reject) => {
            _this.submitForm(fm,
                _this.tinyLinkAPIs["hostname"],
                _this.tinyLinkAPIs["port"],
                _this.tinyLinkAPIs["srcPostPath"],
                "POST").then(res => {
                    if (res == null || res == undefined || res == '')
                        console.log("no return in getIssuesData")
                    let tmp = JSON.parse(res)
                    let data = JSON.parse(tmp.data)
                    console.log(data)
                    console.log("<<<<<<<<<compile result:" + JSON.stringify(tmp))
                    console.log("<<<<<<<<<<<<<<<<<<<<" + tmp["data"]["systemState"])
                    if (data.verbose == 'Cross Compiling Error.') {
                        this.udcClient != undefined && this.udcClient.OnDeviceLog("::online compile failure,check your src file please")
                        reject("srcFile Post failed")
                    }
                    else if (data.verbose != '') {
                        reject("online compiler error")
                        this.udcClient != undefined && this.udcClient.OnDeviceLog(`::the online compiler has some troubles,try later please`)
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
                            fs.exists(path.join(this.rootDir, fn + 'Install.zip'), (tag) => { if (tag == true) fs.remove(path.join(this.rootDir, fn + 'Install.zip')) })
                            let ws = fs.createWriteStream(path.join(this.rootDir, fn + 'Install.zip'))
                            mesg.on("data", (b: Buffer) => {
                                console.log("downloading")
                                ws.write(b)
                            })
                            mesg.on("end", () => {
                                if (_this.udcClient) {
                                    _this.udcClient.OnDeviceLog('::download hex.zip completion now extract hex file')
                                }
                                console.log("download scc")
                                ws.end()
                                _this.extractHex(fn).then(() => {
                                    // add by zjd
                                    // if (_this.udcClient) {
                                    //     _this.udcClient.OnDeviceLog('::extract completion')
                                    // }
                                    fs.remove(path.join(this.rootDir, fn + 'Install.zip'))
                                    resolve("scc")
                                }, () => {
                                    if (_this.udcClient) {
                                        _this.udcClient.OnDeviceLog('::extract failure')
                                    }
                                })


                            })
                        })
                        downloadFd.write("")
                        downloadFd.end()
                    }
                }, err => console.log("err"))

        })
    }
    // submitForm(fm: FormData, hostname: string, port: string, path: string, method: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         fm.submit({
    //             method: method,
    //             // hostname: "api.tinylink.cn",
    //             // path: "/user/login",
    //             hostname: hostname,
    //             port: port,
    //             path: path,
    //             headers: {
    //                 "Accept": "application/json",
    //                 "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
    //                 "Cookie": this.cookie
    //             },
    //         }, (err, res) => {
    //             // console.log(err)         
    //             console.log(res.statusCode)
    //             res.on('data', (b: Buffer) => {
    //                 console.log(b.toString("UTF-8"))
    //                 if (res.headers['set-cookie'])
    //                     this.cookie = res.headers['set-cookie'].toString()
    //                 console.log(res.headers)
    //                 resolve(b.toString("UTF-8"))
    //             })
    //         })
    //     })
    // }
    submitForm(fm: FormData, hostname: string, port: string, path: string, method: string): Promise<string> {
        let _this = this
        return new Promise((resolve, reject) => {
            fm.submit({
                method: method,
                // hostname: "api.tinylink.cn",
                // path: "/user/login",
                hostname: hostname,
                port: port,
                path: path,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
                    "Cookie": _this.cookie
                },
            }, (err, res) => {
                // console.log(err)    
                if (this.DEBUG)
                    console.log(res.statusCode)
                let content = ''
                res.on('data', (b: Buffer) => {
                    if (this.DEBUG)
                        console.log(b.toString("UTF-8"))
                    if (res.headers['set-cookie']) {
                        this.cookie = res.headers['set-cookie'].toString()
                        console.log(res.headers['set-cookie'].toString())
                    }
                    if (this.DEBUG)
                        console.log(res.headers)
                    content += b.toString("UTF-8")
                    // resolve(b.toString("UTF-8"))
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
            console.log('cookie is :' + this.cookie)
            return false
        }
        console.log(" null cookie")
        return true
    }
    outputResult(res: string) {
        this.udcClient && this.udcClient.OnDeviceLog(res)
    }

}