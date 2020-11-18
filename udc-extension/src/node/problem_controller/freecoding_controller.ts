import { FreeCodingDataService } from './../services/data_service/freecoding_data_service';
import { DataService } from './../services/data_service/data_service';
import { inject } from "inversify";
import { Data } from 'ws';

export class FreeCodingController {
    constructor(
        @inject(DataService) protected dService: DataService,
        @inject(FreeCodingDataService) protected freeCodingDataService: FreeCodingDataService
    ) {

    }
    // submit() {
    //     this.freeCodingDataService.convertSettingToProjectData()
    // }
}