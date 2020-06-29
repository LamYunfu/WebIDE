import { injectable, inject } from "inversify";
import { ModelTrainer } from "../../services/model_trainer.ts/model_trainer";

@injectable()
export class TrainExperimentController {
    constructor(@inject(ModelTrainer) protected mt: ModelTrainer) {
    }
    async submit(pid: string): Promise<boolean> {
        let td = this.mt.parseAIConfig()
        if (td == null) {
            return false
        }
        let cp = td.projects![0]
        return await !!this.mt.connect(cp.trainServer!) && await !!this.mt.train(cp.projectName!, cp.trainServer!)
    }
}