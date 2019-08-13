import { LOGINTYPE } from './../common/udc-service';
import { UdcClient } from './../common/udc-watcher';
import { UdcTerminal } from './udc-terminal';
import { UdcService } from './../common/udc-service';
import { injectable, inject } from "inversify";
import { ILogger } from '@theia/core';
import { RawProcessFactory } from '@theia/process/lib/node';
@injectable()
export class UdcServiceImpl implements UdcService {
    constructor(
        @inject(ILogger) protected readonly logger: ILogger,
        @inject(RawProcessFactory) protected readonly rawProcessFactory: RawProcessFactory,
        @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal,
    ) {
    }


    is_connected(): Promise<Boolean> {
        return new Promise<Boolean>((resolve, rejects) => {
            resolve(this.udcTerminal.is_connected);
        });
    }


    async connect(login_type: LOGINTYPE, model: string, pid: string,timeout:string): Promise<string> {
        try {
            let result = await this.udcTerminal.connect(login_type, model, pid,timeout);
            if (result === true) {
                return "连接成功"
            } else {
                return "连接失败";
            }
        } catch (e) {
            return e;
        }
    }


    async disconnect(): Promise<string> {
        let result = await this.udcTerminal.disconnect();
        return (result === true ? 'Disconnect succeed' : 'Disconnect failed')
    }


    async list_models(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, rejects) => {
            let result = this.udcTerminal.list_models();
            resolve(result);
        });
    }


    get_devices(): Promise<{ [key: string]: number } | undefined> {
        let re = this.udcTerminal.get_devlist();
        return new Promise((resolve, reject) => {
            resolve(re)
        })
    }


    program(filepath: string, address: string, devstr: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, rejects) => {
            // console.log(filepath, " ", devstr);
            let result = this.udcTerminal.program_device(filepath, address, devstr);
            resolve(result);
        });
    }


    rumcmd(devstr: string, cmdstr: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, rejects) => {
            let result = this.udcTerminal.run_command(devstr, cmdstr);
            resolve(result);
        });
    }

    control(devstr: string, operation: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, rejects) => {
            let result = this.udcTerminal.control_device(devstr, operation);
            resolve(result);
        });
    }


    setClient(client: UdcClient) {
        this.udcTerminal.setClient(client);
    }
    // get_issues(): Promise<{ [key: string]: {} }> {


    async quizJudge(host: string, port: string, pid: string): Promise<string> {
        return 'success'
    }


    setLdcHostandPort(ldcHost: string, ldcPort: string) {
        this.setLdcHostandPort(ldcHost, ldcPort)
    }
    // createSrcFile(filnames: string[]): void {
    //     this.udcTerminal.createSrcFile(filnames)

    // }


    createSrcFile(filnames: string): void {
        this.udcTerminal.createSrcFile(filnames)

    }


    postSrcFile(fn: string): void {
        this.udcTerminal.postSrcFile(fn)
    }


    setCookie(cookie: string): boolean {
        return this.udcTerminal.setCookie(cookie)
    }


    outputResult(res: string) {
        this.udcTerminal.outputResult(res)
    }
    storeState(data: string) {
        this.udcTerminal.storeState(data)
    }
    getState(type: string): Promise<string> {
        return this.udcTerminal.getState(type)
    }
    setQueue() {
        this.udcTerminal.setQueue()
    }
}