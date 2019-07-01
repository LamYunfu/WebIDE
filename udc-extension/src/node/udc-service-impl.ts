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

    async connect(login_type: LOGINTYPE, model: string): Promise<string> {
        try {
            let result = await this.udcTerminal.connect(login_type, model);
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
    judge(filepath: string, address: string, devstr: string, token: string): Promise<Boolean> {
        return this.udcTerminal.judge(filepath, address, devstr, token)

    }
    get_quiz_token(quizNo: string): boolean {
        return this.udcTerminal.get_quiz_token(quizNo)
    }
    get_quiz_status(quiztoken: string): void {
        return this.udcTerminal.get_quiz_status(quiztoken)
    }
    getToken(): string {
        return this.udcTerminal.getToken()
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
    get_issues(): Promise<string> {
        // let x: { [key: string]: {} } = {}
        // x = {
        //     title: ["spi", "mqtt", "uart"],
        //     info: ["有关spi", "有关mqtt", "有关uart"]
        // }
        // return new Promise((resolve) => resolve(x))
        return this.udcTerminal.getIssues()
    }
    async quizJudge(host: string, port: string, pid: string): Promise<string> {
        return 'success'
    }
    async queryStatus(issueNmuList: string): Promise<{ [key: string]: string }> {
        // return{
        //     1:"判题",
        //     2:"烧写",
        //     0:"编码"
        // }
        return this.udcTerminal.queryStatus(JSON.parse(issueNmuList))
        // return this.udcTerminal.queryStatus(issueNmuList)
    }
    setJudgeHostandPort(judgeHost: string, judgePort: string) {
        this.udcTerminal.setJudgeHostandPort(judgeHost, judgePort)
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
    postSrcFile(fn:string):void{
        this.udcTerminal.postSrcFile(fn)
    }
}