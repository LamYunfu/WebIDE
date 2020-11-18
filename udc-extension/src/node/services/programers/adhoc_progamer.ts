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
  //在文件编译的过程中其实编译器会保存编译好的文件，烧写其实就是给保存好的文件一个hash标识，烧写服务会根据hash标识定位文件来烧写
  async burn(): Promise<boolean> {
    console.log("start burning")
    let burnElems: AdhocBurnElem[] = [];
    let projectData = this.projectData;
    for (let i in projectData.subProjectArray) {
      //生成一个烧写对象
      let be = this.programBurnDataFactory.produceAdhocBurnElem();
      be.address = projectData.address[i];
      be.clientId = projectData.subClientId[i];
      be.devPort = projectData.subClientPort[i];
      be.runtime = projectData.subTimeouts[i];
      be.filehash = projectData.fileHash[i];
      projectData.subWaitingIds[i] = be.waitingId
      burnElems.push(be);
    }
    // 一个skt对象里面包含多个be对象，skt代表的是一次实验的一组烧写对象
    let skt = this.programBurnDataFactory.produceAdhocSketon();
    skt.pid = projectData.pid;
    skt.program = burnElems;
    this.dService.refreshMultiData()
    return await this.lcc.burn(skt);
  }
}
