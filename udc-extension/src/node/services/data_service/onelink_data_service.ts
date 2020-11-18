
import { OneLinkData } from './../../data_center/one_link_data';
import { ProjectData } from './../../data_center/project_data';
import { MultiProjectData } from './../../data_center/multi_project_data';
import * as fs from "fs-extra"
import * as path from "path"
import { inject, injectable } from "inversify";
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { LdcShellInterface } from '../ldc_shell/interfaces/ldc_shell_interface';
@injectable()
export class OneLinkDataService {
    constructor(@inject(MultiProjectData) readonly multiProjectData: MultiProjectData,
        @inject(ProjectData) readonly projectData: ProjectData,
        @inject(OneLinkData) readonly oneLinkData: OneLinkData,
        @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface) {

    }
    getCurrentDir() {
        return path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir)
    }
    parseVirtualConfig(pid: string) {
        let currentDir = this.getCurrentDir()
        let infoRaw: any;
        let info: any;
        try {
            infoRaw = fs.readFileSync(
                path.join(currentDir, "config.json")
            );
            info = JSON.parse(infoRaw.toString("utf8"))
            console.log(JSON.stringify(info));
            let jc = new JsonConvert();
            jc.operationMode = OperationMode.ENABLE; // print some debug data
            jc.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
            jc.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL;
            let oneLinkData = jc.deserializeObject(info, OneLinkData)
            Object.assign(this.oneLinkData, oneLinkData)
        } catch (error) {
            this.outputResult(`Failed to parse config.json:${error}`, "err");
            return;
        }
    }
    outputResult(res: string, type: string = "systemInfo") {
        this.ldcShell.outputResult(res, type);
    }

}