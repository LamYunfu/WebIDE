import { HalfPackProcess } from './half-pkt-process';
import * as path from 'path'
// import { certificate } from './../common/udc-config';
import { UdcClient } from '../../common/udc-watcher';
import { injectable, inject } from "inversify";
// import * as tls from 'tls';
import * as net from 'net'
import * as fs from 'fs-extra';
import { Packet } from "./packet";
import * as events from "events";
// import { networkInterfaces } from 'os';
import { LOGINTYPE } from '../../common/udc-service';
import { Logger } from './logger'
// import { networkInterfaces } from 'os';
@injectable()
/*
存储一些数据，以及ldc相关指令操作
*/
export class UdcTerminal {
    userid: string = ""
    cookie: string = ""
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
    hpp: HalfPackProcess
    dataStorage: { [key: string]: {} } = {}
    programState: { [key: string]: { [key: string]: string } } = {}
    pidQueueInfo: { [pid: string]: { loginType: string, timeout: string, model: string, waitID: string, fns: string, dirName: string } } = {}
    cuurentPid: string = ``
    rootDir: string = "/home/project"
    tinyLinkInfo: { name: string, passwd: string } = { name: "", passwd: "" }


    constructor(
        @inject(Packet) protected readonly pkt: Packet,
    ) {
        this.event = new events.EventEmitter();
        this.hpp = new HalfPackProcess()
        Logger.val("current path:" + process.cwd())
    }
    creatSrcFile(fnJSON: string, dirName: string) {
        Logger.info(`FNJSON:${fnJSON}`)
        let fn = JSON.parse(fnJSON)
        let rootdir = this.rootDir
        fs.exists(path.join(rootdir, dirName), (res) => {
            if (!res) {
                fs.mkdir(path.join(rootdir, dirName), (err) => {
                    Logger.info(err)
                    for (let i of fn) {
                        let x: string[] = i.split(".")
                        let tmpPath = ""
                        if (x.length == 1)
                            tmpPath = path.join(rootdir, dirName, i + ".cpp")
                        else
                            tmpPath = path.join(rootdir, dirName, i)
                        fs.exists(tmpPath, (res) => {
                            if (!res)
                                fs.writeFile(tmpPath, '', {}, (err) => { if (err != null) console.log(err) })
                        })
                    }
                })
            }
            else
                for (let i of fn) {
                    let x: string[] = i.split(".")
                    let tmpPath = ""
                    if (x.length == 1)
                        tmpPath = path.join(rootdir, dirName, i + ".cpp")
                    else
                        tmpPath = path.join(rootdir, dirName, i)
                    fs.exists(tmpPath, (res) => {
                        if (!res)
                            fs.writeFile(tmpPath, '', {}, (err) => { if (err != null) console.log(err) })
                    })
                }
        })
    }
    initPidQueueInfo(infos: string): Promise<string> {
        Logger.info(infos, 'info')
        this.pidQueueInfo = JSON.parse(infos)
        for (let index in this.pidQueueInfo) {
            let { dirName, fns } = this.pidQueueInfo[index]
            this.creatSrcFile(fns, dirName)

        }
        return new Promise((res) => {
            res("scc")
        })
    }
    setPidInfos(pid: string, content: { loginType: string, timeout: string, model: string, waitID: string, fns: string, dirName: string }) {
        this.pidQueueInfo[pid] = content
    }
    getPidInfos(pid: string) {
        Logger.info(JSON.stringify(this.pidQueueInfo[pid]), 'pidq')
        return this.pidQueueInfo[pid]
    }
    setClient(client: UdcClient) {
        this.udcClient = client;
    }

    //74dfbfad34520000
    //901DE50A2D2E055C
    //901DE50A2D2E0000
    // get uuid(): string {
    //     let uuid: string = '';
    //     let interfaces = networkInterfaces();
    //     for (let intf in interfaces) {
    //         for (let i in interfaces[intf]) {
    //             if (interfaces[intf][i].family === 'IPv6') { continue; }
    //             if (interfaces[intf][i].address === '127.0.0.1') { break; }
    //             uuid = interfaces[intf][i].mac.replace(/:/g, '') + '0000'
    //             break;
    //         }
    //     }
    //     Logger.info(`uuid:${uuid}`)
    //     return uuid;
    // }
    get uuid(): string {
        if (this.userid == "")
            this.userid = (this.cookie.slice(20, 36)).toLowerCase()
        Logger.info(`uuid:${this.userid}`)
        return this.userid
    }

    login_and_get_server(login_type: LOGINTYPE, model: string): Promise<Array<any>> {
        // let options = {
        //     ca: certificate,
        //     rejectUnauthorized: false,
        //     // requestCert: true,
        // }
        let uuid = this.uuid
        let _this = this
        return new Promise(function (resolve, reject) {
            // let server_ip = "118.31.76.36"
            // let server_port = 2000
            let server_ip = "47.97.253.23"
            let server_port = 5000
            // let server_ip = "192.168.1.233"
            // let server_port = 2000
            // let ctrFd = tls.connect(server_port, server_ip, options, () => {
            let ctrFd = net.connect(server_port, server_ip, () => {
                Logger.info("connect scc")
            })
            ctrFd.on('error', () => {
                reject('error')
            });
            ctrFd.on('close', () => {
                Logger.info('Connection to Udc Server Closed!');
            });
            ctrFd.on("data", (data: Buffer) => {
                let d = data.toString('utf8').substr(1, data.length).split(',')
                Logger.val("d:" + d.slice(2, d.length))
                resolve(d.slice(2, d.length))
            });
            // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
            // let cm = '{ALGI,00035,terminal,74dfbfad34520000,adhoc,any}'
            // let cm = '{ALGI,00035,terminal,' + uuid + ',adhoc,any}'
            let cm = ""
            Logger.val(`lenght is :` + (uuid + `${login_type},${model}}`).length + 9)
            cm = _this.pkt.construct(Packet.ACCESS_LOGIN, `terminal,${uuid},${login_type},${model}`)
            Logger.val(`login pkt is :` + cm)
            // switch (login_type) {
            //     case LOGINTYPE.GROUP: cm = '{ALGI,00040,terminal,' + uuid + `,${login_type},${model}}`; break
            //     case LOGINTYPE.ADHOC: cm = '{ALGI,00035,terminal,' + uuid + ',adhoc,any}'; break
            //     case LOGINTYPE.FIXED: cm = '{ALGI,00035,terminal,' + uuid + ',fixed,any}'; break

            // }
            ctrFd.write(cm)
            ctrFd.setTimeout(1000);
            Logger.info("Login finish")
        })
    }


    async connect_to_server(server_ip: string, server_port: number, certificate: string, pid: string): Promise<string> {
        // let options = {
        //     ca: certificate,
        //     rejectUnauthorized: false,
        //     requestCert: false,
        // }
        Logger.val("serverPort: " + server_port)
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
                Logger.info('Connection to Udc Server Closed!');
            });
            Logger.val("server pid:" + pid)
            // _this.udcServerClient.on('data', (data: Buffer) => _this.onUdcServerData(data, pid));
            _this.udcServerClient.on('data', (data: Buffer) => {
                Logger.info("hpp recived <<<<<<<<<<:" + data.toString('utf8'))
                _this.hpp.putData(data)
            });
            _this.hpp.on("data", (data) => {
                Logger.info("hpp  processed >>>>>>>>>>:" + data.toString('utf8'))
                _this.onUdcServerData(data, pid)
            })

            _this.udcServerClient.setTimeout(10000);
            _this.udcServerClient.on('timeout', () => {
                _this.send_packet(Packet.HEARTBEAT, '');
            })
        })
    }


    onUdcServerData = (data: Buffer, pid: string) => {
        // let [type, , value] = this.pkt.parse(data.toString('ascii'));
        let [type, , value] = this.pkt.parse(data.toString('utf8'));
        Logger.info(`Received: type=${type}  value= ${value}`);

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
            this.outputResult(`allocated devs ${JSON.stringify(this.dev_list)}`)
            if (this.udcClient) {
                this.udcClient.onDeviceList(new_dev_list)
            }
        } else if (type === Packet.DEVICE_STATUS) {
        } else if (type === Packet.TERMINAL_LOGIN) {
            if (value === 'success') {
                Logger.info('server login success');
            } else {
                Logger.info('login failed retrying ...');
                this.connect(this.login_type, this.model, pid)
            }
        } else if (type === Packet.CMD_DONE || type === Packet.CMD_ERROR) {
            Logger.info(data.toString('utf8'));
            this.cmd_excute_return = value;
            this.cmd_excute_state = (type === Packet.CMD_DONE ? 'done' : 'error');
            this.events.emit('cmd-response');
        } else if (type == Packet.DEVICE_LOG) {
            this.outputResult(value.toString().split(':')[2])
        } else if (type == Packet.DEVICE_PROGRAM_BEGIN) {
            Logger.val(value, 'DPBN')
            let tmp = value.split(":")
            Logger.info(`${tmp[0]}::${tmp[1]}::${tmp[2]}`)
            this.programState[tmp[0]] = {}
            this.programState[tmp[0]]["waitState"] = `waitting`
            this.programState[tmp[0]]['programable'] = `true`
            this.programState[tmp[0]]['clientID'] = tmp[1]
            this.programState[tmp[0]]["devicePort"] = tmp[2]
            this.events.emit('enterQueue')
        } else if (type == Packet.DEVICE_PROGRAM_QUEUE) {
            Logger.val(value, 'DPGQ')
            // let tmp = value.split(",")
            // Logger.info(`${tmp[0]}::${tmp[1]}::${tmp[2]}`)
            // this.programState[tmp[0]] = {}
            // this.programState[tmp[0]]["waitState"] = `waitting`
            // this.programState[tmp[0]]['programable'] = `true`
            // this.programState[tmp[0]]['clientID'] = tmp[1]
            // this.programState[tmp[0]]["devicePort"] = tmp[2]
            // this.events.emit('enterQueue')
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
    setQueue() {
        let _this = this
        if (this.cuurentPid == '') {
            this.outputResult("please connect dev,there is no pid!")
            return
        }
        if (this.is_connected) {
            this.disconnect().then(() => {
                _this.connect("queue", this.pidQueueInfo[this.cuurentPid].model, this.cuurentPid, this.pidQueueInfo[this.cuurentPid].timeout)
            })
        }
        else
            this.connect("queue", this.pidQueueInfo[this.cuurentPid].model, this.cuurentPid, this.pidQueueInfo[this.cuurentPid].timeout)
    }
    storeState(data: string) {
        Logger.info(`data:${data}`)
        let tmp = JSON.parse(data)
        for (let index in tmp)
            this.dataStorage[index] = tmp[index]


    }
    // 39d16c10bbef0000
    getState(type: string): Promise<string> {
        Logger.info(`type info :${type}`, "type")
        let tmp: { [key: string]: {} } = {}
        tmp[type] = this.dataStorage[type]
        return new Promise(res => res(JSON.stringify(tmp)))
    }
    async connect(loginType: string, model: string, pid: string, timeout: string = `20`): Promise<Boolean | string> {
        // loginType = LOGINTYPE.QUEUE
        // model = `alios-esp32`
        Logger.val(`timeout: ${timeout}`)
        this.pidQueueInfo[pid] = {
            ...  this.pidQueueInfo[pid],
            // fns: JSON.stringify(["helloworld", "helloworld", 'README.md', 'ucube.py']),
            // dirName: "helloworld",
            loginType: loginType,
            model: model,
            waitID: (Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) + Math.pow(10, 15)).toString()
        }
        this.cuurentPid = pid
        let login_type = LOGINTYPE.QUEUE
        // model = `tinylink_lora`

        switch (loginType) {
            case "fixed": login_type = LOGINTYPE.FIXED; break
            case "adhoc": login_type = LOGINTYPE.ADHOC; break
            case "group": login_type = LOGINTYPE.GROUP; break
            case "queue": login_type = LOGINTYPE.QUEUE; break

            default: Logger.err(`Error loginType:${loginType}`)
        }
        this.login_type = login_type
        Logger.val(`>>>>>>>>>login type :${login_type} model :${model}`)
        Logger.val(">>>>>>>>>pid" + pid)
        let rets = await this.login_and_get_server(login_type, model);
        if (rets === []) { return false; }
        let [re, server_ip, server_port, token, certificate] = rets;
        if (re != 'success') { return false; }
        this.outputResult('connect to controller success, server ip is ' + server_ip)
        let result = await this.connect_to_server(server_ip, server_port, certificate, pid);
        Logger.val("result-----------------------------" + result)
        if (result !== 'success') return false;
        this.outputResult('connect to server success')
        await this.send_packet(Packet.packet_type.TERMINAL_LOGIN, `${this.uuid},${token},${pid}`)//modifiy,timeout/
        // await this.AC.postNameAndType("helloworld", "esp32devkitc")
        return true;

    }


    async disconnect(): Promise<Boolean> {
        if (this.udcServerClient === null) {
            return true;
        }
        this.hpp.removeAllListeners("data")
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

    async wait_response(waitID: string, timeout: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.events.removeAllListeners('enterQueue');
                Logger.info("wait for queue system timeOut")
                this.programState[waitID] = {}
                this.programState[waitID]["programable"] = "false"
                resolve();
            }, timeout);
            this.events.once('enterQueue', () => {
                this.programState[waitID]["waitState"] = "true"
                this.programState[waitID]["programable"] = "true"
                this.events.removeAllListeners('enterQueue');
                resolve();
            });
        });
    }
    // async program_device_queue(filepath: string, address: string, devstr: string, model: string = "tinylink_platform_1", waitID: string = "1234567890123456", timeout: string = "20"): Promise<Boolean> {
    async program_device_queue(filepath: string, address: string, devstr: string, pid: string): Promise<Boolean> {
        // let content =this.pkt.construct(Packet.DEVICE_WAIT, `${model}:${waitID}:${timeout}`)
        // let pid = this.cuurentPid
        let model = this.pidQueueInfo[pid].model
        let waitID = this.pidQueueInfo[pid].waitID
        let timeout = this.pidQueueInfo[pid].timeout
        this.send_packet(Packet.DEVICE_WAIT, `${model}:${waitID}:${timeout}`)
        await this.wait_response(waitID, 20000)
        // await this.wait_cmd_excute_done(270000);
        if (this.programState[waitID]['programable'] == 'true') {
            Logger.info("enter in queue scc", ' ^.^> ')
            let result = await this.send_file_to_client(filepath, `${this.programState[waitID].clientID},${this.programState[waitID].devicePort}`)
            if (result == false) {
                Logger.err("sending file err")
                return false
            }
            let content = `${this.programState[waitID].clientID},${this.programState[waitID].devicePort},0,${await this.pkt.hash_of_file(filepath)},${waitID}`
            Logger.info(content,"content:")
            this.send_packet(Packet.DEVICE_PROGRAM_QUEUE, content)
            await this.wait_cmd_excute_done(270000);
        }
        else {
            Logger.info('enter in queue failed', ' T.T ')
            return false
        }
        return true
    }
    async program_device(filepath: string, address: string, devstr: string, pid: string): Promise<Boolean> {
        let send_result = await this.send_file_to_client(filepath, devstr);
        if (send_result === false) {
            return false;
        }
        this.outputResult('send hex file to LDC success')
        let content = `${devstr},${address},${await this.pkt.hash_of_file(filepath)},${pid}`
        this.send_packet(Packet.DEVICE_PROGRAM, content);
        await this.wait_cmd_excute_done(270000);
        if (this.cmd_excute_state === 'done') {
            this.outputResult('program success')
        }
        else {
            this.outputResult('program fail')
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
            Logger.info(`Packet.FILE_BEGIN:${Packet.FILE_BEGIN},content:${content}`)
            this.send_packet(Packet.FILE_BEGIN, content);
            await this.wait_cmd_excute_done(2000);
            if (this.cmd_excute_state === "timeout") {
                Logger.err("file send timeout")
                retry--;
                continue;
            }
            if (this.cmd_excute_return === "busy") {
                Logger.err("file send busy")
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
        // Logger.info(fileBuffer.slice(0, 8).toString("hex"), "file buff:")
        // return false
        let seq = 0;
        while (seq * 8192 < fileBuffer.length) {
            let header = `${devstr}:${filehash}:${seq}:`;
            let end = (seq + 1) * 8192;
            if (end > fileBuffer.length) {
                end = fileBuffer.length;
            }
            retry = 4;
            while (retry > 0) {
                Logger.info("sending data");
                this.send_packet(Packet.FILE_DATA, header + fileBuffer.slice(seq * 8192, end).toString('hex'));
                await this.wait_cmd_excute_done(2000);
                if (this.cmd_excute_return === null) {
                    Logger.info("cmd retuen null");

                    retry--;
                    continue;
                } else if (this.cmd_excute_return != 'ok') {
                    Logger.info("cmd not ok");
                    return false;
                }
                break;
            }
            if (retry === 0) {
                return false;
            }
            seq++;
        }
        // while (seq * 1024 < fileBuffer.length) {
        //     Logger.info(seq, "seq:")
        //     let header = `${devstr}:${filehash}:${seq}:`;
        //     let end = (seq + 1) * 1024;
        //     if (end > fileBuffer.length) {
        //         end = fileBuffer.length;
        //     }
        //     retry = 4;
        //     while (retry > 0) {
        //         Logger.info("sending data");
        //         // this.send_packet(Packet.FILE_DATA, header + fileBuffer.slice(seq * 1024, end).toString('ascii'));
        //         this.send_packet(Packet.FILE_DATA, header + fileBuffer.slice(seq * 1024, end).toString("ascii"));
        //         await this.wait_cmd_excute_done(2000);
        //         if (this.cmd_excute_return === null) {
        //             Logger.info("cmd retuen null");

        //             retry--;
        //             continue;
        //         } else if (this.cmd_excute_return != 'ok') {
        //             Logger.info("cmd not ok");
        //             return false;
        //         }
        //         break;
        //     }
        //     if (retry === 0) {
        //         return false;
        //     }
        //     seq++;
        // }
        content = `${devstr}:${filehash}:${filename}`;
        retry = 4;
        while (retry > 0) {
            this.send_packet(Packet.FILE_END, content);
            await this.wait_cmd_excute_done(2000);
            if (this.cmd_excute_return === null) {
                retry--;
                Logger.err("command return null");
                continue;
            } else if (this.cmd_excute_return != 'ok') {
                Logger.err("not ok <<<<<<<<<<<<<<<<<,");
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
        //     Logger.log(this.udcServerClient)
        // Logger.log("---------------------type right: "+type+content)

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
        this.udcClient && this.udcClient.OnDeviceLog("::" + res)
    }
    config() {
        this.udcClient && this.udcClient.onConfigLog(this.tinyLinkInfo)
    }
    setTinyLink(name: string, passwd: string): void {
        this.tinyLinkInfo.name = name
        this.tinyLinkInfo.passwd = passwd

        console.log(JSON.stringify(this.tinyLinkInfo) + ".........................................")
    }

}