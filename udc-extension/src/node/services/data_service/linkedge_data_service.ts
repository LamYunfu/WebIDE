import { LdcShellInterface } from '../../../../lib/node/services/ldc_shell/interfaces/ldc_shell_interface';
import { MultiProjectData } from '../../data_center/multi_project_data';
import { ProjectData } from '../../data_center/project_data';
import { injectable, inject } from "inversify";
import * as fs from "fs-extra"
import * as path from "path"

@injectable()
export class LinkedgeDataService {
    constructor(
        @inject(MultiProjectData) protected multiProjectData: MultiProjectData,
        @inject(ProjectData) protected projectData: ProjectData,
        @inject(LdcShellInterface) protected ldcShell: LdcShellInterface
    ) {
    }
    getIotId(): string {
        try {
            let raw = fs
                .readFileSync(
                    path.join(this.multiProjectData.rootDir, this.projectData.projectRootDir, "Config", "config.json")
                )
                .toString();
            let ob = JSON.parse(raw);
            return ob["IoTId"];
        } catch (error) {
            this.outputResult("The config.json is incorrect!\nPlease check it or restore it to default!", "err");
            return "";
        }
    }
    outputResult(res: string, type: string = "systemInfo") {
        this.ldcShell.outputResult(res, type);
    }
}