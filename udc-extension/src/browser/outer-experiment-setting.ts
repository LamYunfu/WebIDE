import { UdcService } from '../common/udc-service';
import { inject, injectable } from "inversify";

@injectable()
export class OutExperimentSetting{//需要依靠其他组件实现的实验设置目前包含科研版跟本地烧写research & local_burn 
    constructor(@inject(UdcService) readonly udc :UdcService){
    }
    private _expType: string = "local_burn"; 
    public get expType(): string {
        return this._expType;
    }
    public set expType(value: string) {

        this._expType = value;
    }
    
}