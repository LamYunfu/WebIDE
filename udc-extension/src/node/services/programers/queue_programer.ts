import { DataService } from './../data_service/data_service';
import { ProgramerInterface } from "./interfaces/programer_interface";
import { inject, injectable } from "inversify";
import { ProjectData } from "../../data_center/project_data";
import { UserInfo } from "../../data_center/user_info";
import { LdcClientControllerInterface } from "../ldc/interfaces/ldc_client_controller_interface";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import {
  ProgramBurnDataFactory,
  QueueBurnElem,
} from "../../data_center/program_data";
import { DistributedCompiler } from "../compiler/ds_compiler";
@injectable()
export class QueueProgramer implements ProgramerInterface {
  constructor(
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(UserInfo) protected userInfo: UserInfo,
    @inject(LdcClientControllerInterface)
    protected lcc: LdcClientControllerInterface,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(DistributedCompiler) protected dsc: DistributedCompiler,
    @inject(DataService) protected dService: DataService,
    @inject(ProgramBurnDataFactory)
    protected programBurnDataFactory: ProgramBurnDataFactory
  ) { }
  async burn(): Promise<boolean> {
    console.log("start burning")
    let burnElems: QueueBurnElem[] = [];
    let projectData = this.projectData;
    let waitingId = []
    for (let i in projectData.subProjectArray) {
      let be = this.programBurnDataFactory.produceQueueBurnElem();
      be.address = projectData.address[i];
      be.model = projectData.subModelTypes[i];
      be.runtime = projectData.subTimeouts[i];
      be.filehash = projectData.fileHash[i];
      waitingId.push(be.waitingId)
      burnElems.push(be);
      projectData.subWaitingIds[i] = be.waitingId
    }

    let skt = this.programBurnDataFactory.produceQueueSketon();
    skt.pid = projectData.pid;
    skt.program = burnElems;
    this.dService.refreshMultiData()

    return await this.lcc.burn(skt);
  }
}
// 2bf7be2225f2fcc796177e057db2103c35260f62
// 2bf7be2225f2fcc796177e057db2103c35260f62