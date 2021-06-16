import { Kubedge } from './services/edge/kubedge';
import { ProjectData } from './data_center/project_data';
import { DisplayBoardBackEnd } from './services/displayboard/displayboard';
import { UserInfo } from './data_center/user_info';
import { TinySim } from './services/tinysim/tinysim';
import { ModelTrainer } from './services/model_trainer.ts/model_trainer';
import { FileOpener } from './services/opener/file_openner';
import { OneLinkController } from './problem_controller/one_link_controller/one_link_controller';
import { LinkedgeDataService } from './services/data_service/linkedge_data_service';
import { LdcClientControllerInterface } from './services/ldc/interfaces/ldc_client_controller_interface';
import { Logger } from "./util/logger";
import { Compiler } from "./compilers/compiler";
import { Controller } from "./util/controller";
import { LOGINTYPE } from "./../common/udc-service";
import { UdcClient } from "./../common/udc-watcher";
import { UdcTerminal } from "./util/udc-terminal";
import {RunCommand} from './services/command/runcommand';
import { UdcService } from "./../common/udc-service";
import { injectable, inject } from "inversify";
import { ILogger } from "@theia/core";
import { RawProcessFactory } from "@theia/process/lib/node";
import { LinkEdgeManager } from "./util/linkedgemanger";
import { LdcShellInterface } from './services/ldc_shell/interfaces/ldc_shell_interface';
import { ProblemController } from './problem_controller/problem_controller';
import { TrainExperimentController } from './problem_controller/train_experiment_controller/train_experiment_controller';
import { OneLinkService } from './services/one_link_service/onelink';
import { ConsoleLogger } from '@theia/core/lib/common/logger-protocol';
import { TaoFactoryController } from './problem_controller/taoFactoryController/tao_factory_controller';
import { CallInfoStorer } from './services/log/call_info_storer';
import { BehaviorRecorder } from './services/behavior_recorder/behavior_recorder';
import { MultiProjectData } from './data_center/multi_project_data';
import { LdcLogger } from './services/ldc/new_ldc/new_ldc';
import { ResearchNotifier } from './services/compiler/research_notifier';
@injectable()
export class UdcServiceImpl implements UdcService {
  constructor(
    @inject(ILogger) protected readonly logger: ILogger,
    @inject(RawProcessFactory)
    protected readonly rawProcessFactory: RawProcessFactory,
    @inject(UdcTerminal) protected readonly udcTerminal: UdcTerminal,
    @inject(RunCommand) protected readonly command: RunCommand,
    @inject(Controller) protected readonly controller: Controller,
    @inject(Compiler) protected readonly compiler: Compiler,
    @inject(LinkEdgeManager)
    protected readonly linkEdgeManager: LinkEdgeManager,
    @inject(LdcClientControllerInterface) protected ldcClient: LdcClientControllerInterface,
    @inject(OneLinkService) protected readonly ols: OneLinkService,
    @inject(CallInfoStorer) readonly cis: CallInfoStorer,
    @inject(ProblemController) protected pc: ProblemController,
    @inject(LdcShellInterface) protected readonly ldcShell: LdcShellInterface,
    @inject(TrainExperimentController) protected trainExperimentController: TrainExperimentController,
    @inject(LinkedgeDataService) protected linkedgeDataService: LinkedgeDataService,
    @inject(OneLinkController) protected oneLinkController: OneLinkController,
    @inject(TaoFactoryController) protected taoFactoryController: TaoFactoryController,
    @inject(FileOpener) protected fileOpener: FileOpener,
    @inject(ModelTrainer) protected modelTrainer: ModelTrainer,
    @inject(TinySim) protected tinySim: TinySim,
    @inject(UserInfo) protected userInfo:UserInfo,
    @inject(DisplayBoardBackEnd) protected  dbb :DisplayBoardBackEnd,
    @inject(BehaviorRecorder) readonly behaviorRecorder:BehaviorRecorder,
    @inject(ProjectData) protected pData: ProjectData,
    @inject(MultiProjectData) protected mpData: MultiProjectData,
    @inject(Kubedge) readonly kubedge:Kubedge,
    @inject(LdcLogger) protected ldcLogger:LdcLogger,
    @inject(ResearchNotifier) protected rn :ResearchNotifier
  ) { }
  setExperimentName(name: string){
    this.behaviorRecorder.en=name

  }
  localBurn(pid: string,tag:boolean=false){
    this.pc.localSubmit(pid,tag);
  } 

  is_connected(): Promise<Boolean> {
    return new Promise<Boolean>((resolve) => {
      resolve(this.udcTerminal.is_connected);
    });
  }

  async initLinkedgeConfig(pid: string): Promise<boolean> {
    // return this.linkEdgeManager.initConfigDir(pid);
    return true
  }
  async connect(
    login_type: LOGINTYPE,
    model: string,
    pid: string,
    timeout: string
  ): Promise<boolean> {
    // try {
    //   let result = await this.udcTerminal.connect(
    //     login_type,
    //     model,
    //     pid,
    //     timeout
    //   );
    //   return result;
    // } catch (e) {
    //   return false;
    // }
    // this.pc.submit(pid)
    return true;
  }
  close(){
    this.kubedge.deleteNameSpace()
    this.behaviorRecorder.close()
  }
  async judge(res :string ){
    this.behaviorRecorder.judge(res)
  }
  async disconnect(): Promise<string> {
    let result = await this.ldcClient.disconnect()
    this.tinySim.disconnect()
    this.modelTrainer.disconnect()
    return result === true ? "Disconnect succeed" : "Disconnect failed";
  }

  async list_models(): Promise<Array<string>> {
    return new Promise<Array<string>>((resolve) => {
      let result = this.udcTerminal.list_models();
      resolve(result);
    });
  }

  get_devices(): Promise<{ [key: string]: number } | undefined> {
    let re = this.udcTerminal.get_devlist();
    return new Promise((resolve) => {
      resolve(re);
    });
  }

  program(
    filepath: string,
    address: string,
    devstr: string,
    pid: string
  ): Promise<Boolean> {
    return new Promise<Boolean>(() => {
      // console.log(filepath, " ", devstr);
      // let result = this.udcTerminal.program_device(filepath, address, devstr, pid);
      // resolve(result);
    });
  }

  rumcmd(devstr: string, cmdstr: string): Promise<Boolean> {
    return new Promise<Boolean>((resolve) => {
      // let result = this.udcTerminal.run_command(devstr, cmdstr);
      let result = this.command.runcommand(cmdstr);
      resolve(result);
    });
  }

  async getprojectDir():Promise<string> {
    let root = this.mpData.rootDir;
    let rootDir = this.pData.projectRootDir;
    let project = this.pData.subProjectArray[0]
    return(root + "/" + rootDir + "/" + project)
  }

  async getProjectName(): Promise<string> {
    return this.pData.projectRootDir
  }

  control(devstr: string, operation: string): Promise<Boolean> {
    return new Promise<Boolean>((resolve) => {
      let result = this.udcTerminal.control_device(devstr, operation);
      resolve(result);
    });
  }

  setClient(client: UdcClient) {
    // this.udcTerminal.setClient(client);

    this.ldcShell.setUdcClient(client)

  }
  // get_issues(): Promise<{ [key: string]: {} }> {

  async quizJudge(): Promise<string> {
    return "success";
  }

  setLdcHostandPort(ldcHost: string, ldcPort: string) {
    this.setLdcHostandPort(ldcHost, ldcPort);
  }
  // createSrcFile(filnames: string[]): void {
  //     this.udcTerminal.createSrcFile(filnames)

  // }
  train(pid: string) {
    // this.udcTerminal.train(pid);
    this.trainExperimentController.submit(pid)
  }
  virtualSubmit(pid: string) {
    // this.udcTerminal.virtualSubmit(pid);
    this.oneLinkController.submit(pid)

  }

  postFreeCodingFile(pid: string): void {
    this.pc.submit(pid)
    // this.controller.processFreeCoding(pid);
  }
  postSrcFile(pid: string): void {
    this.pc.submit(pid)
  }
  openPidFile(pid: string): void {
    this.udcTerminal.openPidFile(pid);
  }
  openFile(pid: string, filename: string) {
    this.fileOpener.openFile(filename)
  }
  setCookie(cookie: string): boolean {
  this.userInfo.cookie=cookie
  return this.udcTerminal.setCookie(cookie);
  }
  outputResult(res: string, types?: string) {
    this.udcTerminal.outputResult(res);
  }
  storeState(data: string) {
    this.udcTerminal.storeState(data);
  }
  getState(type: string): Promise<string> {
    Logger.info(" in impl type is :" + type);
    return this.udcTerminal.getState(type);
  }
  setQueue() {
    this.udcTerminal.setQueue();
  }
  setPidInfos(
    pid: string,
    content: {
      loginType: string;
      timeout: string;
      model: string;
      waitID: string;
      fns: string;
      dirName: string;
      projectName: string | undefined;
      deviceType: string,
      boardType: string,
      compilerType: string | undefined;
      deviceRole?: string[] | undefined;
    }
  ) {
    this.udcTerminal.setPidInfos(pid, content);
  }
  async initPidQueueInfo(infos: string): Promise<string> {
    this.pc.init(infos)
    // return this.udcTerminal.initPidQueueInfo(infos);
    return "scc"
  }
  setTinyLink(name: string, passwd: string, uid: string): void {
    this.udcTerminal.setTinyLink(name, passwd, uid);
    this.userInfo.username=uid;
    this.userInfo.passwd=passwd;
    // this.userInfo.tinyname=name;
    // this.cis.setUser(uid);
  }
  config(): any {
    this.udcTerminal.config();
  }
  programSingleFile(pidAndFn: string) {
    this.controller.processSingleFile(pidAndFn);
  }
  postSimFile(pid: string) {
    this.udcTerminal.postSimFile(pid);
  }
  continueExe() {
    Logger.info("continue");
    this.controller.events.emit("devfw");
  }
  terminateExe() {
    Logger.info("terminate");
    this.controller.events.emit("simrt");
  }
  literalAnalysis(pid: string) {
    this.udcTerminal.literalAnalysis(pid);
  }
  async linkEdgeConnect(pid: string, threeTuple: any) {
    // this.linkEdgeManager.processLinkEdgeConnect(pid, threeTuple);
    return true;
  }
  async linkEdgeDisconnect() {
    return true;
  }
  async linkEdgeStart() {
    return true;
  }
  async linkEdgeStop() {
    return true;
  }
  async getLinkEdgeDevicesInfo(pid: string) {
    // return this.udcTerminal.getLinkEdgeDevicesInfo(pid);
    return ""
  }
  async addLinkEdgeProject(pid: string, deviceInfo: any) {
    // return !!(await this.linkEdgeManager.addProjectToLinkEdge(pid, deviceInfo));
    return true
  }
  async developLinkEdgeProject(pid: string, indexStr: string) {
    return true
    // return !!(await this.linkEdgeManager.developLinkEdgeProject(pid, indexStr));
  }
  async openLinkEdgeProject() {
    return true;
  }
  async removeLinkEdgeProject() {
    return true;
  }
  async shutDownLog() {
    return true;
  }
  async remove(pid: string, index: string) {
    return this.linkEdgeManager.removeProjectInLinkEdge(pid, index);
  }
  async createOnelinkProject(
    projectName: string,
    pid: string
  ): Promise<boolean> {
    return this.ols.createProject(projectName, pid);
  }
  openDevice() {
    this.ols.openDevice();
  }
  openMobile() {
    this.ols.openMobile();
  }
  compileMobile(): Promise<boolean> {
    return this.ols.complileMobile();
  }
  compileDevice(): Promise<boolean> {
    return this.ols.compileDevice();
  }
  openConfigFile(pid: string) {
    this.linkEdgeManager.openConfigFile(pid);
  }
  getIotId() {
    return this.linkedgeDataService.getIotId();
  }
  async delProject(pid: string): Promise<boolean> {
    return true;
    // return this.udcTerminal.delProject(pid);
  }
  tinyEdgeCompile(pid: string): Promise<string> {
    return this.udcTerminal.tinyEdgeUpload(pid);
  }
  async processDisplaySubmit(pid: string, info: string) {
    if (pid == "") await this.dbb.init(info);
    else{
        this.localSubmit(pid)
    }
    // await this.controller.processDisplaySubmit(pid, info);
  }
  async initDisplayBoard(info: string) {
    // await this.pc.init(info)
    await this.dbb.init(info)
    // await this.udcTerminal.initDisplayBoard(info);
  }
  storeCallInfo(
    time: string,
    info: string,
    api: string,
    serverity: number = 0
  ) {
    this.cis.storeCallInfoLatter(time, info, api, serverity);
  }
  // submitCode(pid: string, isOpened: boolean){
  //   //this.udcTerminal.submitCode(pid);
  //   console.log("submit code!");
  //   this.taoFactoryController.submitCode(pid, isOpened);
  // }

  submitAlgorithm(pid: string, currentId:string){
    //this.udcTerminal.submitAlgorithm(pid, currentId);
    console.log("submit algorithm!");
    this.taoFactoryController.submitAlgorithm(pid, currentId, this.userInfo.username);
  }
  localSubmit(pid:string){
    this.pc.localSubmit(pid)
  }
  //发送信息到LDC后端
  serialPortInput(message:string){
    this.ldcLogger.serialPortInput(message);
  }
  notifyResearcher(){
    this.rn.notify()
  }
}
