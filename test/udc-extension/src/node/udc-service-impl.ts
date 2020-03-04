import { Logger } from './util/logger';
import { Compiler } from './compilers/compiler';
import { Controller } from './util/controller';
import { LOGINTYPE } from './../common/udc-service';
import { UdcClient } from './../common/udc-watcher';
import { UdcTerminal } from './util/udc-terminal';
import { UdcService } from './../common/udc-service';
import { injectable, inject, } from "inversify";
import { ILogger } from '@theia/core';
import { RawProcessFactory } from '@theia/process/lib/node';
import { LinkEdgeManager } from './util/linkedgemanger';
import { OnelinkService } from './util/onelink';
@injectable()
export class UdcServiceImpl implements UdcService {

    constructor(
        @inject(ILogger) protected readonly logger: ILogger,
        @inject(RawProcessFactory) protected readonly rawProcessFactory: RawProcessFactory,
        @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal,
        @inject(Controller) protected readonly controller: Controller,
        @inject(Compiler) protected readonly compiler: Compiler,
        @inject(LinkEdgeManager) protected readonly linkEdgeManager: LinkEdgeManager,
        @inject(OnelinkService) protected readonly ols:OnelinkService
    ) {
    }


    is_connected(): Promise<Boolean> {
        return new Promise<Boolean>((resolve, rejects) => {
            resolve(this.udcTerminal.is_connected);
        });
    }

    initLinkedgeConfig(pid:string):Promise<boolean>{
     return this.linkEdgeManager.initConfigDir(pid)    
    }
    async connect(login_type: LOGINTYPE, model: string, pid: string, timeout: string): Promise<boolean> {
        try {
            let result = await this.udcTerminal.connect(login_type, model, pid, timeout);
            return result
        } catch (e) {
            return false;
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


    program(filepath: string, address: string, devstr: string, pid: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, rejects) => {
            // console.log(filepath, " ", devstr);
            // let result = this.udcTerminal.program_device(filepath, address, devstr, pid);
            // resolve(result);
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
    train(pid: string) {
        this.udcTerminal.train(pid)
    }
    virtualSubmit(pid: string) {
        this.udcTerminal.virtualSubmit(pid)
    }

    postFreeCodingFile(pid: string): void {
        this.controller.processFreeCoding(pid);
    }
    postSrcFile(pid: string): void {
        this.controller.processIssue(pid)
    }
    openPidFile(pid: string): void {
        this.udcTerminal.openPidFile(pid)
    }
    openFile(pid: string, filename: string) {
        this.udcTerminal.openFile(pid, filename)
    }
    setCookie(cookie: string): boolean {
        return this.udcTerminal.setCookie(cookie)
    }
    outputResult(res: string, types?: string) {
        this.udcTerminal.outputResult(res)
    }
    storeState(data: string) {
        this.udcTerminal.storeState(data)
    }
    getState(type: string): Promise<string> {
        Logger.info(" in impl type is :" + type)
        return this.udcTerminal.getState(type)
    }
    setQueue() {
        this.udcTerminal.setQueue()
    }
    setPidInfos(pid: string, content: {
        loginType: string, timeout: string, model: string, waitID: string, fns: string, dirName: string,
        projectName: string | undefined, boardType: string | undefined, deviceRole?: string[] | undefined
    }) {
        this.udcTerminal.setPidInfos(pid, content)
    }
    initPidQueueInfo(infos: string): Promise<string> {
        return this.udcTerminal.initPidQueueInfo(infos)
    }
    setTinyLink(name: string, passwd: string): void {
        this.udcTerminal.setTinyLink(name, passwd)
    }
    config(): any {
        this.udcTerminal.config()
    }
    programSingleFile(pidAndFn: string) {
        this.controller.processSingleFile(pidAndFn)
    }
    postSimFile(pid: string) {
        this.udcTerminal.postSimFile(pid)
    }
    continueExe() {
        Logger.info("continue")
        this.controller.events.emit("devfw")
    }
    terminateExe() {
        Logger.info("terminate")
        this.controller.events.emit("simrt")
    }
    literalAnalysis(pid: string) {
        this.udcTerminal.literalAnalysis(pid)
    }
    async linkEdgeConnect(pid: string, threeTuple: any) {
        this.linkEdgeManager.processLinkEdgeConnect(pid, threeTuple)
        return true
    }
    async linkEdgeDisconnect(pid: string) {
        return true
    }
    async linkEdgeStart(pid: string) {
        return true
    }
    async linkEdgeStop(pid: string) {
        return true
    }
    async getLinkEdgeDevicesInfo(pid: string) {
        return this.udcTerminal.getLinkEdgeDevicesInfo(pid)
    }
    async addLinkEdgeProject(pid: string, deviceInfo: any) {
        return !!await this.linkEdgeManager.addProjectToLinkEdge(pid, deviceInfo)
    }
    async developLinkEdgeProject(pid: string, indexStr: string) {
        return !!await this.linkEdgeManager.developLinkEdgeProject(pid, indexStr)
    }
    async openLinkEdgeProject(pid: string, index: string) {
        return true
    }
    async removeLinkEdgeProject(pid: string, index: string) {
        return true
    }
    async shutDownLog(pid: string, index: string) {
        return true
    }
    async remove(pid: string, index: string) {
        return this.linkEdgeManager.removeProjectInLinkEdge(pid, index)
    }
    async createOnelinkProject(projectName:string,pid:string):Promise<boolean>{
    return this.ols.createProject(projectName,pid)
    }
    openDevice() {
        this.ols.openDevice()
    } 
    openMobile() {
        this.ols.openMobile()
    }
    compileMobile() :Promise<boolean>{
      return  this.ols.complileMobile()
    }
    compileDevice():Promise<boolean>{
        return this.ols.compileDevice()
    }
    openConfigFile(pid:string){
        this.linkEdgeManager.openConfigFile(pid)
    }
    getIotId(){
       return this.linkEdgeManager.getIotId()
    }
}