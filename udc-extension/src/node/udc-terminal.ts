import { certificate } from './../common/udc-config';
import { UdcClient } from '../common/udc-watcher';
import { injectable, inject } from "inversify";
import * as tls from 'tls';
// import * as net from 'net'
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
    rootDir: string = "/home/liang/theiaWorkSpace"
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
        let options = {
            ca: certificate,
            rejectUnauthorized: false,
            // requestCert: true,
        }
        // let uuid = this.uuid
        return new Promise(function (resolve, reject) {
            // let server_ip = "118.31.76.36"
            // let server_port = 2000
            let server_ip = "47.97.253.23"
            let server_port = 1880
            // let server_ip = "192.168.1.233"
            // let server_port = 2000
            let ctrFd = tls.connect(server_port, server_ip, options, () => {
                // let ctrFd = net.connect(server_port, server_ip, () => {
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
            let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
            // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
            // let cm = '{ALGI,00035,terminal,' + uuid + ',adhoc,any}'
            ctrFd.write(cm)
            ctrFd.setTimeout(1000);
            console.log("finish")
        })
    }
    async setJudgeHostandPort(judgeHost: string, judgePort: string) {
        this.judgeHost = judgeHost
        this.judgePort = judgePort
    }
    async setLdcHostandPort(ldcHost: string, ldcPort: string) {
        this.ldcHost = ldcHost
        this.ldcPort = ldcPort
    }
    // getIssues(): Promise<{ [key: string]: {} }> {
    getIssues(): Promise<string> {
        // return new Promise((resolve) => {
        //     this.quizDescriptiontest('1').then(() => {
        //         resolve({info:this.quizInfo,title:this.quizTitle})
        //     })
        // })
        this.login()
        return new Promise((resolve) => {
            resolve(JSON.stringify({
                title: this.quizTitle,
                info: this.quizInfo
            }))
        })
    }
    async queryStatus(issueNumList: string[]): Promise<{ [key: string]: string }> {
        let data = {
            pid: issueNumList
        }
        console.log("queryStatus<<<<<<<<" + issueNumList)
        return new Promise((resolve, reject) => {
            this.postData(this.quizSysAPIs["hostname"], this.quizSysAPIs["port"], "/problem/status", data).then(x => {
                if (x == null || x == undefined || x == '')
                console.log("no return in queryStatus")
                console.log(x)
                let tmp = JSON.parse(x)
                let ret: { [key: string]: string } = {}
                for (let index in tmp['problem']) {
                    // console.log(tmp['problem'][index]['pid'] + ": " + tmp['problem'][index]['status'])
                    ret[tmp['problem'][index]['pid']] = tmp['problem'][index]['status']
                }
                resolve(ret)
                // for (let xi in tmp)
                //     this.quizInfo[xi] = tmp[xi]
            }, (err) => console.log(err)
            )
        }
        )

        // return this.postData(this.judgeHost, this.judgePort, "/problem/status", issueNumList)
        // this.quizDescription(pid)
    }
    async quizGenerate(host: string, port: string, ppid: string) {//
        let data = {
            ppid: ppid
        }
        return await this.postData(this.judgeHost, this.judgePort, "/problem/generate", data)
    }

    async quizDescriptiontest(pid: string) {//获得题目信息
        let data = {
            pid: pid
        }
        let ret = this.postData(this.judgeHost, this.judgePort, "/problem/description", data)
        ret.then((x) => {
            if (x == null || x == undefined || x == '')
            console.log("no return in quizDescriptionTest")
            let tmp = JSON.parse(x)
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            // console.log(tmp["pid"])
            // console.log(tmp["content"])
            this.quizInfo[tmp["pid"]] = tmp["content"]

        }, (err) => console.log(err))
    }
    async quizDescription(pid: string) {
        let data = {
            pid: pid
        }
        let ret = this.postData(this.linkLabAPIs["hostname"], this.linkLabAPIs["port"], "/problem/description", data)
        ret.then((x) => {
            if (x == null || x == undefined || x == '')
            console.log("no return in quizeDescription")
            let tmp = JSON.parse(x)
            for (let xi in tmp)
                this.quizInfo[xi] = tmp[xi]
        }, (err) => console.log(err))
    }
    async quizJudge(host: string, port: string, pid: string) {
        let data = {
            pid: pid
        }
        return this.postData(this.linkLabAPIs["hostname"], this.linkLabAPIs["port"], "/problem/judge", data)
    }
    // async postData(host: string, port: string, path: string, data: any): Promise<string> {
    //     return new Promise((resolve, rejects) => {
    //         let datastr = JSON.stringify(data)
    //         let respData = ''
    //         let req = http.request({ method: "POST", host: host, port: port, path: path }, (res) => {
    //             res.on('data', (b: Buffer) => {
    //                 respData = b.toString("UTF-8")
    //                 console.log("<<<<<<: " + respData)
    //                 resolve(respData)
    //             })
    //             res.on('error', err => console.log(err))
    //         })
    //         if (req != null) {
    //             req.write(datastr)
    //             req.end()
    //         }
    //     })
    // }
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

    // login_and_get_server(login_type: LOGINTYPE, model: string): Promise<Array<any>> {
    //     this.model = model;
    //     this.login_type = login_type;

    //     const data = JSON.stringify({
    //         uuid: login_type === LOGINTYPE.ADHOC ? this.uuid : model,
    //         type: login_type,
    //         model: login_type === LOGINTYPE.ADHOC ? model : "any",
    //     })

    //     let options = {
    //         host: '118.31.76.36',
    //         port: 8080,
    //         path: '/terminal/login',
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Content-Length': data.length,
    //         },
    //         cert: certificate,
    //         rejectUnauthorized: false,
    //     }

    //     return new Promise((resolve, reject) => {
    //         let req = https.request(options, function (res) {
    //             res.on('data', (d: Buffer) => {
    //                 let result = JSON.parse(d.toString('ascii'));
    //                 if (result.result === "success") {
    //                     let ret = [result.result, result.host, result.port, result.token, result.certificate]
    //                     resolve(ret)
    //                 } else {
    //                     reject(result.message)
    //                 }
    //             })
    //             res.on('error', (err) => {
    //                 console.log(err);
    //                 reject('api call failed')
    //             })
    //         });
    //         req.write(data);
    //         req.end();
    //     })
    // }

    // async connect_to_server(server_ip: string, server_port: number, certificate: string): Promise<string> {
    //     let options = {
    //         ca: certificate,
    //         rejectUnauthorized: false,
    //         requestCert: false,
    //     }

    //     let _this = this;
    //     return new Promise(function (resolve, reject) {
    //         _this.udcServerClient = tls.connect(server_port, server_ip, options, () => {
    //             resolve('success')
    //         })
    //         _this.udcServerClient.on('error', () => {
    //             reject('fail')
    //         });
    //         _this.udcServerClient.on('close', () => {
    //             console.log('Connection to Udc Server Closed!');
    //         });
    //         _this.udcServerClient.on('data', _this.onUdcServerData);

    //         _this.udcServerClient.setTimeout(10000);
    //         _this.udcServerClient.on('timeout', () => {
    //             _this.send_packet(Packet.HEARTBEAT, '');
    //         })
    //     })
    // }

    async connect_to_server(server_ip: string, server_port: number, certificate: string): Promise<string> {
        let options = {
            ca: certificate,
            rejectUnauthorized: false,
            requestCert: false,
        }
        console.log("serverPort: " + server_port)
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.udcServerClient = tls.connect(server_port, server_ip, options, () => {
                // _this.udcServerClient = net.connect(server_port, server_ip, () => {

                resolve('success')
            })
            _this.udcServerClient.on('error', () => {
                reject('fail')
            });
            _this.udcServerClient.on('close', () => {
                console.log('Connection to Udc Server Closed!');
            });
            _this.udcServerClient.on('data', _this.onUdcServerData);

            _this.udcServerClient.setTimeout(10000);
            _this.udcServerClient.on('timeout', () => {
                _this.send_packet(Packet.HEARTBEAT, '');
            })
        })
    }

    onUdcServerData = (data: Buffer) => {
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
                this.connect(this.login_type, this.model)
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
        // let default_devices = ["RandomDevice"];

        // let options = {
        //     host: '118.31.76.36',
        //     port: 8080,
        //     path: '/list/models',
        //     method: 'GET',
        //     cert: certificate,
        //     rejectUnauthorized: false
        // }

        // return new Promise((resolve, reject) => {
        //     https.request(options, function (res) {
        //         res.on('data', (d: Buffer) => {
        //             let result = JSON.parse(d.toString('ascii'));
        //             if (result.result === "success" && result.models != null) {
        //                 resolve(result.models)
        //             } else {
        //                 resolve(default_devices)
        //             }
        //         })

        //         res.on('error', (err) => {
        //             console.log(err);
        //             resolve(default_devices)
        //         })
        //     }).end();
        // })
        return new Promise((resolve, reject) => resolve(default_devices))
    }

    get is_connected(): Boolean {
        return (this.udcServerClient != null);
    }

    async connect(login_type: LOGINTYPE, model: string): Promise<Boolean | string> {
        let rets = await this.login_and_get_server(login_type, model);
        if (rets === []) { return false; }
        let [re, server_ip, server_port, token, certificate] = rets;
        if (re != 'success') { return false; }
        let result = await this.connect_to_server(server_ip, server_port, certificate);
        console.log("result-----------------------------" + result)
        if (result !== 'success') return false;
        // await this.udcServerClient.write(this.pkt.construct(Packet.packet_type.TERMINAL_LOGIN, "life"));

        await this.send_packet(Packet.packet_type.TERMINAL_LOGIN, `${this.login_type === LOGINTYPE.FIXED ? this.model : this.uuid},${token}`)//modifiy,timeout/
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
        let send_result = await this.send_file_to_client(filepath, devstr);
        if (send_result === false) {
            return false;
        }

        let content = `${devstr},${address},${await this.pkt.hash_of_file(filepath)}`
        // console.log(content);
        this.send_packet(Packet.DEVICE_PROGRAM, content);
        await this.wait_cmd_excute_done(270000);
        return (this.cmd_excute_state === 'done' ? true : false);
    }
    // async judgeIssue(filepath: string, address: string, devstr: string,issueNum:string): Promise<Boolean> {
    //     let send_result = await this.send_file_to_client(filepath, devstr);
    //     if (send_result === false) {
    //         return false;
    //     }

    //     let content = `${devstr},${address},${await this.pkt.hash_of_file(filepath)}`
    //     // console.log(content);
    //     this.send_packet(Packet.DEVICE_PROGRAM, content);
    //     await this.wait_cmd_excute_done(270000);
    //     return (this.cmd_excute_state === 'done' ? true : false);
    // }
    token: any
    async judge(filepath: string, address: string, devstr: string, token: string): Promise<boolean> {
        let send_result = await this.send_file_to_client(filepath, devstr)
        if (send_result === false) {
            return false;
        }
        let content = `${token},${devstr},${address},${await this.pkt.hash_of_file(filepath)}`
        this.send_packet(Packet.QUIZ_JUDGE, content);
        await this.wait_cmd_excute_done(60000);
        console.log("judge finish:" + this.cmd_excute_return)
        return (this.cmd_excute_state === 'done' ? true : false);
    }
    get_quiz_token(quizNo: string): boolean {
        this.send_packet(Packet.GET_QUIZ_TOKEN, quizNo)
        this.wait_cmd_excute_done(5000)
        if (this.cmd_excute_state == 'done') {
            console.log("token has generated!")
            this.token = this.cmd_excute_return.split(" ").pop()
            return true
        }
        else {
            console.log("token generating failure!")
            return false
        }
    }
    get_quiz_status(quiztoken: string): void {
        this.send_packet(Packet.GET_QUIZ_STATUS, this.token)
        this.wait_cmd_excute_done(5000)
        if (this.cmd_excute_state == 'done') {
            console.log("get quiz status scc: " + this.cmd_excute_return)
        }
        else {
            console.log("command execute failed")
        }
    }
    getToken(): string {
        return this.token
    }


    // def get_quiz_status(self, args):
    //     if len(args) < 1 or len(args) > 2:
    //         self.cmdrun_status_display('Usage error, usage: quizstatus <token>')
    //         return False
    //     token = args[0]
    //     self.send_packet(pkt.GET_QUIZ_STATUS, token)
    //     self.wait_cmd_excute_done(5)

    //     status_str = ''
    //     if self.cmd_excute_state == 'done':
    //         status_str = 'succeed: your quiz is ' + self.cmd_excute_return
    //     else:
    //         status_str = 'failed: ' + self.cmd_excute_return
    //     self.cmd_excute_state = 'idle'
    //     self.cmdrun_status_display(status_str)
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

    extractHex(fn: string): Promise<string> {
        let rootDir = this.rootDir
        let _this = this
        return new Promise((resolve, reject) => {
            fs.createReadStream(path.join(rootDir, fn + 'Install.zip'))
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    var fileName = entry.path;
                    if (fileName == "Install/sketch.ino.hex") {
                        let fss = fs.createWriteStream(path.join(rootDir, 'sketch.ino.hex'))
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
                            _this.program_device(path.join(rootDir, 'sketch.ino.hex'), '0', devstr)
                            console.log("find")
                            resolve("scc")
                        })
                    } else {
                        entry.autodrain();
                    }
                })
            // x.on("end", () => {
            //     console.log("programming------------------------")
            //     // _this.program_device(path.join(rootDir,fn+'sketch.ino.hex'),'0','0')
            //     let dev_list = _this.get_devlist();
            //     let devstr = "";
            //     for (let k in dev_list) {
            //         devstr = k;
            //         break;
            //     }
            //     console.log("-----------------devstr is :" + devstr)
            //     _this.program_device(path.join(rootDir, 'sketch.ino.hex'), '0', devstr)
            //     console.log("find")
            //     resolve("scc")

            // });
        })
    }
    login(): Promise<string> {
        let fm = new FormData()
        // fm.append("username", "emmtest")
        fm.append("username", "emmtest")
        fm.append("password", "123456")
        return new Promise((resolve) => {
            this.submitForm(fm, this.linkLabAPIs["hostname"], this.linkLabAPIs["port"], this.linkLabAPIs["loginPath"], "POST").then(res => {
                // console.log(res);
                this.getIssuesData().then(back => {
                    // for (let ctn in back) {
                    //     console.log(ctn + ": " + back[ctn])
                    // }
                    resolve('scc')

                })
            })
        })
    }
    getIssuesData(): Promise<{ [key: string]: string }> {
        // return new Promise((resolve) => {
        //     this.quizDescriptiontest('1').then(() => {
        //         resolve({info:this.quizInfo,title:this.quizTitle})
        //     })
        // })
        let data = {
        }
        return new Promise((resolve) => {
            this.postData(this.linkLabAPIs["hostname"], this.linkLabAPIs["port"], this.linkLabAPIs['quizRequestPath'], data).then(x => {
                let ret: { [key: string]: string } = {}
                // console.log(x)
                if (x == null || x == undefined || x == '')
                    console.log("no return in getIssuesData")
                let entryArry = JSON.parse(x)['data']
                // console.log(entryArry)
                for (let entry of entryArry) {
                    // console.log(tmp['problem'][index]['pid'] + ": " + tmp['problem'][index]['status'])
                    this.quizInfo[entry['pid']] = entry['content']
                    this.quizTitle[entry['pid']] = entry['title']
                    // console.log(entry['pid'] + ": " + entry['title'])
                }
                // for (let tmp in this.quizInfo) {
                //     console.log(this.quizTitle[tmp] + ': ' + this.quizInfo[tmp])
                // }
                resolve(ret)
                // for (let xi in tmp)
                //     this.quizInfo[xi] = tmp[xi]
            }, (err) => console.log(err)
            )
        })
    }

    postSrcFile(fn: string): Promise<string> {
        let rootDir = this.rootDir
        let tmpPath = path.join(rootDir, fn + ".cpp")
        let b = fs.readFileSync(tmpPath)
        let fm = new FormData()
        fm.append("file", b, fn + '.cpp')
        let _this = this
        return new Promise((resolve, reject) => {
            _this.submitForm(fm,
                _this.tinyLinkAPIs["hostname"],
                _this.tinyLinkAPIs["port"],
                _this.tinyLinkAPIs["srcPostPath"],
                "POST").then(res => {
                    if (res == null || res == undefined || res == '')
                    console.log("no return in getIssuesData")
                    let tmp = JSON.parse(res)
                    console.log("scc")
                    if (tmp["message"] != 'success')
                        reject("srcFile Post failed")
                    let downloadFd = http.request({
                        method: "GET",
                        hostname: _this.tinyLinkAPIs["hostname"],
                        port: _this.tinyLinkAPIs["port"],
                        path: _this.tinyLinkAPIs["downloadHexPath"],
                        headers: {
                            Cookie: this.cookie
                        }
                    }, (mesg) => {
                        let ws = fs.createWriteStream(path.join(this.rootDir, fn + 'Install.zip'))
                        mesg.on("data", (b: Buffer) => {
                            console.log("downloading")
                            ws.write(b)
                        })
                        mesg.on("end", () => {
                            console.log("download scc")
                            ws.end()
                            this.extractHex(fn).then(() => resolve("scc"))
                        })
                    })
                    downloadFd.write("")
                    downloadFd.end()
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
                    "Cookie": this.cookie
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

}