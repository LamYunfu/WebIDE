import { OneLinkDataService } from './onelink_data_service';
import { LinkedgeDataService } from './linkedge_data_service';
import { TrainDataService } from './train_data_service';
import { FreeCodingDataService } from './freecoding_data_service';
import { DataService } from './data_service';
import { interfaces } from 'inversify';
export function bindDataService(bind: interfaces.Bind) {

    bind(DataService).toSelf().inSingletonScope()
    bind(FreeCodingDataService).toSelf().inSingletonScope()
    bind(TrainDataService).toSelf().inSingletonScope()
    bind(LinkedgeDataService).toSelf().inSingletonScope()
    bind(OneLinkDataService).toSelf().inSingletonScope()
}