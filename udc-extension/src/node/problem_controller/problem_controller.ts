import { FreeCodingDataService } from './../services/data_service/freecoding_data_service';
import { LdcClientControllerInterface } from './../services/ldc/interfaces/ldc_client_controller_interface';
import { EventCenter } from './../services/tools/event_center';
import { FileTemplate } from './../services/file_template/file_template';
import { FileOpener } from './../services/opener/file_openner';
import { LdcShellInterface } from './../services/ldc_shell/interfaces/ldc_shell_interface';
import { DistributedCompiler } from './../services/compiler/ds_compiler';
import { ProjectData } from './../data_center/project_data';
import { DataService } from './../services/data_service/data_service';
import { injectable, inject } from "inversify";
import { ExperimentController } from './experiment_controller/experiment_controller';
import { MultiProjectData } from '../data_center/multi_project_data';
import * as path from "path"
import * as fs from "fs-extra"

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
        @inject(EventCenter) protected eventCenter: EventCenter) {
    }
    async init(info: string) {
        console.log("---init problem---")
        await this.dataService.initDataMapFromFrontEnd(info)
        await this.fileTemplate.buildAllProjects()
        await this.freeCodingDataService.parseAllData()
        await this.fileOpener.openCurrentWorkSpace()
        await this.fileOpener.openFiles()
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
        if (!this.acquireLock()) {
            this.outputResult("please wait until last submit is complete")
        }
        if (!!this.pData.experimentType && this.pData.experimentType.trim() == "freecoding") {
            await this.freeCodingDataService.parseProjectDataFromFile(this.pData)
        }
        this.dService.copyDataFromDataMap(pid)
        await this.checkConnection()
        await this.experimentController.submitQueue()
        this.unLock()
        this.ldcShell.executeFrontCmd({
            name: "submitEnable",
            passwd: ""
        })
    }
    async checkConnection() {
        this.outputResult("Checking the connection to ldc...")
        if (!this.lcc.isConnected()) {
            return await this.lcc.connect();

        } else if (this.dService.needReconnectServer() || true) {
            await this.lcc.disconnect()

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