import { UserInfo } from './../data_center/user_info';
import { Kubedge } from './../services/edge/kubedge';
import { TrainDataService } from './../services/data_service/train_data_service';
import { EventDefinition } from './../services/tools/event_definition';
import { LdcData } from '../data_center/ldc_data';
import { QueryService } from './../services/query_service/query_service';
import { FreeCodingDataService } from './../services/data_service/freecoding_data_service';
import { LdcClientControllerInterface } from './../services/ldc/interfaces/ldc_client_controller_interface';
import { EventCenter } from './../services/tools/event_center';
import { FileTemplate } from './../services/file_template/file_template';
import { FileOpener } from './../services/opener/file_openner';
import { LdcShellInterface } from './../services/ldc_shell/interfaces/ldc_shell_interface';
import { DistributedCompiler } from './../services/compiler/ds_compiler';
import { ProjectData } from '../data_center/project_data';
import { DataService } from './../services/data_service/data_service';
import { injectable, inject } from "inversify";
import { ExperimentController } from './experiment_controller/experiment_controller';
import { MultiProjectData } from '../data_center/multi_project_data';
import { Differ } from '../services/diff/diff';
import * as Process from "child_process"
import * as path from "path"
import { BehaviorRecorder } from '../services/behavior_recorder/behavior_recorder';
@injectable()
export class ProblemController {
    private _lock: boolean = false
    constructor(@inject(DataService) protected dataService: DataService,
        @inject(MultiProjectData) protected mpData: MultiProjectData,
        @inject(DataService) protected dService: DataService,
        @inject(ProjectData) protected pData: ProjectData,
        @inject(DistributedCompiler) protected dc: DistributedCompiler,
        @inject(ExperimentController) protected experimentController: ExperimentController,
        @inject(FileOpener) protected fileOpener: FileOpener,
        @inject(FileTemplate) protected fileTemplate: FileTemplate,
        @inject(LdcClientControllerInterface) protected lcc: LdcClientControllerInterface,
        @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
        @inject(FreeCodingDataService) protected freeCodingDataService: FreeCodingDataService,
        @inject(EventCenter) protected eventCenter: EventCenter,
        @inject(QueryService) protected queryService: QueryService,
        @inject(EventDefinition) protected eventDefinition: EventDefinition,
        @inject(TrainDataService) protected trainDataService: TrainDataService,
        @inject(LdcData) protected ldd: LdcData,
        @inject(Differ) protected differ: Differ,
        @inject(BehaviorRecorder) readonly behaviorRecorder:BehaviorRecorder,
        @inject(Kubedge) readonly kubedge:Kubedge) {
    }
    async init(info: string) {
        console.log("---init problem---")
        console.log("在problem controller里面传入进来的数据是：" + info);
        //将info里面的数据解析出来存储到全局变量multiProjectData里面
        await this.dataService.initDataMapFromFrontEnd(info)
        //将multiProjectData里面属于ldc的部分给剥离出来，存放到ldcData里面
        await this.dataService.copyLdcDataFromData()
        //在本地创建实验的文件，请求模板服务器获取文件内容
        await this.fileTemplate.buildAllProjects()
        await this.freeCodingDataService.parseAllData()
        await this.trainDataService.parseAllData()
        await this.fileOpener.openCurrentWorkSpace()
        await this.fileOpener.openFiles()
        await this.ldcShell.executeFrontCmd({ name: "openShell", passwd: "" }
        )
        await this.kubedge.init(path.join(this.mpData.rootDir,this.pData.projectRootDir,"deployment.yaml"))
        await this.kubedge.createNameSpace()
        if (this.pData.modifyOSCore) {

            let srcPath = path.join(
                this.mpData.rootDir,
                this.pData.projectRootDir
            );
            this.differ.getCheckSum(srcPath);

        }

    }
    acquireLock(): boolean {
        if (!this._lock) {
            this._lock = true;
            return this._lock;
        }
        else {
            return false;
        }
    }
    unLock(): void {
        this._lock = false
    }
    async submit(pid: string) {
        this.behaviorRecorder.submit()
        try {
            //如果是有config.json的自由编程类型实验,则需要从config.json里面获取配置信息
            if (!!this.pData.experimentType && this.pData.experimentType.trim() == "freecoding") {
                //解析文件夹中的config.json文件,将config.json里面的内容解析成为一个projectData类型的对象
                if (!await this.freeCodingDataService.parseProjectDataFromFile(this.pData))
                    return false;
                //将解析出来的projectData对象同步到multiData里面
                this.dataService.refreshMultiData()
            }
            //对于其他类型的实验，烧写配置信息已经放到multiProjectData里面了（之前在initPidInfo里面通过ajax里面已经获取到）
            //所以只需要从multiProjectData里面复制一份
            this.dService.copyDataFromDataMap(pid)

            //将烧写过程中的waitingID和hash置空
            this.dService.resetProgramData()

            //检测有没有与ldc连接， 提交代码到编译器编译烧写， 等待返回结果
            let res = await this.checkConnection() && await this.experimentController.submitQueue() && await this.eventCenter.waitNmsForBackValue<boolean>(this.eventDefinition.programState, 100000)
            if (res) {
                if (this.pData.ppid == "31") {
                    setTimeout(() => {
                        this.queryService.getLastWebUrl(this.ldd.lastCommitDevice!)
                    }, 3000)
                }
                if (this.pData.ppid == "33") {
                    setTimeout(() => {
                        this.queryService.getSocket(this.ldd.lastCommitDevice!)
                    }, 3000)
                }
            }
        } catch (error) {
            this.outputResult(error, "error")
        }
        finally {
            this.ldcShell.executeFrontCmd({
                name: "submitEnable",
                passwd: ""
            })
        }
    }
    async localSubmit(pid: string, tag: boolean = false) {
        try {
            if (!!this.pData.experimentType && this.pData.experimentType.trim() == "freecoding") {
                if (!await this.freeCodingDataService.parseProjectDataFromFile(this.pData))
                    return false;
                this.dataService.refreshMultiData()
            }
            this.dService.copyDataFromDataMap(pid)
            this.dService.resetProgramData()
            await this.experimentController.submitLocal(tag) && await this.eventCenter.waitNmsForBackValue<boolean>(this.eventDefinition.programState, 100000)

        } catch (error) {
            this.outputResult(error, "error")
        }
        finally {
            this.ldcShell.executeFrontCmd({
                name: "submitEnable",
                passwd: ""
            })
        }
    }
    async checkConnection() {
        this.outputResult("Checking the connection to ldc...")
        if (!this.lcc.isConnected()) {
            //连接ldc
            return await this.lcc.connect();

        } else if (this.dService.needReconnectServer() || true) {
            await this.lcc.disconnect()

            //将projectData中的ldcData部分摘录出来单独存放
            this.dService.copyLdcDataFromData()
            try {
                await this.eventCenter.waitEventNms("abc", 1000)
            } catch (error) {
                console.log(error)
            }

            return await this.lcc.connect()
        }
    }
    outputResult(res: string, type: string = "systemInfo") {
        this.ldcShell.outputResult(res, type);
    }
}