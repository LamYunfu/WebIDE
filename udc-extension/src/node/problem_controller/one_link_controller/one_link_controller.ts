import { TinySim } from './../../services/tinysim/tinysim';
import { OneLinkData } from './../../data_center/one_link_data';
import { injectable, inject, interfaces } from "inversify";
import { OneLinkDataService } from "../../services/data_service/onelink_data_service";
export function bindOneLinkController(bind: interfaces.Bind) {
    bind(OneLinkController).toSelf().inSingletonScope()
}
@injectable()
export class OneLinkController {
    constructor(
        @inject(OneLinkDataService) protected oneLinkDataService: OneLinkDataService,
        @inject(OneLinkData) protected oneLinkData: OneLinkData,
        @inject(TinySim) protected tinySim: TinySim
    ) {

    }
    async submit(pid: string) {
        this.oneLinkDataService.parseVirtualConfig(pid)
        this.oneLinkDataService.getCurrentDir()
        let simServer = this.oneLinkData.projects![0].simServer!
        return await this.tinySim.virtualSubmit(simServer, this.oneLinkDataService.getCurrentDir())
    }
}