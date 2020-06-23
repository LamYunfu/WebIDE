import { FreeCodingDataService } from './freecoding_data_service';
import { DataService } from './data_service';
import { interfaces } from 'inversify';
export function bindDataService(bind: interfaces.Bind) {

    bind(DataService).toSelf().inSingletonScope()
    bind(FreeCodingDataService).toSelf().inSingletonScope()
}