import { DataService } from './../data_service/data_service';
import { LdcData } from './../../data_center/ldc_data';
import { ProgramerInterface } from "./interfaces/programer_interface";
import { inject, injectable } from "inversify";
import { ProjectData } from "../../data_center/project_data";
import { UserInfo } from "../../data_center/user_info";
import { LdcClientControllerInterface } from "../ldc/interfaces/ldc_client_controller_interface";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import {
  ProgramBurnDataFactory,
  AdhocBurnElem,
} from "../../data_center/program_data";
import { DistributedCompiler } from "../compiler/ds_compiler";

@injectable()
export class AdhocProgramer implements ProgramerInterface {
  constructor(
    @inject(DataService) protected dService: DataService,
    @inject(ProjectData) protected projectData: ProjectData,
    @inject(UserInfo) protected userInfo: UserInfo,
    @inject(LdcClientControllerInterface)
    protected lcc: LdcClientControllerInterface,
    @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    @inject(DistributedCompiler) protected dsc: DistributedCompiler,
    @inject(ProgramBurnDataFactory)
    protected programBurnDataFactory: ProgramBurnDataFactory
  ) { }
  async burn(): Promise<boolean> {
    console.log("start burning")
    let burnElems: AdhocBurnElem[] = [];
    let projectData = this.projectData;
    for (let i in projectData.subProjectArray) {
      let be = this.programBurnDataFactory.produceAdhocBurnElem();
      be.address = projectData.address[i];
      be.clientId = projectData.subClientId[i];
      be.devPort = projectData.subClientPort[i];
      be.runtime = projectData.subTimeouts[i];
      be.filehash = projectData.fileHash[i];
      projectData.subWaitingIds[i] = be.waitingId
      burnElems.push(be);
    }
    let skt = this.programBurnDataFactory.produceAdhocSketon();
    skt.pid = projectData.pid;
    skt.program = burnElems;
    this.dService.refreshMultiData()
    return await this.lcc.burn(skt);
  }
}
